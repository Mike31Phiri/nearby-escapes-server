CREATE TYPE "StayDateBlockStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE "StayDateBlock" (
    "id" TEXT NOT NULL,
    "blockGroupId" TEXT NOT NULL,
    "stayId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "reason" TEXT NOT NULL DEFAULT 'OFFLINE_BOOKING',
    "status" "StayDateBlockStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StayDateBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StayDateBlock_stayId_status_startDate_endDate_idx"
    ON "StayDateBlock"("stayId", "status", "startDate", "endDate");

CREATE INDEX "StayDateBlock_status_endDate_idx"
    ON "StayDateBlock"("status", "endDate");

CREATE INDEX "StayDateBlock_blockGroupId_idx"
    ON "StayDateBlock"("blockGroupId");

ALTER TABLE "StayDateBlock"
    ADD CONSTRAINT "StayDateBlock_stayId_fkey"
    FOREIGN KEY ("stayId") REFERENCES "Stay"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StayDateBlock"
    ADD CONSTRAINT "StayDateBlock_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
