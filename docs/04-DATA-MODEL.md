# Chiti Console — Data Model (Prisma Schema)

**Version:** 1.0  
**Status:** Draft  

---

## 1. Entity Relationship Overview

```
Project 1──N Order
Project 1──N Customer
Project 1──N Product
Project 1──N Lead
Project 1──N ContentEntry
Project 1──N AnalyticsEvent
Project 1──N WhatsAppConversation

Customer 1──N Order
Customer 1──N Lead
Customer 1──N WhatsAppConversation

Order N──N Product (via OrderItem)
Order *──1 Customer

Product 1──N OrderItem
Product 1──N StockMovement

Lead *──1 Customer (nullable — converted leads)
Lead *──1 Project

User N──N Project (via UserProject — role-based)
```

---

## 2. Core Models

### 2.1 Project

```
model Project {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  type            ProjectType  @default(CUSTOM)
  domain          String?
  logoUrl         String?
  integrationType IntegrationType @default(MANUAL)
  config          Json?    // project-specific settings
  isActive        Boolean  @default(true)
  apiKey          String   @unique @default(uuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  orders              Order[]
  customers           Customer[]
  products            Product[]
  leads               Lead[]
  contentEntries      ContentEntry[]
  analyticsEvents     AnalyticsEvent[]
  whatsappConversations WhatsAppConversation[]
  users               UserProject[]
}

enum ProjectType {
  ECOMMERCE
  B2B_CATALOG
  CONTENT
  SAAS
  CUSTOM
}

enum IntegrationType {
  API
  WEBHOOK
  CMS
  MANUAL
}
```

### 2.2 Order

```
model Order {
  id              String   @id @default(uuid())
  orderNumber     String   // auto-generated, e.g. "BB-2026-0001"
  projectId       String
  customerId      String?
  source          OrderSource @default(MANUAL)
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentMethod   PaymentMethod?
  totalAmount     Decimal  @db.Decimal(10, 2)
  discount        Decimal  @default(0) @db.Decimal(10, 2)
  notes           String?
  assignedTo      String?  // User ID
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  project    Project    @relation(fields: [projectId], references: [id])
  customer   Customer?  @relation(fields: [customerId], references: [id])
  items      OrderItem[]
  timeline   OrderTimeline[]
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  productId   String?
  productName String
  quantity    Int
  unitPrice   Decimal @db.Decimal(10, 2)
  lineTotal   Decimal @db.Decimal(10, 2)

  order   Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])
}

model OrderTimeline {
  id        String   @id @default(uuid())
  orderId   String
  status    OrderStatus
  note      String?
  userId    String?
  createdAt DateTime @default(now())

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

enum OrderSource {
  WHATSAPP
  MANUAL
  WEB_CHECKOUT
  API
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PARTIAL
  PAID
  REFUNDED
}

enum PaymentMethod {
  UPI
  COD
  RAZORPAY
  STRIPE
  BANK_TRANSFER
}
```

### 2.3 Customer

```
model Customer {
  id          String   @id @default(uuid())
  projectId   String
  name        String
  phone       String?
  email       String?
  address     Json?
  tags        String[] @default([])
  notes       String?
  totalOrders Int      @default(0)
  totalSpent  Decimal  @default(0) @db.Decimal(10, 2)
  lastOrderAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  project    Project    @relation(fields: [projectId], references: [id])
  orders     Order[]
  leads      Lead[]
  whatsappConversations WhatsAppConversation[]

  @@unique([projectId, phone])
  @@unique([projectId, email])
}
```

### 2.4 Product

```
model Product {
  id               String   @id @default(uuid())
  projectId        String
  externalId       String?  // maps to storefront product ID
  name             String
  sku              String?
  category         String?
  price            Decimal  @db.Decimal(10, 2)
  cost             Decimal? @db.Decimal(10, 2)
  stock            Int?     // null = unlimited
  lowStockThreshold Int?    @default(5)
  isActive         Boolean  @default(true)
  imageUrl         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  project        Project          @relation(fields: [projectId], references: [id])
  orderItems     OrderItem[]
  stockMovements StockMovement[]
}

model StockMovement {
  id        String             @id @default(uuid())
  productId String
  type      StockMovementType
  quantity  Int
  reason    String?
  referenceId String?           // order ID if from a sale
  createdAt DateTime           @default(now())

  product Product @relation(fields: [productId], references: [id])
}

enum StockMovementType {
  IN
  OUT
  ADJUSTMENT
}
```

