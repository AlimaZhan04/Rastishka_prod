-- Consent for vacancy responses is personal-data processing evidence and must be retained
-- alongside each response, just like consent for enrolment applications.
ALTER TABLE "VacancyResponse"
ADD COLUMN "consentGiven" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "consentVersion" TEXT NOT NULL DEFAULT 'v1';
