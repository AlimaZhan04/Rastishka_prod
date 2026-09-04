import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { VACANCY_RESPONSE_CONSENT_VERSION } from "@/lib/vacancy-response-submission";
import type { VacancyResponseInput } from "@/lib/validation/vacancyResponse";
import type { PreparedResume } from "@/lib/server/resume-storage";

export class VacancyUnavailableError extends Error {
  constructor() {
    super("Vacancy unavailable");
    this.name = "VacancyUnavailableError";
  }
}

function submissionHash(idempotencyKey: string): string {
  return createHash("sha256").update(`vacancy-response:${idempotencyKey}`).digest("hex");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function assertVacancyIsPublished(vacancyId: string): Promise<void> {
  const vacancy = await prisma.vacancy.findFirst({
    where: { id: vacancyId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!vacancy) throw new VacancyUnavailableError();
}

export type SavedVacancyResponse = { vacancyResponseId: string; created: boolean };

/** Response, file bytes and counter either all commit or all roll back. */
export async function saveVacancyResponse(
  input: Omit<VacancyResponseInput, "resume"> & { resume?: PreparedResume },
  idempotencyKey: string,
): Promise<SavedVacancyResponse> {
  const hash = submissionHash(idempotencyKey);
  try {
    return await prisma.$transaction(
      async (tx) => {
        const vacancy = await tx.vacancy.findFirst({
          where: { id: input.vacancyId, status: "PUBLISHED" },
          select: { id: true },
        });
        if (!vacancy) throw new VacancyUnavailableError();

        const response = await tx.vacancyResponse.create({
          data: {
            vacancyId: input.vacancyId,
            name: input.name,
            phone: input.phone,
            resumeFilePath: input.resume?.key || null,
            resumeFileName: input.resume?.fileName || null,
            resumeMimeType: input.resume?.mimeType || null,
            resumeSize: input.resume?.size || null,
            resumeFile: input.resume
              ? {
                  create: {
                    id: input.resume.key,
                    fileName: input.resume.fileName,
                    mimeType: input.resume.mimeType,
                    size: input.resume.size,
                    content: input.resume.content,
                  },
                }
              : undefined,
            experienceText: input.experienceText || null,
            consentGiven: input.consent,
            consentAt: new Date(),
            consentVersion: VACANCY_RESPONSE_CONSENT_VERSION,
            sourcePage: input.source?.page || null,
            submissionHash: hash,
          },
          select: { id: true },
        });
        await tx.vacancy.update({
          where: { id: vacancy.id },
          data: { responsesCount: { increment: 1 } },
        });
        return { vacancyResponseId: response.id, created: true };
      },
      {
        // Serializing and storing a validated 10 MiB bytea can exceed Prisma's 5s default.
        // Keep the transaction bounded while allowing the documented maximum file size.
        timeout: 30_000,
      },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const existing = await prisma.vacancyResponse.findUnique({
        where: { submissionHash: hash },
        select: { id: true },
      });
      if (existing) return { vacancyResponseId: existing.id, created: false };
    }
    throw error;
  }
}
