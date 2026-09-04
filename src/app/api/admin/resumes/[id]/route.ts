import { prisma } from "@/lib/db";
import { getCurrentAdmin, hasAdminPermission } from "@/lib/server/admin-auth";
import { logServerError } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentAdmin();
    if (!user) return new Response(null, { status: 401, headers: privateHeaders });
    if (!hasAdminPermission(user, "responses"))
      return new Response(null, { status: 403, headers: privateHeaders });

    const { id } = await params;
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id))
      return new Response(null, { status: 404, headers: privateHeaders });

    // No bytes are queried until the caller's active account and role have been checked.
    const file = await prisma.resumeFile.findUnique({
      where: { id },
      select: { content: true, mimeType: true, fileName: true, size: true },
    });
    if (!file) return new Response(null, { status: 404, headers: privateHeaders });

    const name = encodeURIComponent(file.fileName).replace(
      /[!'()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    return new Response(Uint8Array.from(file.content), {
      headers: {
        ...privateHeaders,
        "Content-Type": file.mimeType,
        "Content-Length": String(file.size),
        "Content-Disposition": `attachment; filename="resume"; filename*=UTF-8''${name}`,
      },
    });
  } catch (error) {
    logServerError("vacancy_response.download_failed", error);
    return new Response(null, { status: 503, headers: privateHeaders });
  }
}
