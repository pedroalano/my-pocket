-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Budget" ADD COLUMN     "description" TEXT;
