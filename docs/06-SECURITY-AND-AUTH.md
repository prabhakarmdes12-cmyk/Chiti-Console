# Chiti Console — Security & Authentication

**Version:** 1.1  
**Status:** Updated — June 2026  

---

## 1. Authentication

Chiti Console uses two parallel auth systems:

| System | Purpose | Audience |
|--------|---------|----------|
| **Auth.js v5** (OAuth/Credentials) | Browser session | Console team members |
| **JWT (jose)** via `/api/auth/login` | Bearer token | API clients, frontend apps |

### 1.1 Auth.js v5 — Browser Sessions

#### Providers

| Provider | Use Case | Config |
|----------|----------|--------|
| **Google OAuth** | Primary login for team members | Google Cloud Console OAuth 2.0 |
| **Email (Magic Link)** | Client viewers without Google accounts | Resend / SendGrid for emails |
| **GitHub OAuth** | Dev team alternative | GitHub OAuth App |
| **Credentials** | Dev login (email + password, gated by `AUTH_DEV_EMAIL`/`AUTH_DEV_PASSWORD`) | Dev only |

#### Session Strategy

```
Type: JWT (stateless)
Storage: HTTP-only secure cookie
Expiry: 7 days (rolling)
Refresh: Sliding window — extends on each request
```

#### Auth Flow

```
1. User visits /login
2. Clicks "Sign in with Google" (or enters dev credentials)
3. Auth.js redirects to Google OAuth consent screen
4. On success, Google returns id_token + access_token
5. Auth.js validates, creates/updates user record
6. JWT issued with { userId, email, role, projectScopes[] }
7. Cookie set → user redirected to /dashboard
8. Every subsequent API call validates JWT via middleware
```

### 1.2 JWT Login — API Clients

Used by the Booking Jharkhand frontend (and other external apps) to authenticate API requests.

#### Login Endpoint: `POST /api/auth/login`

```
Request:  { "email": "...", "password": "..." }
Response: { "token": "eyJ...", "user": { id, email, role, name } }
```

- Returns signed HS256 JWT with 24h expiry
- Claims: `sub` (userId), `email`, `role`, `projectSlug`
- Password validated against `AUTH_DEV_PASSWORD` env var (hardcoded dev login)

#### Dual Auth in API Routes: `authenticate()`

All data API routes use `authenticate()` from `src/lib/api/auth.ts`:

```
1. Check Authorization: Bearer <jwt>
   → Decode + verify JWT with jose (HS256)
   → Extract { userId, email, role, projectSlug }
2. Fallback: Check x-api-key header
   → Find project with matching apiKey
   → Return { userId: null, email: null, role: API_KEY, projectSlug }
3. Neither → Return 401
```

Routes that use `authenticate()`:
- `/api/orders/*`, `/api/customers`, `/api/products`, `/api/leads`
- `/api/vendors/*`, `/api/enquiries/*`, `/api/listings`
- `/api/finance/*`

Routes that use `authenticateApiKey()` only (webhooks):
- `/api/webhook/*` — Stripe, Razorpay, WhatsApp

Public routes (no auth):
- `/api/health` — health check
- `/api/contact` — contact form
- `/api/auth/login` — returns JWT
- `/api/auth/register`

#### Helper exports

```ts
// src/lib/api/auth.ts
ADMIN_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN"]
FINANCE_ROLES = ["SUPER_ADMIN", "PROJECT_ADMIN", "FINANCE_MANAGER"]

requireRole(roles: string[]) // Returns 403 Response if not allowed
```

---

## 2. Authorization (RBAC)

### 2.1 Role Hierarchy

```
SUPER_ADMIN → everything
PROJECT_ADMIN → full CRUD within assigned project(s)
FINANCE_MANAGER → orders, customers, products, analytics, finance ops
SUPPORT_AGENT → orders, customers, vendors, listings, enquiries, leads, whatsapp
VENDOR_USER → own orders, products, enquiries
CLIENT_VIEWER → read-only dashboard + analytics
CONTENT_EDITOR → content entries + analytics
```

### 2.2 Server-Side RBAC Helpers

```ts
// src/lib/db/queries.ts
getCurrentUser()              → User object (throws if no session)
getCurrentUserRole()          → UserRole string
requireRole(...roles)         → throws if not in list
getAccessibleProjects()       → projects where user has membership (or all for SUPER_ADMIN)
roleAtLeast(minimum: UserRole) → hierarchy comparison
```

Used in server components and page loaders. For API routes, use the `requireRole()` from `src/lib/api/auth.ts`.

### 2.3 Sidebar Nav Visibility by Role

| Role | Visible Nav Items |
|------|-------------------|
| SUPER_ADMIN / PROJECT_ADMIN | All 14 items + Add Project button |
| FINANCE_MANAGER | Dashboard, Orders, Customers, Products, Analytics, Finance |
| SUPPORT_AGENT | Dashboard, Orders, Customers, Vendors, Listings, Enquiries, Leads, WhatsApp |
| VENDOR_USER | Dashboard, Orders, Products, Enquiries |
| CLIENT_VIEWER | Dashboard, Analytics |
| CONTENT_EDITOR | Dashboard, Content, Analytics |

