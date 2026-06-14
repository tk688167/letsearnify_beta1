-- Sync state migration to match schema.prisma with current database
-- This migration records the changes that were already applied via db push

-- AlterTable (DailyEarningInvestment)
ALTER TABLE "DailyEarningInvestment" ADD COLUMN IF NOT EXISTS "nextCycleAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "DailyEarningInvestment_nextCycleAt_idx" ON "DailyEarningInvestment"("nextCycleAt");

-- AlterTable (ReferralCommission)
ALTER TABLE "ReferralCommission" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'MLM';

-- AlterTable (Transaction)
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "convertedAmount" DOUBLE PRECISION;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "currency" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "exchangeRate" DOUBLE PRECISION;

-- AlterTable (User)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "poolInvestorShare" DOUBLE PRECISION NOT NULL DEFAULT 80.0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "poolReferrerShare" DOUBLE PRECISION NOT NULL DEFAULT 20.0;
ALTER TABLE "User" ALTER COLUMN "currency" SET DEFAULT 'PKR';

-- AlterTable (UserNotification)
ALTER TABLE "UserNotification" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'GENERAL';
