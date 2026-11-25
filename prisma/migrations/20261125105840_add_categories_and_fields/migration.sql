-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'ENTERTAINMENT';
ALTER TYPE "Category" ADD VALUE 'SHOPPING';
ALTER TYPE "Category" ADD VALUE 'BILLS';
ALTER TYPE "Category" ADD VALUE 'INVESTMENT';

-- AlterTable
ALTER TABLE "WishlistItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notifiedMilestone" INTEGER NOT NULL DEFAULT 0;
