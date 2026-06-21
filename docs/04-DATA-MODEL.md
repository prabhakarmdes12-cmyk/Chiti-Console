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
Project 1──N Vendor            (marketplace)
Project 1──N Enquiry           (marketplace)
Project 1──N Listing           (marketplace)
Project 1──N Promotion         (marketplace)
Project 1──N Destination       (marketplace)
Project 1──N Commission        (marketplace finance)
Project 1──N Escrow            (marketplace finance)
Project 1──N Payout            (marketplace finance)
Project 1──N Refund            (marketplace finance)
Project 1──N VendorWallet      (marketplace finance)
Project 1──N VendorBankAccount (marketplace finance)
Project 1──N WalletTransaction (marketplace finance)

Customer 1──N Order
Customer 1──N Lead
Customer 1──N WhatsAppConversation
Customer 1──N Enquiry          (marketplace)

Vendor ─── Project
Vendor 1──N Order
Vendor 1──N Listing
Vendor 1──N Enquiry
Vendor 1──N Commission
Vendor 1──N Escrow
Vendor 1──N Payout
Vendor 1──N Refund
Vendor 1──N VendorWallet
Vendor 1──N VendorBankAccount

Order N──N Product (via OrderItem)
Order *──1 Customer
Order *──1 Vendor (marketplace)
Order 1──1 Escrow (marketplace)
Order 1──N Refund (marketplace)

Product 1──N OrderItem
Product 1──N StockMovement

Lead *──1 Customer (nullable — converted leads)
Lead *──1 Project

Enquiry *──1 Vendor (marketplace)
Enquiry *──1 Customer (marketplace)
Enquiry *──1 Project (marketplace)

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
  vendors             Vendor[]
  enquiries           Enquiry[]
  listings            Listing[]
  promotions          Promotion[]
  destinations        Destination[]
  orders              Order[]
  commissions         Commission[]
  escrows             Escrow[]
  payouts             Payout[]
  refunds             Refund[]
  vendorWallets       VendorWallet[]
  vendorBankAccounts  VendorBankAccount[]
  walletTransactions  WalletTransaction[]
  customers           Customer[]
  products            Product[]
  leads               Lead[]
  invoices            Invoice[]
  expenses            Expense[]
  clientAccess        ClientAccess[]
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
  MARKETPLACE
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
  vendorId        String?  // marketplace: linked vendor
  customerId      String?
  source          OrderSource @default(MANUAL)
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentMethod   PaymentMethod?
  paymentProvider String?
  paymentProviderId String?
  totalAmount     Decimal  @db.Decimal(10, 2)
  discount        Decimal  @default(0) @db.Decimal(10, 2)
  commissionAmount Decimal @default(0) @db.Decimal(10, 2)  // marketplace: platform commission
  platformFee     Decimal  @default(0) @db.Decimal(10, 2)   // marketplace: platform fee
  gstAmount       Decimal  @default(0) @db.Decimal(10, 2)   // marketplace: GST on commission
  checkIn         DateTime?  // marketplace: hotel/package booking
  checkOut        DateTime?  // marketplace: hotel/package booking
  guests          Int?       // marketplace: number of guests
  roomType        String?    // marketplace: room/cabin type
  pickupLocation  String?    // marketplace: cab pickup
  dropoffLocation String?    // marketplace: cab dropoff
  notes           String?
  assignedTo      String?  // User ID
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  project    Project    @relation(fields: [projectId], references: [id])
  vendor     Vendor?    @relation(fields: [vendorId], references: [id])
  customer   Customer?  @relation(fields: [customerId], references: [id])
  items      OrderItem[]
  timeline   OrderTimeline[]
  invoices   Invoice[]
  escrow     Escrow?      // marketplace: linked escrow
  refunds    Refund[]     // marketplace: linked refunds

  @@index([projectId, createdAt])
  @@index([projectId, vendorId])
  @@index([customerId])
  @@index([status])
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

### 2.7 Marketplace — Booking Jharkhand

