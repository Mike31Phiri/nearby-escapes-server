-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('FLEXIBLE', 'MODERATE', 'STRICT');

-- AlterTable
ALTER TABLE "Accommodation" ADD COLUMN     "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'MODERATE';

-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'MODERATE';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "refundAmount" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "Bus" ADD COLUMN     "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'MODERATE';
