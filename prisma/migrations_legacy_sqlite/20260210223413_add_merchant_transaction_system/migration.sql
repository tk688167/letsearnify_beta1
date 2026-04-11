/*
  Warnings:

  - You are about to drop the column `points` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `points` on the `TierConfiguration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MerchantPaymentMethod" ADD COLUMN "accountName" TEXT;
ALTER TABLE "MerchantPaymentMethod" ADD COLUMN "accountNumber" TEXT;
ALTER TABLE "MerchantPaymentMethod" ADD COLUMN "instructions" TEXT;

-- CreateTable
CREATE TABLE "MerchantTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "screenshot" TEXT,
    "accountNumber" TEXT,
    "accountName" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MerchantTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "emailVerified" DATETIME,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "balance" REAL NOT NULL DEFAULT 0.0,
    "tier" TEXT NOT NULL DEFAULT 'NEWBIE',
    "tierStatus" TEXT NOT NULL DEFAULT 'CURRENT',
    "arnBalance" REAL NOT NULL DEFAULT 0.0,
    "referralCode" TEXT,
    "referredByCode" TEXT,
    "isActiveMember" BOOLEAN NOT NULL DEFAULT false,
    "isCbspMember" BOOLEAN NOT NULL DEFAULT false,
    "activeMembers" INTEGER NOT NULL DEFAULT 0,
    "totalDeposit" REAL NOT NULL DEFAULT 0.0,
    "kycStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
    "kycDocument" TEXT,
    "securityQuestion" TEXT,
    "securityAnswer" TEXT,
    "spendingLimit" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "language" TEXT NOT NULL DEFAULT 'en',
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastWithdrawalTime" DATETIME,
    "lastSpinTime" DATETIME,
    CONSTRAINT "User_referredByCode_fkey" FOREIGN KEY ("referredByCode") REFERENCES "User" ("referralCode") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("activeMembers", "balance", "country", "createdAt", "currency", "email", "emailVerified", "id", "image", "isActiveMember", "isCbspMember", "kycDocument", "kycStatus", "language", "lastSpinTime", "lastWithdrawalTime", "memberId", "name", "password", "phoneNumber", "referralCode", "referredByCode", "role", "securityAnswer", "securityQuestion", "spendingLimit", "tier", "tierStatus", "totalDeposit", "updatedAt") SELECT "activeMembers", "balance", "country", "createdAt", "currency", "email", "emailVerified", "id", "image", "isActiveMember", "isCbspMember", "kycDocument", "kycStatus", "language", "lastSpinTime", "lastWithdrawalTime", "memberId", "name", "password", "phoneNumber", "referralCode", "referredByCode", "role", "securityAnswer", "securityQuestion", "spendingLimit", "tier", "tierStatus", "totalDeposit", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "method" TEXT,
    "description" TEXT,
    "arnMinted" REAL NOT NULL DEFAULT 0.0,
    "txId" TEXT,
    "destinationAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "description", "destinationAddress", "id", "method", "status", "txId", "type", "userId") SELECT "amount", "createdAt", "description", "destinationAddress", "id", "method", "status", "txId", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_txId_key" ON "Transaction"("txId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_txId_idx" ON "Transaction"("txId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE TABLE "new_TierConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tier" TEXT NOT NULL,
    "requiredArn" REAL NOT NULL DEFAULT 0.0,
    "members" INTEGER NOT NULL,
    "levels" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TierConfiguration" ("id", "levels", "members", "tier", "updatedAt") SELECT "id", "levels", "members", "tier", "updatedAt" FROM "TierConfiguration";
DROP TABLE "TierConfiguration";
ALTER TABLE "new_TierConfiguration" RENAME TO "TierConfiguration";
CREATE UNIQUE INDEX "TierConfiguration_tier_key" ON "TierConfiguration"("tier");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
