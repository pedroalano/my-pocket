-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT');

-- CreateTable Account
CREATE TABLE "Account" (
  "id"             UUID          NOT NULL DEFAULT gen_random_uuid(),
  "name"           TEXT          NOT NULL,
  "type"           "AccountType" NOT NULL,
  "initialBalance" DECIMAL(10,2) NOT NULL,
  "userId"         UUID          NOT NULL,
  "createdAt"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)  NOT NULL,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- Add accountId to Transaction as nullable (for back-fill)
ALTER TABLE "Transaction" ADD COLUMN "accountId" UUID;

-- Seed one Default Account per user
INSERT INTO "Account" ("id", "name", "type", "initialBalance", "userId", "updatedAt")
SELECT gen_random_uuid(), 'Default Account', 'CHECKING', 0, "id", NOW()
FROM "User";

-- Back-fill all existing transactions to their user's default account
UPDATE "Transaction" t
SET "accountId" = a."id"
FROM "Account" a
WHERE t."userId" = a."userId";

-- Make accountId NOT NULL
ALTER TABLE "Transaction" ALTER COLUMN "accountId" SET NOT NULL;

-- Add FK with RESTRICT (DB-level guard)
ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
