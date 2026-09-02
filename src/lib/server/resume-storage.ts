import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { fileTypeFromBuffer } from "file-type";
import { validateResumeFile, type ResumeFileMeta } from "@/lib/validation/file";

const RESUME_BUCKET = "resumes";

export class ResumeStorageUnavailableError extends Error {
  constructor() {
    super("Resume storage is not configured");
    this.name = "ResumeStorageUnavailableError";
  }
}

export class InvalidResumeContentError extends Error {
  constructor() {
    super("Resume content does not match its declared type");
    this.name = "InvalidResumeContentError";
  }
}

function getStorageClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) throw new ResumeStorageUnavailableError();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isDetectedTypeCompatible(file: File, detectedMime: string): boolean {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (extension === ".docx") return detectedMime === "application/zip";
  if (extension === ".doc") return detectedMime === "application/x-cfb";
  return detectedMime === file.type;
}

/** Uploads to a private bucket; no public URL is created or returned. */
export async function uploadResume(file: File, vacancyId: string): Promise<ResumeFileMeta> {
  const validation = validateResumeFile(file);
  if (!validation.ok) throw new InvalidResumeContentError();

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  if (detected && !isDetectedTypeCompatible(file, detected.mime)) {
    throw new InvalidResumeContentError();
  }

  const key = `vacancy-responses/${vacancyId}/${randomUUID()}${validation.extension}`;
  const storage = getStorageClient();
  const { error } = await storage.storage.from(RESUME_BUCKET).upload(key, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new ResumeStorageUnavailableError();

  return {
    key,
    fileName: file.name,
    mimeType: file.type as ResumeFileMeta["mimeType"],
    size: file.size,
  };
}

/** Best-effort cleanup if persistence fails after an upload. */
export async function deleteResume(key: string): Promise<void> {
  try {
    const storage = getStorageClient();
    await storage.storage.from(RESUME_BUCKET).remove([key]);
  } catch {
    // No PII or object path is emitted to logs; an orphaned private file is safer than a failed form.
  }
}
