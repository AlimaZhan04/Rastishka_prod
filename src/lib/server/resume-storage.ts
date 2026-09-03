import "server-only";

import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { fileTypeFromBuffer } from "file-type";
import { validateResumeFile, type ResumeFileMeta } from "@/lib/validation/file";
import { isDetectedResumeTypeCompatible } from "@/lib/validation/resume-content";

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

/** Uploads to a private bucket; no public URL is created or returned. */
export async function uploadResume(file: File, vacancyId: string): Promise<ResumeFileMeta> {
  const validation = validateResumeFile(file);
  if (!validation.ok) throw new InvalidResumeContentError();

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  if (
    !isDetectedResumeTypeCompatible({
      extension: validation.extension,
      declaredMime: file.type,
      detectedMime: detected?.mime,
    })
  ) {
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

/** Produces a short-lived private download link only for an authenticated admin view. */
export async function createResumeDownloadUrl(key: string): Promise<string | null> {
  try {
    const storage = getStorageClient();
    const { data, error } = await storage.storage.from(RESUME_BUCKET).createSignedUrl(key, 60);
    return error ? null : data.signedUrl;
  } catch {
    return null;
  }
}
