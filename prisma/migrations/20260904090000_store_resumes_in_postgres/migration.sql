BEGIN;

-- Do not silently abandon files if an older deployment ever used external storage.
-- Export/import any such files before retrying this migration.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "VacancyResponse" WHERE "resumeFilePath" IS NOT NULL) THEN
    RAISE EXCEPTION 'External resume references exist. Import these files before migrating resume storage.';
  END IF;
END $$;

CREATE TABLE "ResumeFile" (
  "id" TEXT NOT NULL,
  "vacancyResponseId" TEXT NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "content" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResumeFile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ResumeFile_size_check" CHECK ("size" > 0 AND "size" <= 10485760 AND octet_length("content") = "size"),
  CONSTRAINT "ResumeFile_mimeType_check" CHECK ("mimeType" IN (
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png'
  ))
);

CREATE UNIQUE INDEX "ResumeFile_vacancyResponseId_key" ON "ResumeFile"("vacancyResponseId");
ALTER TABLE "ResumeFile" ADD CONSTRAINT "ResumeFile_vacancyResponseId_fkey"
  FOREIGN KEY ("vacancyResponseId") REFERENCES "VacancyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
