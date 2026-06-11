# Chiti Console — Security & Authentication

**Version:** 1.0  
**Status:** Draft  

---

## 1. Authentication (Auth.js v5)

### 1.1 Providers

| Provider | Use Case | Config |
|----------|----------|--------|
| **Google OAuth** | Primary login for team members | Google Cloud Console OAuth 2.0 |
| **Email (Magic Link)** | Client viewers without Google accounts | Resend / SendGrid for emails |
| **GitHub OAuth** | Dev team alternative | GitHub OAuth App |

### 1.2 Session Strategy

```
Type: JWT (stateless)
Storage: HTTP-only secure cookie
Expiry: 7 days (rolling)
Refresh: Sliding window — extends on each request
```

### 1.3 Auth Flow

```
1. User visits /login
2. Clicks "Sign in with Google"
3. Auth.js redirects to Google OAuth consent screen
4. On success, Google returns id_token + access_token
5. Auth.js validates, creates/updates user record
6. JWT issued with { userId, email, role, projectScopes[] }
7. Cookie set → user redirected to /dashboard
8. Every subsequent API call validates JWT via middleware
```

### 1.4 Auth.js Configuration

```ts
// src/lib/auth/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }),
    Email({ server: process.env.EMAIL_SERVER, from: "console@chiti.tech" }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.projectScopes = await getUserProjectScopes(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.projectScopes = token.projectScopes;
      return session;
    },
  },
});
```

---

## 2. Authorization (RBAC)

### 2.1 Role Hierarchy

```
SUPER_ADMIN → everything
PROJECT_ADMIN → read/write within assigned project(s)
SUPPORT_AGENT → orders, customers, whatsapp within assigned project(s)
CONTENT_EDITOR → content entries only
CLIENT_VIEWER → read-only analytics for their project
```

### 2.2 Permission Matrix

| Resource | Super Admin | Project Admin | Support Agent | Content Editor | Client Viewer |
|----------|-------------|---------------|---------------|----------------|---------------|
| All projects | CRUD | Read | — | — | — |
| Orders | CRUD | CRUD (own) | CRUD (own) | — | Read |
| Customers | CRUD | CRUD | Read | — | Read |
| Products | CRUD | CRUD | Read | Read | Read |
| Leads | CRUD | CRUD | CRUD | — | — |
| Content | CRUD | CRUD | — | CRUD (own) | Read |
| Analytics | Read | Read (own) | — | — | Read (own) |
| WhatsApp | CRUD | CRUD | CRUD | — | — |
| Users (team) | CRUD | Read (own) | — | — | — |
| Settings | CRUD | Read (own) | — | — | — |

### 2.3 API Middleware

```ts
// src/middleware.ts
export { auth as middleware } from "@/lib/auth/auth";

// Per-endpoint check
// src/app/api/orders/route.ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!hasProjectAccess(session, body.projectId, "write")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  // ... handle request
}
```

---

## 3. API Security

### 3.1 Project API Keys

Each project gets a unique API key (UUID v4) used by the tracker script.

| Key Type | Usage | Rate Limit |
|----------|-------|------------|
| `pk_live_*` | Production tracker | 1000 req/min |
| `pk_test_*` | Development/testing | 100 req/min |

### 3.2 Request Validation

- **All mutation endpoints:** Require valid session (HTTP-only cookie)
- **Tracker endpoint:** Validates API key + HMAC signature
- **Webhook endpoints:** Validates via HMAC signature verification
- **Rate limiting:** Per API key + per session (Sliding window)

### 3.3 Webhook Security

All incoming webhooks (WhatsApp, GitHub, Stripe) verify payload signature before processing:

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

# Vercel
NEXT_PUBLIC_CONSOLE_URL="https://console.chiti.tech"
```