### 2.5 Lead

```
model Lead {
  id            String   @id @default(uuid())
  projectId     String
  customerId    String?
  name          String
  email         String?
  company       String?
  phone         String?
  source        LeadSource @default(WEBSITE_FORM)
  status        LeadStatus @default(NEW)
  products      String[]   // product names enquired about
  quantity      String?
  message       String?
  assignedTo    String?
  nextFollowUp  DateTime?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  project     Project    @relation(fields: [projectId], references: [id])
  customer    Customer?  @relation(fields: [customerId], references: [id])
}

enum LeadSource {
  WEBSITE_FORM
  WHATSAPP
  CALENDLY
  MANUAL
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL
  WON
  LOST
}
```

### 2.6 WhatsApp

```
model WhatsAppConversation {
  id          String   @id @default(uuid())
  projectId   String
  customerId  String?
  waContactId String   // WhatsApp contact ID
  status      ConversationStatus @default(ACTIVE)
  unreadCount Int      @default(0)
  lastMessageAt DateTime?
  createdAt   DateTime @default(now())

  // Relations
  project  Project           @relation(fields: [projectId], references: [id])
  customer Customer?         @relation(fields: [customerId], references: [id])
  messages WhatsAppMessage[]
}

model WhatsAppMessage {
  id               String   @id @default(uuid())
  conversationId   String
  direction        MessageDirection
  content          String
  messageType      String   @default("text") // text, image, template
  waMessageId      String?
  metadata         Json?
  createdAt        DateTime @default(now())

  conversation WhatsAppConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

enum ConversationStatus {
  ACTIVE
  RESOLVED
  ARCHIVED
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}
```

### 2.7 Content & Analytics

```
model ContentEntry {
  id          String   @id @default(uuid())
  projectId   String
  externalId  String?
  title       String
  slug        String?
  type        String   // "page", "product", "article", "collection"
  status      String   // "draft", "published"
  updatedBy   String?
  lastSyncedAt DateTime?
  createdAt   DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id])
}

model AnalyticsEvent {
  id        String   @id @default(uuid())
  projectId String
  event     String   // "page_view", "add_to_cart", "checkout", "purchase"
  properties Json?
  sessionId String?
  userId    String?
  ip        String?
  userAgent String?
  pageUrl   String?
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id])
}
```

### 2.8 Users & Roles

```
model User {
  id            String   @id @default(uuid())
  name          String?
  email         String   @unique
  emailVerified DateTime?
  image         String?
  role          UserRole @default(ADMIN)
  createdAt     DateTime @default(now())

  // Relations
  projects UserProject[]
  accounts Account[]
  sessions Session[]
}

enum UserRole {
  SUPER_ADMIN
  PROJECT_ADMIN
  SUPPORT_AGENT
  CLIENT_VIEWER
  CONTENT_EDITOR
}

model UserProject {
  userId    String
  projectId String
  role      ProjectRole @default(ADMIN)

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@id([userId, projectId])
}

enum ProjectRole {
  ADMIN
  EDITOR
  VIEWER
}

// Auth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 3. Indexes Strategy

| Table | Index | Reason |
|-------|-------|--------|
| Order | `[projectId, createdAt]` | Dashboard timeline queries |
| Order | `[customerId]` | Customer order history |
| Order | `[status]` | Status filtering |
| Customer | `[projectId, phone]` | Duplicate detection |
| Customer | `[projectId, email]` | Duplicate detection |
| AnalyticsEvent | `[projectId, event, createdAt]` | Analytics queries |
| AnalyticsEvent | `[sessionId]` | Session-based analysis |
| Lead | `[projectId, status]` | Kanban pipeline queries |
| WhatsAppConversation | `[projectId, lastMessageAt]` | Inbox ordering |
