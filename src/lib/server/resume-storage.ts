import "server-only";

import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { prisma } from "@/lib/db";
import { validateResumeFile, type ResumeFileMeta } from "@/lib/validation/file";
import { isDetectedResumeTypeCompatible } from "@/lib/validation/resume-content";

/** Server-only payload. Bytes must never be returned from an action or a page. */
export type PreparedResume = ResumeFileMeta & { content: Uint8Array<ArrayBuffer> };

export class InvalidResumeContentError extends Error {
  constructor() {
    super("Resume content does not match its declared type");
    this.name = "InvalidResumeContentError";
  }
}

/** Validates without persisting; the repository saves bytes and response atomically. */
export async function prepareResume(file: File): Promise<PreparedResume> {
  const validation = validateResumeFile(file);
  if (!validation.ok) throw new InvalidResumeContentError();

  const content = new Uint8Array(await file.arrayBuffer());
  if (content.byteLength !== file.size) throw new InvalidResumeContentError();
  const detected = await fileTypeFromBuffer(content);
  if (
    !isDetectedResumeTypeCompatible({
      extension: validation.extension,
      declaredMime: file.type,
      detectedMime: detected?.mime,
    })
  ) {
    throw new InvalidResumeContentError();
  }

  return {
    key: randomUUID(),
    fileName: file.name,
    mimeType: file.type as ResumeFileMeta["mimeType"],
    size: content.byteLength,
    content,
  };
}

/** Not a public or signed URL: the download handler rechecks current permissions. */
export async function getResumeDownloadUrl(key: string): Promise<string | null> {
  const file = await prisma.resumeFile.findUnique({ where: { id: key }, select: { id: true } });
  return file ? `/api/admin/resumes/${encodeURIComponent(file.id)}` : null;
}
