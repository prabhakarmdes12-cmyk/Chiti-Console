# Chiti Console — API Reference

**Version:** 1.1  
**Status:** Updated — June 2026  

---

## 1. Base URL

- **Production:** `https://chiti-console.vercel.app/api`
- **Development:** `http://localhost:3000/api`

---

## 2. Authentication

Chiti Console supports two auth methods for API routes:

| Method | Header | Description |
|--------|--------|-------------|
| JWT | `Authorization: Bearer <jwt>` | From `POST /api/auth/login` response |
| API Key | `x-api-key: <project-api-key>` | Static key for webhook integrations |

### Auth Flow

1. **Login:** `POST /api/auth/login` with `{ email, password }` → returns `{ token, user }`
2. **Use token:** Pass `Authorization: Bearer <token>` on all subsequent requests
3. **Fallback:** API key via `x-api-key` header (used by external services)

### Public Routes (no auth)

| Route | Description |
|-------|-------------|
| `GET /api/health` | Health check |
| `POST /api/contact` | Contact form (BJ project) |
| `POST /api/auth/login` | Returns JWT |
| `POST /api/auth/register` | Create account (disabled unless `ALLOW_PUBLIC_REGISTER=true`) |

### Webhook Routes (API key only)

| Route | Service | Auth Method |
|-------|---------|-------------|
| `POST /api/webhook/whatsapp` | WhatsApp Cloud API | HMAC signature |
| `POST /api/webhook/stripe` | Stripe | Stripe webhook secret |
| `POST /api/webhook/razorpay` | Razorpay | HMAC signature |
| `POST /api/webhook/github` | GitHub | GitHub secret |

### Role Gating

Finance mutation endpoints (`POST/PATCH /api/finance/payouts`, `POST/PATCH /api/finance/refunds`) require:
- `SUPER_ADMIN`, `PROJECT_ADMIN`, or `FINANCE_MANAGER` role

---

## 3. Endpoints

### 3.1 Orders

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orders` | List orders (query: `projectId`, `status`, `customerId`, `vendorId`, `page`, `limit`) |
| `POST` | `/orders` | Create order |
| `GET` | `/orders/[id]` | Get order detail (includes items, timeline, escrow, refunds, vendor) |
| `PATCH` | `/orders/[id]` | Update order (status, payment status, notes, checkIn/out, guests, etc.) |
| `DELETE` | `/orders/[id]` | Soft-delete order |
| `GET` | `/orders/[id]/timeline` | Get order timeline entries |
| `POST` | `/orders/[id]/timeline` | Add timeline entry |

**POST /orders (Create)**
```json
{
  "projectId": "uuid",
  "vendorId": "uuid (optional, marketplace)",
  "customerId": "uuid (optional)",
  "customer": {
    "name": "string",
    "phone": "string",
    "email": "string?",
    "address": { "line1": "string", "city": "string", "pincode": "string" }
  },
  "items": [
    { "productId": "uuid?", "productName": "string", "quantity": 1, "unitPrice": 299 }
  ],
  "totalAmount": 1495,
  "discount": 0,
  "commissionAmount": 0,
  "platformFee": 0,
  "gstAmount": 0,
  "checkIn": "2026-07-01T00:00:00Z",
  "checkOut": "2026-07-03T00:00:00Z",
  "guests": 2,
  "roomType": "Deluxe",
  "pickupLocation": "Ranchi Airport",
  "dropoffLocation": "Forest Homestay",
  "paymentMethod": "UPI",
  "paymentStatus": "unpaid",
  "source": "manual",
  "notes": "string?"
}
```

---

### 3.2 Customers

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers` | List customers (query: `projectId`, `search`, `page`, `limit`) |
| `POST` | `/customers` | Create customer |
| `GET` | `/customers/[id]` | Get customer with order history |
| `PATCH` | `/customers/[id]` | Update customer name, phone, email, tags, notes |
| `DELETE` | `/customers/[id]` | Delete customer |
| `GET` | `/customers/[id]/orders` | Get all orders for a customer |

---