### 2.4 Project Membership Scoping

- `SUPER_ADMIN` sees all projects in project selector
- All other roles see only projects they belong to (via `UserProject` table)
- `getAccessibleProjects()` enforces this in the layout
- `verifyProjectAccess()` prevents cross-project FK injection in API routes

### 2.5 Permission Matrix

| Resource | Super Admin | Project Admin | Finance Manager | Support Agent | Vendor User | Client Viewer | Content Editor |
|----------|-------------|---------------|-----------------|---------------|-------------|---------------|----------------|
| Projects | CRUD | Read | — | — | — | — | — |
| Orders | CRUD | CRUD | Read | CRUD (own) | Read (own) | — | — |
| Customers | CRUD | CRUD | Read | Read | — | — | — |
| Products | CRUD | CRUD | Read | Read | Read (own) | — | — |
| Leads | CRUD | CRUD | — | CRUD | — | — | — |
| Content | CRUD | CRUD | — | — | — | — | CRUD (own) |
| Analytics | Read | Read (own) | Read (own) | — | — | Read (own) | Read (own) |
| Finance | CRUD | CRUD | CRUD | — | — | — | — |
| Vendors | CRUD | CRUD | — | CRUD | Read (own) | — | — |
| Listings | CRUD | CRUD | — | CRUD | Read (own) | — | — |
| Enquiries | CRUD | CRUD | — | CRUD | CRUD (own) | — | — |
| WhatsApp | CRUD | CRUD | — | CRUD | — | — | — |
| Users | CRUD | Read (own) | — | — | — | — | — |
| Settings | CRUD | Read (own) | — | — | — | — | — |

---

## 3. API Security

### 3.1 Project API Keys

Each project gets a unique API key (UUID v4) used by the tracker script.

| Key Type | Usage | Rate Limit |
|----------|-------|------------|
| `pk_live_*` | Production tracker | 1000 req/min |
| `pk_test_*` | Development/testing | 100 req/min |

### 3.2 Request Validation

- **Data API routes:** `authenticate()` — checks JWT first, falls back to API key
- **Webhook endpoints:** Validates via HMAC signature (WhatsApp) or webhook secret (Stripe/Razorpay)
- **Tracker endpoint:** Validates API key
- **Rate limiting:** Per API key + per session (Sliding window)

### 3.3 CORS

Implemented in `src/proxy.ts` for all `/api/*` routes:

```
Access-Control-Allow-Origin: <request origin>
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key
```

Preflight (OPTIONS) returns 204. Proxy bypasses auth check — API routes handle their own auth.

### 3.4 Webhook Security

All incoming webhooks verify payload signature before processing:

```ts
// WhatsApp webhook verification
const verifyWhatsAppSignature = (req: Request, rawBody: string): boolean => {
  const signature = req.headers.get("X-Hub-Signature-256") || "";
  const expected = crypto
    .createHmac("sha256", process.env.WHATSAPP_APP_SECRET!)
    .update(rawBody)
    .digest("hex");
  return `sha256=${expected}` === signature;
};
```

- **WhatsApp:** HMAC-SHA256 with `WHATSAPP_APP_SECRET`
- **Stripe:** `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- **Razorpay:** HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`

### 3.5 Security Hardening

All HIGH-severity items:

- `JWT_SECRET` required at startup — no fallback
- CORS restricted to known origins via Set
- AI query + WhatsApp routes require auth
- Cross-project FK injection prevented via `verifyProjectAccess()`
- User management APIs require SUPER_ADMIN
- Register disabled unless `ALLOW_PUBLIC_REGISTER=true`
- WhatsApp webhook signature verification
- Finance mutations require admin or FINANCE_MANAGER role
- Project membership required for all scoped operations

---

## 4. Data Privacy

- **Customer PII** — Phone numbers, emails, addresses stored encrypted at rest
- **Project isolation** — Queries filtered by project scope at the ORM level
- **API logs** — Retained for 90 days, anonymized after 30
- **GDPR readiness** — Export user data endpoint, delete account endpoint
- **Session audit log** — All admin actions logged with timestamp + user ID

---

## 5. Environment Variables

```env
# Auth
AUTH_SECRET="generate-with-npx-auth-secret"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_GITHUB_ID="..."
AUTH_GITHUB_SECRET="..."
JWT_SECRET="must-be-set-required-at-startup"

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="https://..."

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_APP_SECRET="..."
WHATSAPP_ACCESS_TOKEN="..."

# Email
EMAIL_SERVER="smtp://..."
EMAIL_FROM="console@chiti.tech"

# GitHub (for Giriraj content sync)
GITHUB_TOKEN="..."
GITHUB_REPO="prabhakarmdes12-cmyk/House-of-Giriraj"

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# Razorpay
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# Vercel
NEXT_PUBLIC_CONSOLE_URL="https://console.chiti.tech"
```
