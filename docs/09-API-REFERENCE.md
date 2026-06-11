# Chiti Console — API Reference

**Version:** 1.0  
**Status:** Draft  

---

## 1. Base URL

- **Production:** `https://console.chiti.tech/api`
- **Development:** `http://localhost:3000/api`

## 2. Authentication

| Method | Header | Description |
|--------|--------|-------------|
| Session | HTTP-only cookie (automatic) | For browser-based requests |
| API Key | `Authorization: Bearer pk_live_xxx` | For project tracker + integrations |

---

## 3. Endpoints

### 3.1 Orders

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/orders` | List orders (query: `projectId`, `status`, `customerId`, `page`, `limit`) |
| `POST` | `/orders` | Create order |
| `GET` | `/orders/[id]` | Get order detail |
| `PATCH` | `/orders/[id]` | Update order (status, payment status, notes) |
| `DELETE` | `/orders/[id]` | Soft-delete order |
| `GET` | `/orders/[id]/timeline` | Get order timeline entries |
| `POST` | `/orders/[id]/timeline` | Add timeline entry |

**POST /orders (Create)**
```json
{
  "projectId": "uuid",
  "customerId": "uuid (optional)",
  "customer": {                    // if no customerId, create new
    "name": "string",
    "phone": "string",
    "email": "string?",
    "address": { "line1": "string", "city": "string", "pincode": "string" }
  },
  "items": [
    { "productId": "uuid?", "productName": "string", "quantity": 5, "unitPrice": 299 }
  ],
  "totalAmount": 1495,
  "discount": 0,
  "paymentMethod": "UPI",
  "paymentStatus": "unpaid",
  "source": "manual",
  "notes": "string?"
}
```

### 3.2 Customers

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/customers` | List customers (query: `projectId`, `search`, `page`, `limit`) |
| `POST` | `/customers` | Create customer |
| `GET` | `/customers/[id]` | Get customer with order history |
| `PATCH` | `/customers/[id]` | Update customer name, phone, email, tags, notes |
| `DELETE` | `/customers/[id]` | Delete customer |
| `GET` | `/customers/[id]/orders` | Get all orders for a customer |

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

### 3.4 Leads

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/leads` | List leads (query: `projectId`, `status`, `source`, `page`, `limit`) |
| `POST` | `/leads` | Create lead |
| `GET` | `/leads/[id]` | Get lead detail |
| `PATCH` | `/leads/[id]` | Update lead (status, assignedTo, notes, nextFollowUp) |
| `POST` | `/leads/[id]/convert` | Convert lead to customer + order |
| `DELETE` | `/leads/[id]` | Delete lead |

### 3.5 Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Create project |
| `GET` | `/projects/[id]` | Get project with stats |
| `PATCH` | `/projects/[id]` | Update project (name, domain, logo, config) |
| `DELETE` | `/projects/[id]` | Deactivate project |
| `POST` | `/projects/[id]/regenerate-key` | Regenerate API key |

### 3.6 Analytics (Internal)

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

### 3.7 WhatsApp

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/whatsapp/conversations` | List conversations (query: `projectId`, `status`) |
| `GET` | `/whatsapp/conversations/[id]` | Get conversation with messages |
| `POST` | `/whatsapp/conversations/[id]/messages` | Send message |
| `POST` | `/whatsapp/templates` | Create quick reply template |
| `GET` | `/whatsapp/templates` | List templates |

### 3.8 Content

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/content` | List content entries (query: `projectId`, `type`, `status`) |
| `GET` | `/content/[id]` | Get content detail |
| `POST` | `/content/sync` | Trigger manual content sync for a project |

### 3.9 Webhooks (External)

| Method | Path | Source | Description |
|--------|------|--------|-------------|
| `POST` | `/webhooks/whatsapp` | WhatsApp Cloud API | Incoming WhatsApp messages |
| `POST` | `/webhooks/github` | GitHub | Content change notifications |
| `POST` | `/webhooks/stripe` | Stripe | Payment events |

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
