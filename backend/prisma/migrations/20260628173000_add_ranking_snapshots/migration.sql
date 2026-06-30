-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "bestWeight" DECIMAL(8,2) NOT NULL,
    "bestReps" INTEGER NOT NULL,
    "currentRank" INTEGER NOT NULL,
    "percentile" DECIMAL(5,2) NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RankingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RankingSnapshot_userId_exerciseId_key" ON "RankingSnapshot"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "RankingSnapshot_exerciseId_currentRank_idx" ON "RankingSnapshot"("exerciseId", "currentRank");

-- CreateIndex
CREATE INDEX "RankingSnapshot_exerciseId_bestWeight_bestReps_achievedAt_idx" ON "RankingSnapshot"("exerciseId", "bestWeight", "bestReps", "achievedAt");

-- CreateIndex
CREATE INDEX "RankingSnapshot_userId_idx" ON "RankingSnapshot"("userId");

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
