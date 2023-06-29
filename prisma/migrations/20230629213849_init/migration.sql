/*
  Warnings:

  - You are about to drop the column `CreatedAt` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `MfaSecret` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VerificationCode` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "CreatedAt",
ADD COLUMN     "Address" TEXT,
ADD COLUMN     "MfaSecret" TEXT NOT NULL,
ADD COLUMN     "VerificationCode" TEXT NOT NULL,
ADD COLUMN     "Verified" BOOLEAN NOT NULL DEFAULT false;
