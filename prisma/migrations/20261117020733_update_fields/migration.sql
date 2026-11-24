/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `WishlistItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `WishlistItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `WishlistItem` table. All the data in the column will be lost.
  - Added the required column `description` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cost` to the `WishlistItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `WishlistItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createdAt",
DROP COLUMN "title",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WishlistItem" DROP COLUMN "createdAt",
DROP COLUMN "price",
DROP COLUMN "title",
ADD COLUMN     "cost" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
