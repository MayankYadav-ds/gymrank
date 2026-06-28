-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UnitPreference" AS ENUM ('KG', 'LB');

-- CreateEnum
CREATE TYPE "SexCategory" AS ENUM ('MALE', 'FEMALE', 'OPEN', 'PREFER_NOT_TO_SAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "country" TEXT,
    "unitPreference" "UnitPreference" NOT NULL DEFAULT 'KG',
    "dateOfBirth" TIMESTAMP(3),
    "sexCategory" "SexCategory",
    "bodyweight" DECIMAL(6,2),
    "rankingParticipationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_country_idx" ON "User"("country");

-- CreateIndex
CREATE INDEX "User_sexCategory_idx" ON "User"("sexCategory");

-- CreateIndex
CREATE INDEX "User_rankingParticipationEnabled_idx" ON "User"("rankingParticipationEnabled");
