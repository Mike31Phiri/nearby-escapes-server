-- CreateTable
CREATE TABLE "Popular" (
    "id" TEXT NOT NULL,
    "itemType" "BookingType" NOT NULL,
    "accommodationId" TEXT,
    "busId" TEXT,
    "attractionId" TEXT,
    "packageId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Popular_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Popular" ADD CONSTRAINT "Popular_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Popular" ADD CONSTRAINT "Popular_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Popular" ADD CONSTRAINT "Popular_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Popular" ADD CONSTRAINT "Popular_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
