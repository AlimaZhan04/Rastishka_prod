-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VisitFormat" AS ENUM ('FULL_DAY', 'MORNING', 'LUNCH', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "SpeechLevel" AS ENUM ('AGE_APPROPRIATE', 'DELAYED', 'NON_VERBAL');

-- CreateEnum
CREATE TYPE "BehaviorState" AS ENUM ('NO_ISSUES', 'HAS_ISSUES');

-- CreateEnum
CREATE TYPE "ToiletLevel" AS ENUM ('TRAINED', 'NEEDS_PROMPTING', 'NOT_TRAINED');

-- CreateEnum
CREATE TYPE "FoodSkill" AS ENUM ('INDEPENDENT', 'NO_UTENSILS', 'SELECTIVE', 'NO_SOLIDS');

-- CreateEnum
CREATE TYPE "PrevExperience" AS ENUM ('KINDERGARTEN', 'PRIVATE_LESSONS', 'NONE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CONTACTED', 'ENROLLED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('NEW', 'IN_REVIEW', 'INVITED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'CONTENT_MANAGER');

-- CreateEnum
CREATE TYPE "NotificationEvent" AS ENUM ('NEW_APPLICATION', 'NEW_RESPONSE', 'NOTIFICATION_ERROR');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('TELEGRAM', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "visitFormat" "VisitFormat" NOT NULL,
    "individualNote" VARCHAR(200),
    "speech" "SpeechLevel" NOT NULL,
    "behavior" "BehaviorState" NOT NULL,
    "behaviorNote" VARCHAR(200),
    "toilet" "ToiletLevel" NOT NULL,
    "food" "FoodSkill"[],
    "previousExperience" "PrevExperience" NOT NULL,
    "parentName" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT 'v1',
    "sourcePage" TEXT,
    "sourceCta" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "adminComment" TEXT,
    "responsibleId" TEXT,
    "nextContactAt" TIMESTAMP(3),
    "submissionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "speechLevelText" TEXT NOT NULL,
    "behaviorNotes" TEXT NOT NULL,
    "selfCare" TEXT NOT NULL,
    "foodNotes" TEXT NOT NULL,
    "adaptationExperience" TEXT NOT NULL,
    "recommendedRoute" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacancy" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "preview" VARCHAR(100) NOT NULL,
    "duties" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "icon" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
    "seoTitle" VARCHAR(180),
    "seoDescription" VARCHAR(320),
    "ogImage" TEXT,
    "responsesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VacancyResponse" (
    "id" TEXT NOT NULL,
    "vacancyId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "resumeFilePath" TEXT,
    "resumeFileName" TEXT,
    "resumeMimeType" TEXT,
    "resumeSize" INTEGER,
    "experienceText" VARCHAR(2000),
    "status" "ResponseStatus" NOT NULL DEFAULT 'NEW',
    "adminComment" TEXT,
    "responsibleId" TEXT,
    "submissionHash" TEXT NOT NULL,
    "sourcePage" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VacancyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "shortText" VARCHAR(500) NOT NULL,
    "fullText" TEXT NOT NULL,
    "image" TEXT,
    "alt" VARCHAR(200),
    "date" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT NOT NULL,
    "seoTitle" VARCHAR(180),
    "seoDescription" VARCHAR(320),
    "ogImage" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'CONTENT_MANAGER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "canViewApplications" BOOLEAN NOT NULL DEFAULT false,
    "canViewResponses" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "eventType" "NotificationEvent" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "applicationId" TEXT,
    "vacancyResponseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT true,
    "telegramChatId" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappTo" TEXT,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailRecipients" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_submissionHash_key" ON "Application"("submissionHash");

-- CreateIndex
CREATE INDEX "Application_status_createdAt_idx" ON "Application"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Application_phone_idx" ON "Application"("phone");

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChildProfile_applicationId_key" ON "ChildProfile"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Vacancy_slug_key" ON "Vacancy"("slug");

-- CreateIndex
CREATE INDEX "Vacancy_status_sortOrder_idx" ON "Vacancy"("status", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VacancyResponse_submissionHash_key" ON "VacancyResponse"("submissionHash");

-- CreateIndex
CREATE INDEX "VacancyResponse_vacancyId_status_idx" ON "VacancyResponse"("vacancyId", "status");

-- CreateIndex
CREATE INDEX "VacancyResponse_status_createdAt_idx" ON "VacancyResponse"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_status_date_idx" ON "News"("status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_login_key" ON "AdminUser"("login");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AdminUser_role_active_idx" ON "AdminUser"("role", "active");

-- CreateIndex
CREATE INDEX "NotificationLog_status_eventType_idx" ON "NotificationLog"("status", "eventType");

-- CreateIndex
CREATE INDEX "NotificationLog_applicationId_idx" ON "NotificationLog"("applicationId");

-- CreateIndex
CREATE INDEX "NotificationLog_vacancyResponseId_idx" ON "NotificationLog"("vacancyResponseId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacancyResponse" ADD CONSTRAINT "VacancyResponse_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VacancyResponse" ADD CONSTRAINT "VacancyResponse_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_vacancyResponseId_fkey" FOREIGN KEY ("vacancyResponseId") REFERENCES "VacancyResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
