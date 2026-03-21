-- Add accountId to RecurringTransaction as nullable first (for back-fill)
ALTER TABLE "RecurringTransaction" ADD COLUMN "accountId" UUID;

-- Back-fill all existing recurring transactions to their user's account
UPDATE "RecurringTransaction" rt
SET "accountId" = a."id"
FROM "Account" a
WHERE rt."userId" = a."userId";

-- Make accountId NOT NULL
ALTER TABLE "RecurringTransaction" ALTER COLUMN "accountId" SET NOT NULL;

-- Add FK with RESTRICT (prevents deleting an account that has recurring transactions)
ALTER TABLE "RecurringTransaction"
  ADD CONSTRAINT "RecurringTransaction_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "Account"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