```
model Vendor {
  id                  String   @id @default(uuid())
  projectId           String
  name                String
  type                VendorType
  email               String?
  phone               String?
  address             String?
  city                String?
  state               String?
  gstin               String?    // GST registration
  pan                 String?    // PAN card
  commissionRate      Decimal?   // override % (e.g. 0.15 = 15%)
  kycStatus           KYCStatus  @default(PENDING)
  kycDocuments        Json?      // [{type, url, status}]
  status              VendorStatus @default(ACTIVE)
  rating              Decimal?   @db.Decimal(3, 2)
  totalListings       Int        @default(0)
  totalBookings       Int        @default(0)
  totalRevenue        Decimal    @default(0) @db.Decimal(12, 2)
  notes               String?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  project        Project          @relation(fields: [projectId], references: [id])
  orders         Order[]
  enquiries      Enquiry[]
  listings       Listing[]
  commissions    Commission[]
  escrows        Escrow[]
  payouts        Payout[]
  refunds        Refund[]
  vendorWallet   VendorWallet?
  bankAccounts   VendorBankAccount[]
  walletTransactions WalletTransaction[]

  @@index([projectId, status])
  @@index([projectId, type])
}

enum VendorType {
  HOTEL
  HOMESTAY
  CAB_SERVICE
  TOUR_PACKAGE
  CAMPING
  EXPERIENCE
}

enum KYCStatus {
  PENDING
  SUBMITTED
  VERIFIED
  REJECTED
}

enum VendorStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model Enquiry {
  id              String     @id @default(uuid())
  projectId       String
  vendorId        String?
  customerId      String?
  name            String
  email           String?
  phone           String?
  checkIn         DateTime?
  checkOut        DateTime?
  guests          Int?
  roomType        String?
  pickupLocation  String?
  dropoffLocation String?
  source          EnquirySource @default(MANUAL)
  status          EnquiryStatus @default(NEW)
  notes           String?
  details         Json?         // flexible extra fields
  assignedTo      String?
  convertedOrderId String?      // links to Order once converted
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  project  Project   @relation(fields: [projectId], references: [id])
  vendor   Vendor?   @relation(fields: [vendorId], references: [id])
  customer Customer? @relation(fields: [customerId], references: [id])

  @@index([projectId, status])
  @@index([vendorId])
  @@index([customerId])
}

enum EnquirySource {
  WHATSAPP
  WEBSITE
  PHONE
  MANUAL
}

enum EnquiryStatus {
  NEW
  CONTACTED
  QUOTED
  CONFIRMED
  LOST
  SPAM
}

model Listing {
  id            String        @id @default(uuid())
  projectId     String
  vendorId      String?
  title         String
  slug          String?
  type          ListingType
  description   String?
  price         Decimal       @db.Decimal(10, 2)
  compareAt     Decimal?      @db.Decimal(10, 2)
  images        String[]      @default([])
  amenities     String[]      @default([])
  location      String?
  latitude      Decimal?      @db.Decimal(10, 7)
  longitude     Decimal?      @db.Decimal(10, 7)
  maxGuests     Int?
  bedrooms      Int?
  isActive      Boolean       @default(true)
  rating        Decimal?      @db.Decimal(3, 2)
  reviewCount   Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  project  Project  @relation(fields: [projectId], references: [id])
  vendor   Vendor?  @relation(fields: [vendorId], references: [id])

  @@index([projectId, type])
  @@index([projectId, isActive])
  @@index([vendorId])
}

enum ListingType {
  HOTEL
  HOMESTAY
  CAB
  TOUR_PACKAGE
  CAMPING
  EXPERIENCE
}

model Destination {
  id          String   @id @default(uuid())
  projectId   String
  name        String
  slug        String?
  description String?
  imageUrl    String?
  state       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id])
}

model Promotion {
  id          String     @id @default(uuid())
  projectId   String
  code        String
  description String?
  discountType DiscountType
  discountValue Decimal  @db.Decimal(10, 2)
  minAmount   Decimal?   @db.Decimal(10, 2)
  maxUses     Int?
  usedCount   Int        @default(0)
  startsAt    DateTime?
  endsAt      DateTime?
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())

  project Project @relation(fields: [projectId], references: [id])

  @@index([projectId, code])
}

enum DiscountType {
  PERCENTAGE
  FIXED
}
```

