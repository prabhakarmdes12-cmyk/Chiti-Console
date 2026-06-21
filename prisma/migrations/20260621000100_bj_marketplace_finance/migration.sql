DO $$ BEGIN
  CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'PARTIALLY_RELEASED', 'REFUNDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'HOLD', 'RELEASE', 'REFUND', 'COMMISSION', 'PAYOUT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "commissionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "platformFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "checkIn" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "checkOut" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guests" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "roomType" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupLocation" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "dropoffLocation" TEXT;

CREATE TABLE IF NOT EXISTS "Commission" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "vendorId" TEXT,
  "category" "VendorCategory",
  "rate" DECIMAL(5,2) NOT NULL,
  "minAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maxAmount" DECIMAL(10,2),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Escrow" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "grossAmount" DECIMAL(10,2) NOT NULL,
  "commissionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "vendorAmount" DECIMAL(10,2) NOT NULL,
  "gstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "status" "EscrowStatus" NOT NULL DEFAULT 'HELD',
  "heldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releaseDueAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Escrow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VendorBankAccount" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "accountHolder" TEXT NOT NULL,
  "bankName" TEXT,
  "accountNumber" TEXT,
  "ifscCode" TEXT,
  "upiId" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VendorBankAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VendorWallet" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "pendingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalWithdrawn" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VendorWallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "type" "WalletTransactionType" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "referenceId" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payout" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "scheduledFor" TIMESTAMP(3),
  "processedAt" TIMESTAMP(3),
  "utrNumber" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Refund" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "reason" TEXT,
  "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Escrow_orderId_key" ON "Escrow"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "VendorBankAccount_vendorId_key" ON "VendorBankAccount"("vendorId");
CREATE UNIQUE INDEX IF NOT EXISTS "VendorWallet_vendorId_key" ON "VendorWallet"("vendorId");
CREATE INDEX IF NOT EXISTS "Order_projectId_vendorId_idx" ON "Order"("projectId", "vendorId");
CREATE INDEX IF NOT EXISTS "Commission_projectId_category_idx" ON "Commission"("projectId", "category");
CREATE INDEX IF NOT EXISTS "Commission_projectId_vendorId_idx" ON "Commission"("projectId", "vendorId");
CREATE INDEX IF NOT EXISTS "Escrow_projectId_status_idx" ON "Escrow"("projectId", "status");
CREATE INDEX IF NOT EXISTS "Escrow_projectId_releaseDueAt_idx" ON "Escrow"("projectId", "releaseDueAt");
CREATE INDEX IF NOT EXISTS "VendorBankAccount_projectId_idx" ON "VendorBankAccount"("projectId");
CREATE INDEX IF NOT EXISTS "VendorWallet_projectId_idx" ON "VendorWallet"("projectId");
CREATE INDEX IF NOT EXISTS "WalletTransaction_projectId_createdAt_idx" ON "WalletTransaction"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");
CREATE INDEX IF NOT EXISTS "Payout_projectId_status_idx" ON "Payout"("projectId", "status");
CREATE INDEX IF NOT EXISTS "Payout_projectId_scheduledFor_idx" ON "Payout"("projectId", "scheduledFor");
CREATE INDEX IF NOT EXISTS "Payout_vendorId_idx" ON "Payout"("vendorId");
CREATE INDEX IF NOT EXISTS "Refund_projectId_status_idx" ON "Refund"("projectId", "status");
CREATE INDEX IF NOT EXISTS "Refund_orderId_idx" ON "Refund"("orderId");

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Commission" ADD CONSTRAINT "Commission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Commission" ADD CONSTRAINT "Commission_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Escrow" ADD CONSTRAINT "Escrow_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "VendorBankAccount" ADD CONSTRAINT "VendorBankAccount_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "VendorBankAccount" ADD CONSTRAINT "VendorBankAccount_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "VendorWallet" ADD CONSTRAINT "VendorWallet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "VendorWallet" ADD CONSTRAINT "VendorWallet_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "VendorWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Payout" ADD CONSTRAINT "Payout_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Payout" ADD CONSTRAINT "Payout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Refund" ADD CONSTRAINT "Refund_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Refund" ADD CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
