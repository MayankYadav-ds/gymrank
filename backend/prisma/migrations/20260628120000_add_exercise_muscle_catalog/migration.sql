-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'HYPERTROPHY', 'BODYWEIGHT', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MuscleRegion" AS ENUM ('FRONT', 'BACK', 'BOTH');

-- CreateEnum
CREATE TYPE "MuscleTargetRole" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateTable
CREATE TABLE "Muscle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" "MuscleRegion" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Muscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "equipment" TEXT NOT NULL,
    "difficulty" "ExerciseDifficulty" NOT NULL,
    "isTrackedLift" BOOLEAN NOT NULL DEFAULT false,
    "trackedLiftId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMuscle" (
    "exerciseId" TEXT NOT NULL,
    "muscleId" TEXT NOT NULL,
    "role" "MuscleTargetRole" NOT NULL,

    CONSTRAINT "ExerciseMuscle_pkey" PRIMARY KEY ("exerciseId","muscleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_trackedLiftId_key" ON "Exercise"("trackedLiftId");

-- CreateIndex
CREATE INDEX "Exercise_name_idx" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_isTrackedLift_idx" ON "Exercise"("isTrackedLift");

-- CreateIndex
CREATE INDEX "ExerciseMuscle_muscleId_idx" ON "ExerciseMuscle"("muscleId");

-- CreateIndex
CREATE INDEX "ExerciseMuscle_role_idx" ON "ExerciseMuscle"("role");

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_muscleId_fkey" FOREIGN KEY ("muscleId") REFERENCES "Muscle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