### 2.8 Marketplace — Finance Models

```
model Commission {
  id            String   @id @default(uuid())
  projectId     String
  vendorId      String?
  category      String?  // "hotel", "cab", "homestay", null = default
  rate          Decimal  @db.Decimal(5, 2)  // e.g. 12.00 = 12%
  effectiveFrom DateTime @default(now())
  effectiveTo   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  vendor  Vendor? @relation(fields: [vendorId], references: [id])

  @@index([projectId, vendorId])
}

enum EscrowStatus {
  HELD
  RELEASED
  CANCELLED
  PARTIALLY_RELEASED
}

model Escrow {
  id              String       @id @default(uuid())
  projectId       String
  orderId         String       @unique
  vendorId        String?
  totalAmount     Decimal      @db.Decimal(12, 2)
  platformFee     Decimal      @default(0) @db.Decimal(10, 2)
  commissionAmount Decimal     @default(0) @db.Decimal(10, 2)
  gstAmount       Decimal      @default(0) @db.Decimal(10, 2)
  netToVendor     Decimal      @db.Decimal(12, 2)
  status          EscrowStatus @default(HELD)
  heldAt          DateTime     @default(now())
  releasedAt      DateTime?
  cancelledAt     DateTime?
  autoReleaseAt   DateTime?    // e.g. checkOut + 2 days
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  order   Order   @relation(fields: [orderId], references: [id])
  vendor  Vendor? @relation(fields: [vendorId], references: [id])

  @@index([projectId, status])
  @@index([orderId])
  @@index([vendorId])
}

model VendorBankAccount {
  id              String   @id @default(uuid())
  projectId       String
  vendorId        String
  accountHolder   String
  bankName        String
  accountNumber   String
  ifscCode        String
  accountType     String   @default("SAVINGS")  // SAVINGS, CURRENT
  isDefault       Boolean  @default(true)
  isVerified      Boolean  @default(false)
  upiId           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  vendor  Vendor  @relation(fields: [vendorId], references: [id])

  @@index([projectId, vendorId])
}

model VendorWallet {
  id              String   @id @default(uuid())
  projectId       String
  vendorId        String   @unique
  balance         Decimal  @default(0) @db.Decimal(12, 2)
  pendingBalance  Decimal  @default(0) @db.Decimal(12, 2)  // escrow awaiting release
  lifetimeEarned  Decimal  @default(0) @db.Decimal(12, 2)
  totalWithdrawn  Decimal  @default(0) @db.Decimal(12, 2)
  currency        String   @default("INR")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  project      Project             @relation(fields: [projectId], references: [id])
  vendor       Vendor              @relation(fields: [vendorId], references: [id])
  transactions WalletTransaction[]
}

model WalletTransaction {
  id           String    @id @default(uuid())
  projectId    String
  walletId     String
  vendorId     String?
  type         WalletTransactionType
  amount       Decimal   @db.Decimal(12, 2)
  balanceBefore Decimal  @db.Decimal(12, 2)
  balanceAfter  Decimal  @db.Decimal(12, 2)
  description  String?
  referenceId  String?    // order ID, payout ID, etc.
  status       String    @default("COMPLETED")
  createdAt    DateTime  @default(now())

  project Project      @relation(fields: [projectId], references: [id])
  wallet  VendorWallet @relation(fields: [walletId], references: [id])
  vendor  Vendor?      @relation(fields: [vendorId], references: [id])

  @@index([walletId, createdAt])
  @@index([projectId, vendorId])
}

enum WalletTransactionType {
  EARNING        // order payment → escrow released
  WITHDRAWAL     // payout initiated
  REFUND         // refund deducted from wallet
  ADJUSTMENT     // manual correction
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

model Payout {
  id              String       @id @default(uuid())
  projectId       String
  vendorId        String?
  orderId         String?      // null if bulk payout
  amount          Decimal      @db.Decimal(12, 2)
  commissionDeducted Decimal   @default(0) @db.Decimal(10, 2)
  platformFee     Decimal      @default(0) @db.Decimal(10, 2)
  tdsAmount       Decimal      @default(0) @db.Decimal(10, 2)
  netAmount       Decimal      @db.Decimal(12, 2)
  status          PayoutStatus @default(PENDING)
  mode            String?      // "BANK_TRANSFER", "UPI"
  reference       String?      // bank reference / UPI txn ID
  bankAccountId   String?
  processedAt     DateTime?
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  vendor  Vendor? @relation(fields: [vendorId], references: [id])

  @@index([projectId, status])
  @@index([projectId, vendorId])
}

enum RefundStatus {
  PENDING
  APPROVED
  PROCESSED
  REJECTED
}

model Refund {
  id              String       @id @default(uuid())
  projectId       String
  orderId         String
  vendorId        String?
  amount          Decimal      @db.Decimal(12, 2)
  reason          String?
  status          RefundStatus @default(PENDING)
  initiatedBy     String?      // user ID
  processedAt     DateTime?
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  order   Order   @relation(fields: [orderId], references: [id])
  vendor  Vendor? @relation(fields: [vendorId], references: [id])

  @@index([projectId, status])
  @@index([orderId])
  @@index([vendorId])
}

model Invoice {
  id              String        @id @default(uuid())
  projectId       String
  orderId         String
  invoiceNumber   String        @unique
  type            InvoiceType   @default(GST)
  totalAmount     Decimal       @db.Decimal(10, 2)
  gstAmount       Decimal?      @db.Decimal(10, 2)
  status          InvoiceStatus @default(DRAFT)
  pdfUrl          String?
  generatedAt     DateTime?
  sentAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  project Project @relation(fields: [projectId], references: [id])
  order   Order   @relation(fields: [orderId], references: [id])
}

enum InvoiceType {
  GST
  PROFORMA
  CREDIT_NOTE
}

enum InvoiceStatus {
  DRAFT
  SENT
  PAID
  CANCELLED
}

model Expense {
  id          String   @id @default(uuid())
  projectId   String
  category    String
  amount      Decimal  @db.Decimal(10, 2)
  description String?
  date        DateTime @default(now())
  receiptUrl  String?
  createdAt   DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id])
}

model ClientAccess {
  id        String   @id @default(uuid())
  projectId String
  name      String
  email     String
  role      String   @default("VIEWER")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id])
}
```

