import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { deriveChildProfile } from "@/lib/derive/childProfile";
import {
  APPLICATION_CONSENT_VERSION,
  type ApplicationInput,
} from "@/lib/application-submission";

function submissionHash(idempotencyKey: string): string {
  return createHash("sha256").update(idempotencyKey).digest("hex");
}
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * Saves the raw answers and the derived draft profile atomically. A reused idempotency
 * key is deliberately treated as a successful submission, so a retry never creates a copy.
 */
export async function saveApplication(input: ApplicationInput, idempotencyKey: string): Promise<void> {
  const profile = deriveChildProfile(input);

  try {
    await prisma.application.create({
      data: {
        visitFormat: input.visitFormat,
        individualNote: input.individualNote || null,
        speech: input.speech,
        behavior: input.behavior,
        behaviorNote: input.behaviorNote || null,
        toilet: input.toilet,
        food: input.food,
        previousExperience: input.previousExperience,
        parentName: input.parentName,
        phone: input.phone,
        consentGiven: input.consent,
        consentAt: new Date(),
        consentVersion: APPLICATION_CONSENT_VERSION,
        sourcePage: input.source?.page || null,
        sourceCta: input.source?.cta || null,
        utmSource: input.source?.utmSource || null,
        utmMedium: input.source?.utmMedium || null,
        utmCampaign: input.source?.utmCampaign || null,
        submissionHash: submissionHash(idempotencyKey),
        childProfile: { create: profile },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return;
    throw error;
  }
}
