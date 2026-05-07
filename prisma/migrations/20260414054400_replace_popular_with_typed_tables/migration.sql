/*
  Warnings:

  - You are about to drop the `Popular` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Popular" DROP CONSTRAINT "Popular_accommodationId_fkey";

-- DropForeignKey
ALTER TABLE "Popular" DROP CONSTRAINT "Popular_attractionId_fkey";

-- DropForeignKey
ALTER TABLE "Popular" DROP CONSTRAINT "Popular_busId_fkey";

-- DropForeignKey
ALTER TABLE "Popular" DROP CONSTRAINT "Popular_packageId_fkey";

-- DropTable
DROP TABLE "Popular";

-- CreateTable
CREATE TABLE "PopularAccommodation" (
    "id" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopularAccommodation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopularBus" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopularBus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopularAttraction" (
    "id" TEXT NOT NULL,
    "attractionId" TEXT NOT NULL,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopularAttraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopularPackage" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopularPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PopularAccommodation_accommodationId_key" ON "PopularAccommodation"("accommodationId");

-- CreateIndex
CREATE UNIQUE INDEX "PopularBus_busId_key" ON "PopularBus"("busId");

-- CreateIndex
CREATE UNIQUE INDEX "PopularAttraction_attractionId_key" ON "PopularAttraction"("attractionId");

-- CreateIndex
CREATE UNIQUE INDEX "PopularPackage_packageId_key" ON "PopularPackage"("packageId");

-- AddForeignKey
ALTER TABLE "PopularAccommodation" ADD CONSTRAINT "PopularAccommodation_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularBus" ADD CONSTRAINT "PopularBus_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularAttraction" ADD CONSTRAINT "PopularAttraction_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularPackage" ADD CONSTRAINT "PopularPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