### 3.3 Products

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/products` | List products (query: `projectId`, `category`, `isActive`) |
| `POST` | `/products` | Create product |
| `GET` | `/products/[id]` | Get product |
| `PATCH` | `/products/[id]` | Update product |
| `DELETE` | `/products/[id]` | Deactivate product |
| `GET` | `/products/[id]/stock` | Get stock movement history |
| `POST` | `/products/[id]/stock` | Record stock movement |

---

### 3.4 Leads

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/leads` | List leads (query: `projectId`, `status`, `source`, `page`, `limit`) |
| `POST` | `/leads` | Create lead |
| `GET` | `/leads/[id]` | Get lead detail |
| `PATCH` | `/leads/[id]` | Update lead (status, assignedTo, notes, nextFollowUp) |
| `POST` | `/leads/[id]/convert` | Convert lead to customer + order |
| `DELETE` | `/leads/[id]` | Delete lead |

---

### 3.5 Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Create project |
| `GET` | `/projects/[id]` | Get project with stats |
| `PATCH` | `/projects/[id]` | Update project (name, domain, logo, config) |
| `DELETE` | `/projects/[id]` | Deactivate project |
| `POST` | `/projects/[id]/regenerate-key` | Regenerate API key |

---

### 3.6 Vendors (Marketplace)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/vendors` | List vendors (query: `projectId`, `status`, `type`, `page`, `limit`) |
| `POST` | `/vendors` | Create vendor |
| `GET` | `/vendors/[id]` | Get vendor (includes bank accounts, wallet, listings, orders) |
| `PATCH` | `/vendors/[id]` | Update vendor (name, status, commission rate, KYC documents) |
| `DELETE` | `/vendors/[id]` | Deactivate vendor |

---

### 3.7 Enquiries (Marketplace)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/enquiries` | List enquiries (query: `projectId`, `vendorId`, `status`, `page`, `limit`) |
| `POST` | `/enquiries` | Create enquiry |
| `GET` | `/enquiries/[id]` | Get enquiry detail |
| `PATCH` | `/enquiries/[id]` | Update enquiry (status, notes, assignedTo) |
| `POST` | `/enquiries/[id]/convert` | Convert enquiry to booking (creates confirmed order + escrow + wallet tx + payout) |

---

### 3.8 Listings (Marketplace)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/listings` | List listings (query: `projectId`, `vendorId`, `type`, `isActive`, `page`, `limit`) |
| `POST` | `/listings` | Create listing |
| `GET` | `/listings/[id]` | Get listing detail |
| `PATCH` | `/listings/[id]` | Update listing |
| `DELETE` | `/listings/[id]` | Deactivate listing |

---

### 3.9 Finance (Marketplace)

#### 3.9.1 Marketplace Summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/finance/marketplace` | Marketplace finance summary (revenue, gbv, commissions, escrow, pending payouts, vendor stats) |

#### 3.9.2 Payouts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/finance/payouts` | List payouts (query: `projectId`, `vendorId`, `status`, `page`, `limit`) |
| `POST` | `/finance/payouts` | Create payout (requires FINANCE_ROLES) |
| `GET` | `/finance/payouts/[id]` | Get payout detail |
| `PATCH` | `/finance/payouts/[id]` | Update payout status (requires FINANCE_ROLES) |

**POST /finance/payouts** (FINANCE_MANAGER+)
```json
{
  "projectId": "uuid",
  "vendorId": "uuid",
  "orderId": "uuid?",
  "amount": 5000.00,
  "commissionDeducted": 600.00,
  "platformFee": 50.00,
  "tdsAmount": 100.00,
  "netAmount": 4250.00,
  "mode": "BANK_TRANSFER",
  "bankAccountId": "uuid?",
  "notes": "Payout for order #BJ-0042"
}
```

