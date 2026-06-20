-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('HOTEL', 'CAB', 'RESTAURANT', 'TOUR_GUIDE', 'EXPERIENCE', 'PACKAGE');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT');

-- CreateTable: Listing
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "vendorId" TEXT,
    "type" "ListingType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "images" JSONB DEFAULT '[]',
    "pricing" JSONB DEFAULT '[]',
    "location" JSONB DEFAULT '{}',
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_projectId_status_idx" ON "Listing"("projectId", "status");
CREATE INDEX "Listing_projectId_vendorId_idx" ON "Listing"("projectId", "vendorId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Promotion
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minCartValue" INTEGER DEFAULT 0,
    "maxDiscount" INTEGER DEFAULT 0,
    "applicableTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageLimit" INTEGER DEFAULT 0,
    "perUserLimit" INTEGER DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_projectId_code_key" ON "Promotion"("projectId", "code");
CREATE INDEX "Promotion_projectId_isActive_idx" ON "Promotion"("projectId", "isActive");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: Destination
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "district" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_projectId_name_key" ON "Destination"("projectId", "name");
CREATE INDEX "Destination_projectId_isActive_idx" ON "Destination"("projectId", "isActive");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
