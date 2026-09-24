/*
  Warnings:

  - You are about to drop the `Host` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Host" DROP CONSTRAINT "Host_userId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_hostId_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_hostId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Host";

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