#### 3.9.3 Refunds

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/finance/refunds` | List refunds (query: `projectId`, `orderId`, `status`, `page`, `limit`) |
| `POST` | `/finance/refunds` | Create refund (requires FINANCE_ROLES) |
| `GET` | `/finance/refunds/[id]` | Get refund detail |
| `PATCH` | `/finance/refunds/[id]` | Update refund status (requires FINANCE_ROLES) |

---

### 3.10 Analytics

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/track` | Ingest analytics event from tracker |
| `GET` | `/analytics/summary` | Cross-project summary (visitors, revenue, orders) |
| `GET` | `/analytics/project/[id]` | Per-project analytics |
| `GET` | `/analytics/project/[id]/revenue` | Revenue time series |
| `GET` | `/analytics/project/[id]/top-products` | Top products by revenue |

**POST /track (Tracker Ingestion)**
```json
{
  "project": "bighi-brothers",
  "event": "page_view",
  "properties": {
    "url": "https://www.bighibrothers.shop/",
    "referrer": "https://google.com",
    "viewport": "1440x900"
  },
  "sessionId": "sess_abc123",
  "userId": null,
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-06-10T12:00:00Z"
}
```

---

### 3.11 WhatsApp

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/whatsapp/conversations` | List conversations (query: `projectId`, `status`) |
| `GET` | `/whatsapp/conversations/[id]` | Get conversation with messages |
| `POST` | `/whatsapp/conversations/[id]/messages` | Send message |
| `POST` | `/whatsapp/templates` | Create quick reply template |
| `GET` | `/whatsapp/templates` | List templates |

---

### 3.12 Content

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/content` | List content entries (query: `projectId`, `type`, `status`) |
| `GET` | `/content/[id]` | Get content detail |
| `POST` | `/content/sync` | Trigger manual content sync for a project |

---

### 3.13 Export

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/export/customers` | Export customers as CSV (query: `projectId`) |
| `GET` | `/export/orders` | Export orders as CSV (query: `projectId`, `dateFrom`, `dateTo`) |

---

### 3.14 Booking Jharkhand Dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/bj/dashboard` | BJ marketplace CEO dashboard data (revenue, GBV, orders, commissions, platform fees, escrow, vendor health, funnel, priorities) |

**Response:**
```json
{
  "totalRevenue": 125000.00,
  "totalGbv": 150000.00,
  "totalOrders": 42,
  "totalCommissions": 15000.00,
  "totalPlatformFees": 2500.00,
  "totalGst": 2700.00,
  "activeVendors": 12,
  "pendingPayouts": 35000.00,
  "escrowHeld": 28000.00,
  "customerFunnel": { "new": 15, "contacted": 8, "quoted": 5, "confirmed": 3 },
  "moneyByCategory": { "HOTEL": 65000, "HOMESTAY": 35000, "CAB": 12000, "TOUR_PACKAGE": 38000 },
  "vendorHealth": { "active": 12, "pending_kyc": 3, "suspended": 1 },
  "priorities": [
    { "title": "3 vendors pending KYC", "severity": "warning", "action": "/vendors?kyc=pending" }
  ]
}
```

---

### 3.15 Webhooks (External)

| Method | Path | Source | Description |
|--------|------|--------|-------------|
| `POST` | `/webhook/whatsapp` | WhatsApp Cloud API | Incoming WhatsApp messages |
| `POST` | `/webhook/stripe` | Stripe | Payment events |
| `POST` | `/webhook/razorpay` | Razorpay | Payment events |
| `POST` | `/webhook/order` | External order sync | Receive order from external system |
| `POST` | `/webhook/github` | GitHub | Content change notifications |

---

## 4. Response Format

### Success
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with ID xyz not found.",
    "details": null
  }
}
```

### Pagination
All list endpoints support:
- `?page=1&limit=20` (default: page=1, limit=20)
- `?search=marigold` (full-text search where applicable)
- `?sort=createdAt&order=desc`

---

## 5. Rate Limiting

| Tier | Read Limit | Write Limit |
|------|-----------|-------------|
| Internal (session) | 500 req/min | 100 req/min |
| API Key (tracker) | 1000 req/min | — |
| Webhook | — | 200 req/min |
| Public | 60 req/min | — |

Headers returned on every response:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1686400000
```
