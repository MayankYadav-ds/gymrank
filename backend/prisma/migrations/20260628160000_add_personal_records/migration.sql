-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "workoutSetId" TEXT NOT NULL,
    "weight" DECIMAL(8,2) NOT NULL,
    "reps" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_workoutSetId_key" ON "PersonalRecord"("workoutSetId");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_exerciseId_achievedAt_idx" ON "PersonalRecord"("userId", "exerciseId", "achievedAt");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_achievedAt_idx" ON "PersonalRecord"("userId", "achievedAt");

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_workoutSetId_fkey" FOREIGN KEY ("workoutSetId") REFERENCES "WorkoutSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
