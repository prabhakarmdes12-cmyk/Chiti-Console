---
name: booking-jharkhand
description: Use when working on the Booking Jharkhand marketplace — a tourism booking platform integrated with Chiti Console. Applies when editing files related to marketplace pages, vendor management, enquiry-to-booking flow, escrow, payouts, and marketplace finance.
---

# Booking Jharkhand — Marketplace Context

## What It Is
A tourism marketplace for Jharkhand (hotels, homestays, cabs, tour packages, camping, experiences). Operates as a `MARKETPLACE` project type in Chiti Console.

## Key Data Models
- **Vendor**: `businessName`, `category` (HOTEL/CAB/RESTAURANT/TOUR_GUIDE/EXPERIENCE), `status` (PENDING/ACTIVE/SUSPENDED/REJECTED), KYC `documents` (JSON array), `bankAccount` (1:1), `wallet` (1:1)
- **Listing**: `type` (ListingType), `status` (DRAFT/PUBLISHED/ARCHIVED), `pricing` (JSON), `location` (JSON), `amenities`, `tags`, `rating`, `reviewCount`
- **Enquiry**: `type` (HOTEL/CAB/PACKAGE/RESTAURANT/CONTACT/AI_PLAN), `customerName`, `customerPhone`, `listingName`, `vendorId`, `status` (NEW/ASSIGNED/IN_DISCUSSION/CONFIRMED/COMPLETED/CANCELLED), `details` (JSON)
- **Order** (extended): `vendorId`, `commissionAmount`, `platformFee`, `gstAmount`, `checkIn`, `checkOut`, `guests`, `roomType`, `pickupLocation`, `dropoffLocation`
- **Escrow**: `grossAmount`, `commissionAmount`, `vendorAmount`, `gstAmount`, `status` (HELD/RELEASED/PARTIALLY_RELEASED/REFUNDED), `releaseDueAt`
- **Payout**: `amount`, `status` (PENDING/PROCESSING/COMPLETED/FAILED), `scheduledFor`, `utrNumber`
- **Refund**: `amount`, `reason`, `status` (REQUESTED/APPROVED/PROCESSED/REJECTED)

## API Endpoints
- `/api/bj/dashboard` — CEO metrics (revenue, GBV, commissions, escrow, vendor health, funnel)
- `/api/vendors` — CRUD with KYC/bank/wallet
- `/api/enquiries` — CRUD + `POST /:id/convert` (enquiry→booking)
- `/api/listings` — CRUD with type/vendor/price/rating
- `/api/finance/payouts` — GET/POST/PATCH (gated: FINANCE_ROLES)
- `/api/finance/refunds` — GET/POST/PATCH (gated: FINANCE_ROLES)
- `/api/finance/marketplace` — Summary

## Enquiry→Booking Flow
1. Admin clicks "Convert to Booking" on enquiry detail page
2. Server action `convertEnquiryToBooking()` in `src/lib/actions/marketplace.ts`:
   - Creates CONFIRMED Order with commission/GST/tourism fields
   - Marks enquiry CONFIRMED
   - Creates HELD Escrow
   - Adds pendingBalance to VendorWallet
   - Creates PENDING Payout
3. Duplicate-safe via `notes: "enquiry:{id}"` check
4. Fields mapped from enquiry `details` JSON: checkIn, checkOut, guests, roomType, pickupLocation, dropoffLocation

## Pages
- `/vendors` — Grid + `/vendors/[id]` detail (KYC docs, bank, wallet, orders, actions)
- `/listings` — Grid with type/vendor/price/rating filters
- `/enquiries` — Pipeline list + convert action
- `/orders/[id]` — Tourism-specific view (booking fields, vendor card, escrow card, financial breakdown)
- `/finance/escrow`, `/finance/wallets`, `/finance/payouts`, `/finance/refunds`, `/finance/commissions`

## Commission Logic
Lookup chain: vendor-specific rate → category-level rate (ordered by `effectiveFrom`) → 12% default fallback. Applied in `commissionAmount` on Order.

## Dashboard (Marketplace CEO View)
Shows: today revenue, GBV, platform earnings, pending settlement, escrow balance, refunds, GST, vendor health per category, money by category, customer funnel, marketplace priorities (pending payouts, refund requests, escrow release due).
