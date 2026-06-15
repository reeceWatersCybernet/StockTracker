-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('Laptop', 'Desktop', 'Server', 'Monitor', 'Switch', 'Router', 'Firewall', 'AccessPoint', 'Printer', 'VoIPPhone', 'MobileDevice', 'Dock', 'Peripheral', 'Other');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('InStock', 'Deployed', 'AwaitingCollection', 'InRepair', 'Retired');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('Office', 'Customer');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Engineer');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Engineer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT,
    "serialNumber" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'InStock',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceImage" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "caption" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedByUserId" TEXT NOT NULL,

    CONSTRAINT "DeviceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "customerId" TEXT,
    "officeSubLocation" TEXT,
    "reason" TEXT NOT NULL,
    "ticketNumber" TEXT,
    "installDate" TIMESTAMP(3) NOT NULL,
    "proposedCollectionDate" TIMESTAMP(3),
    "actualCollectionDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Device_assetTag_key" ON "Device"("assetTag");

-- CreateIndex
CREATE INDEX "Device_serialNumber_idx" ON "Device"("serialNumber");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_type_idx" ON "Device"("type");

-- CreateIndex
CREATE INDEX "DeviceImage_deviceId_idx" ON "DeviceImage"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceImage_uploadedByUserId_idx" ON "DeviceImage"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "Movement_deviceId_isCurrent_idx" ON "Movement"("deviceId", "isCurrent");

-- CreateIndex
CREATE INDEX "Movement_customerId_idx" ON "Movement"("customerId");

-- CreateIndex
CREATE INDEX "Movement_createdByUserId_idx" ON "Movement"("createdByUserId");

-- CreateIndex
CREATE INDEX "Movement_proposedCollectionDate_idx" ON "Movement"("proposedCollectionDate");

-- AddForeignKey
ALTER TABLE "DeviceImage" ADD CONSTRAINT "DeviceImage_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceImage" ADD CONSTRAINT "DeviceImage_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
