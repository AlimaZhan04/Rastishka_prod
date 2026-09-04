import { GET } from "./route";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/server/admin-auth";
import { logServerError } from "@/lib/observability";
import type { CurrentAdmin } from "@/lib/admin-permissions";

jest.mock("@/lib/db", () => ({ prisma: { resumeFile: { findUnique: jest.fn() } } }));
jest.mock("@/lib/observability", () => ({ logServerError: jest.fn() }));
jest.mock("@/lib/server/admin-auth", () => ({
  getCurrentAdmin: jest.fn(),
  hasAdminPermission: jest.requireActual("@/lib/admin-permissions").hasAdminPermission,
}));

const id = "44c2f1bd-9815-4617-a860-fbf36467470d";
const admin: CurrentAdmin = {
  id: "admin",
  name: "Admin",
  login: "admin",
  role: "ADMIN",
  canViewResponses: false,
  canViewApplications: false,
};
const request = () =>
  GET(new Request(`http://localhost/api/admin/resumes/${id}`), { params: Promise.resolve({ id }) });

describe("private resume download", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getCurrentAdmin).mockResolvedValue(admin);
  });

  it("denies anonymous or disabled accounts before reading file data", async () => {
    jest.mocked(getCurrentAdmin).mockResolvedValue(null);
    const response = await request();
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(prisma.resumeFile.findUnique).not.toHaveBeenCalled();
  });

  it("denies a content manager without response access", async () => {
    jest.mocked(getCurrentAdmin).mockResolvedValue({ ...admin, role: "CONTENT_MANAGER" });
    expect((await request()).status).toBe(403);
    expect(prisma.resumeFile.findUnique).not.toHaveBeenCalled();
  });

  it("returns an uncached attachment with exact bytes and safe UTF-8 filename", async () => {
    const bytes = new Uint8Array([37, 80, 68, 70, 0, 255]);
    const fileName = 'Резюме "candidate"\r\n.pdf';
    jest
      .mocked(prisma.resumeFile.findUnique)
      .mockResolvedValue({
        content: bytes,
        fileName,
        mimeType: "application/pdf",
        size: bytes.length,
      } as never);
    const response = await request();
    expect(response.status).toBe(200);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Length")).toBe(String(bytes.length));
    expect(response.headers.get("Content-Disposition")).toContain("attachment;");
    expect(response.headers.get("Content-Disposition")).toContain(encodeURIComponent(fileName));
    expect(response.headers.get("Content-Disposition")).not.toMatch(/[\r\n]/);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("Vary")).toBe("Cookie");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("allows explicitly permitted managers and handles missing files", async () => {
    jest
      .mocked(getCurrentAdmin)
      .mockResolvedValue({ ...admin, role: "CONTENT_MANAGER", canViewResponses: true });
    jest.mocked(prisma.resumeFile.findUnique).mockResolvedValue(null);
    expect((await request()).status).toBe(404);
    expect(prisma.resumeFile.findUnique).toHaveBeenCalled();
  });

  it("rechecks permission on the next request after access is revoked", async () => {
    jest
      .mocked(getCurrentAdmin)
      .mockResolvedValueOnce({ ...admin, role: "CONTENT_MANAGER", canViewResponses: true })
      .mockResolvedValueOnce({ ...admin, role: "CONTENT_MANAGER", canViewResponses: false });
    jest.mocked(prisma.resumeFile.findUnique).mockResolvedValue(null);
    expect((await request()).status).toBe(404);
    expect((await request()).status).toBe(403);
    expect(prisma.resumeFile.findUnique).toHaveBeenCalledTimes(1);
  });

  it("does not expose database exceptions to the caller", async () => {
    jest
      .mocked(prisma.resumeFile.findUnique)
      .mockRejectedValue(new Error("sensitive connection detail"));
    const response = await request();
    expect(response.status).toBe(503);
    expect(await response.text()).toBe("");
    expect(logServerError).toHaveBeenCalled();
  });
});
