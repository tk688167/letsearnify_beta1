-- CreateTable
CREATE TABLE "SurpriseWinner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "userEmail" TEXT,
    "spinType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminRewardNote" TEXT,
    "rewardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurpriseWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurpriseWinner_userId_idx" ON "SurpriseWinner"("userId");

-- CreateIndex
CREATE INDEX "SurpriseWinner_status_idx" ON "SurpriseWinner"("status");

-- AddForeignKey
ALTER TABLE "SurpriseWinner" ADD CONSTRAINT "SurpriseWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