### 2.10 Content & Analytics

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

### 2.12 Users & Roles

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
  FINANCE_MANAGER
  SUPPORT_AGENT
  VENDOR_USER
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
| Order | `[projectId, vendorId]` | Vendor order summary |
| Order | `[customerId]` | Customer order history |
| Order | `[status]` | Status filtering |
| Customer | `[projectId, phone]` | Duplicate detection |
| Customer | `[projectId, email]` | Duplicate detection |
| AnalyticsEvent | `[projectId, event, createdAt]` | Analytics queries |
| AnalyticsEvent | `[sessionId]` | Session-based analysis |
| Lead | `[projectId, status]` | Kanban pipeline queries |
| WhatsAppConversation | `[projectId, lastMessageAt]` | Inbox ordering |
| Vendor | `[projectId, status]` | Vendor management queries |
| Vendor | `[projectId, type]` | Filter by vendor type |
| Enquiry | `[projectId, status]` | Enquiry pipeline |
| Enquiry | `[vendorId]` | Vendor enquiries |
| Enquiry | `[customerId]` | Customer enquiries |
| Listing | `[projectId, type]` | Listing browsing |
| Listing | `[projectId, isActive]` | Active listings |
| Listing | `[vendorId]` | Vendor listings |
| Commission | `[projectId, vendorId]` | Commission rate lookup |
| Escrow | `[projectId, status]` | Escrow management |
| Escrow | `[orderId]` | Escrow by order |
| Escrow | `[vendorId]` | Vendor escrows |
| Payout | `[projectId, status]` | Payout queue |
| Payout | `[projectId, vendorId]` | Vendor payout history |
| Refund | `[projectId, status]` | Refund queue |
| Refund | `[orderId]` | Order refunds |
| Refund | `[vendorId]` | Vendor refunds |
| WalletTransaction | `[walletId, createdAt]` | Wallet history |
| WalletTransaction | `[projectId, vendorId]` | Vendor transaction history |
