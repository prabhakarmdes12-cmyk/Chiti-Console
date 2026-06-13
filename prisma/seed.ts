import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Use DIRECT_URL or fallback (prisma+postgres:// proxy URL won't work with PrismaPg adapter)
const raw = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const connectionString = raw.startsWith("postgres") ? raw : "postgres://postgres:postgres@localhost:51214/postgres";
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean all existing data (reverse dependency order)
  await prisma.whatsAppMessage.deleteMany();
  await prisma.whatsAppConversation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderTimeline.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.contentEntry.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.userProject.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();

  // ──────────────────────────────────────────────
  // CREATE PROJECTS
  // ──────────────────────────────────────────────

  const bb = await prisma.project.create({
    data: {
      name: "Bighi Brothers",
      slug: "bighi-brothers",
      type: "ECOMMERCE",
      domain: "bighibrothers.shop",
      integrationType: "API",
      isActive: true,
    },
  });

  const hog = await prisma.project.create({
    data: {
      name: "House of Giriraj",
      slug: "house-of-giriraj",
      type: "ECOMMERCE",
      domain: "house-of-giriraj.vercel.app",
      integrationType: "WEBHOOK",
      isActive: true,
    },
  });

  const tsa = await prisma.project.create({
    data: {
      name: "Ts Aromatics",
      slug: "ts-aromatics",
      type: "B2B_CATALOG",
      domain: "tsaromatics.in",
      integrationType: "API",
      isActive: true,
    },
  });

  const bmc = await prisma.project.create({
    data: {
      name: "Bhatia Master Classes",
      slug: "bhatia-master-classes",
      type: "SAAS",
      domain: "bhatiamasterclasses.com",
      integrationType: "MANUAL",
      isActive: true,
    },
  });

  // ──────────────────────────────────────────────
  // ADMIN USER
  // ──────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      email: "admin@chiti.com",
      name: "Dev Admin",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.userProject.createMany({
    data: [
      { userId: admin.id, projectId: bb.id, role: "ADMIN" },
      { userId: admin.id, projectId: hog.id, role: "ADMIN" },
      { userId: admin.id, projectId: tsa.id, role: "ADMIN" },
      { userId: admin.id, projectId: bmc.id, role: "ADMIN" },
    ],
  });

  // ═══════════════════════════════════════════════
  // BIGHI BROTHERS — Handmade Natural Skincare
  // ═══════════════════════════════════════════════

  await Promise.all([
    prisma.product.create({
      data: { id: "bb-soap-001", projectId: bb.id, name: "Marigold Mountain Soap", sku: "BB-SOAP-001", category: "Soaps", price: 299, stock: 50, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "bb-soap-002", projectId: bb.id, name: "Rose Clay Soap", sku: "BB-SOAP-002", category: "Soaps", price: 299, stock: 40, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "bb-soap-003", projectId: bb.id, name: "Coffee Scrub Soap", sku: "BB-SOAP-003", category: "Soaps", price: 299, stock: 35, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "bb-soap-004", projectId: bb.id, name: "Activated Charcoal Soap", sku: "BB-SOAP-004", category: "Soaps", price: 299, stock: 30, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "bb-cream-001", projectId: bb.id, name: "Peach + Seabuckthorn Cream", sku: "BB-CREAM-001", category: "Creams", price: 499, stock: 25, lowStockThreshold: 5, isActive: true },
    }),
    prisma.product.create({
      data: { id: "bb-cream-002", projectId: bb.id, name: "White Lotus Vitality Cream", sku: "BB-CREAM-002", category: "Creams", price: 599, stock: 20, lowStockThreshold: 5, isActive: true },
    }),
    prisma.product.create({
      data: { id: "bb-lip-001", projectId: bb.id, name: "Peach + Cocoa Butter Lip Balm", sku: "BB-LIP-001", category: "Lip Care", price: 199, stock: 60, lowStockThreshold: 15, isActive: true },
    }),
  ]);

  await Promise.all([
    prisma.customer.create({
      data: { id: "bb-cust-anita", projectId: bb.id, name: "Anita Sharma", phone: "+91 98765 43210", email: "anita@example.com", totalOrders: 12, totalSpent: 45230 },
    }),
    prisma.customer.create({
      data: { id: "bb-cust-rahul", projectId: bb.id, name: "Rahul Verma", phone: "+91 87654 32109", email: "rahul@example.com", totalOrders: 8, totalSpent: 23400 },
    }),
    prisma.customer.create({
      data: { id: "bb-cust-priya", projectId: bb.id, name: "Priya Patel", phone: "+91 76543 21098", email: "priya@example.com", totalOrders: 15, totalSpent: 67890 },
    }),
    prisma.customer.create({
      data: { id: "bb-cust-vikram", projectId: bb.id, name: "Vikram Singh", phone: "+91 65432 10987", email: "vikram@example.com", totalOrders: 3, totalSpent: 8990 },
    }),
  ]);

  await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "BB-0042", projectId: bb.id, customerId: "bb-cust-anita", source: "WHATSAPP", status: "PENDING", paymentStatus: "UNPAID", totalAmount: 598,
        items: { create: [{ productId: "bb-soap-001", productName: "Marigold Mountain Soap", quantity: 2, unitPrice: 299, lineTotal: 598 }] },
        timeline: { create: { status: "PENDING", note: "Order placed via WhatsApp" } },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BB-0041", projectId: bb.id, customerId: "bb-cust-rahul", source: "MANUAL", status: "SHIPPED", paymentStatus: "PAID", paymentMethod: "UPI", totalAmount: 299,
        items: { create: [{ productId: "bb-soap-002", productName: "Rose Clay Soap", quantity: 1, unitPrice: 299, lineTotal: 299 }] },
        timeline: { create: [
          { status: "PENDING", note: "Order created" },
          { status: "CONFIRMED", note: "Payment confirmed via UPI" },
          { status: "PROCESSING", note: "Item packed" },
          { status: "SHIPPED", note: "Dispatched via Delhivery" },
        ] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BB-0040", projectId: bb.id, customerId: "bb-cust-priya", source: "WEB_CHECKOUT", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "RAZORPAY", totalAmount: 1497,
        items: { create: [{ productId: "bb-soap-001", productName: "Marigold Mountain Soap", quantity: 3, unitPrice: 299, lineTotal: 897 }, { productId: "bb-cream-001", productName: "Peach + Seabuckthorn Cream", quantity: 1, unitPrice: 499, lineTotal: 499 }] },
        timeline: { create: [
          { status: "PENDING", note: "Order placed via website" },
          { status: "CONFIRMED", note: "Payment received via Razorpay" },
          { status: "PROCESSING", note: "Order being prepared" },
          { status: "SHIPPED", note: "Handed to courier" },
          { status: "DELIVERED", note: "Delivered successfully" },
        ] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BB-0039", projectId: bb.id, customerId: "bb-cust-vikram", source: "WHATSAPP", status: "PROCESSING", paymentStatus: "UNPAID", totalAmount: 499,
        items: { create: [{ productId: "bb-cream-001", productName: "Peach + Seabuckthorn Cream", quantity: 1, unitPrice: 499, lineTotal: 499 }] },
        timeline: { create: [
          { status: "PENDING", note: "Order placed via WhatsApp" },
          { status: "CONFIRMED", note: "Order confirmed" },
          { status: "PROCESSING", note: "Being packed" },
        ] },
      },
    }),
  ]);

  await Promise.all([
    prisma.lead.create({
      data: { projectId: bb.id, name: "Rajesh Kumar", company: "Herbal Store", email: "rajesh@herbalstore.com", phone: "+91 99887 76655", source: "WEBSITE_FORM", status: "NEW", products: ["Soaps bulk"], message: "Looking for wholesale pricing on handmade soaps" },
    }),
    prisma.lead.create({
      data: { projectId: bb.id, name: "Sneha Reddy", company: "Wellness Hub", email: "sneha@wellnesshub.com", source: "WHATSAPP", status: "CONTACTED", products: ["Creams"], message: "Need natural creams for spa" },
    }),
    prisma.lead.create({
      data: { projectId: bb.id, name: "Amit Joshi", company: "Pooja Supplies", email: "amit@poojasupplies.in", source: "CALENDLY", status: "QUALIFIED", products: ["Custom gift sets"], quantity: "100 units", message: "Corporate gifting bulk order" },
    }),
  ]);

  await Promise.all([
    prisma.contentEntry.create({
      data: { projectId: bb.id, title: "Our Philosophy — Rupam, Gunam, Vayastya", type: "Page", status: "Published", body: "Bighi Brothers believes skincare is not something you fix — it is something you practice. Not layers. Not routines built on excess. Just simple, thoughtful steps repeated over time. Our three principles: Rupam (Outer Form) — the visible radiance from cleansing that respects the skin's natural barrier. Gunam (Inner Quality) — ingredients that nourish and strengthen from within. Vayastya (The Essence) — lasting vitality and aging with grace." },
    }),
    prisma.contentEntry.create({
      data: { projectId: bb.id, title: "Product Catalog — Soaps", type: "Collection", status: "Published", body: "Our soap collection: Marigold Mountain Soap (₹299) — for skin that needs calm. Rose Clay Soap (₹299) — for gentle detox. Coffee Scrub Soap (₹299) — for renewal. Activated Charcoal Soap (₹299) — for deep cleansing." },
    }),
    prisma.contentEntry.create({
      data: { projectId: bb.id, title: "The Ritual — 3 Steps", type: "Page", status: "Draft", body: "Step 1 Cleanse: Remove what the day leaves behind. Step 2 Treat: Support what your skin is already doing. Step 3 Moisturize: Seal, protect, and restore balance." },
    }),
    prisma.contentEntry.create({
      data: { projectId: bb.id, title: "Homepage Banner — Summer Campaign", type: "Banner", status: "Draft", body: "Begin your ritual. Start with one product. Stay with what works." },
    }),
  ]);

  await Promise.all([
    prisma.whatsAppConversation.create({
      data: {
        projectId: bb.id, customerId: "bb-cust-anita", waContactId: "919876543210", status: "ACTIVE", unreadCount: 2, lastMessageAt: new Date(),
        messages: {
          create: [
            { direction: "INBOUND", content: "Hi, has the Marigold Mountain Soap been restocked?", messageType: "text", createdAt: new Date(Date.now() - 3600000) },
            { direction: "OUTBOUND", content: "Yes Anita! Fresh batch just came in. Would you like to order?", messageType: "text", createdAt: new Date(Date.now() - 3000000) },
            { direction: "INBOUND", content: "Great! Please add 2 to my order BB-0042.", messageType: "text", createdAt: new Date(Date.now() - 2400000) },
            { direction: "OUTBOUND", content: "Done! I've updated your order. You'll receive a confirmation shortly.", messageType: "text", createdAt: new Date(Date.now() - 1800000) },
          ],
        },
      },
    }),
    prisma.whatsAppConversation.create({
      data: {
        projectId: bb.id, waContactId: "919988776655", status: "ACTIVE", unreadCount: 1, lastMessageAt: new Date(Date.now() - 600000),
        messages: {
          create: [
            { direction: "INBOUND", content: "Hello, do you do bulk orders for wedding return gifts?", messageType: "text", createdAt: new Date(Date.now() - 600000) },
          ],
        },
      },
    }),
    prisma.whatsAppConversation.create({
      data: {
        projectId: bb.id, customerId: "bb-cust-vikram", waContactId: "916543210987", status: "RESOLVED", unreadCount: 0, lastMessageAt: new Date(Date.now() - 86400000),
        messages: {
          create: [
            { direction: "INBOUND", content: "Has my cream order BB-0039 been dispatched?", messageType: "text", createdAt: new Date(Date.now() - 86400000) },
            { direction: "OUTBOUND", content: "Yes Vikram, it's being packed and will ship tomorrow. Tracking: bighibrothers.shop/track/BB0039", messageType: "text", createdAt: new Date(Date.now() - 82800000) },
            { direction: "INBOUND", content: "Thank you! Please share the tracking number once available.", messageType: "text", createdAt: new Date(Date.now() - 79200000) },
            { direction: "OUTBOUND", content: "Will do! Let me know if you need anything else.", messageType: "text", createdAt: new Date(Date.now() - 75600000) },
          ],
        },
      },
    }),
  ]);

  // ═══════════════════════════════════════════════
  // HOUSE OF GIRIRAJ — Fine Jewellery (est. 1995)
  // ═══════════════════════════════════════════════

  await Promise.all([
    prisma.product.create({
      data: { id: "hg-jewel-001", projectId: hog.id, name: "Diamond Solitaire Ring (GIA Certified)", sku: "HG-JWL-001", category: "Rings", price: 150000, stock: 3, lowStockThreshold: 1, isActive: true },
    }),
    prisma.product.create({
      data: { id: "hg-jewel-002", projectId: hog.id, name: "Emerald Pendant Set", sku: "HG-JWL-002", category: "Pendants", price: 85000, stock: 5, lowStockThreshold: 1, isActive: true },
    }),
    prisma.product.create({
      data: { id: "hg-jewel-003", projectId: hog.id, name: "Ruby Earrings (18k Gold)", sku: "HG-JWL-003", category: "Earrings", price: 120000, stock: 4, lowStockThreshold: 1, isActive: true },
    }),
    prisma.product.create({
      data: { id: "hg-jewel-004", projectId: hog.id, name: "Heritage Gold Bangles (22k)", sku: "HG-JWL-004", category: "Bangles", price: 250000, stock: 2, lowStockThreshold: 1, isActive: true },
    }),
    prisma.product.create({
      data: { id: "hg-jewel-005", projectId: hog.id, name: "South Sea Pearl Necklace", sku: "HG-JWL-005", category: "Necklaces", price: 350000, stock: 1, lowStockThreshold: 1, isActive: true },
    }),
  ]);

  await Promise.all([
    prisma.customer.create({
      data: { id: "hg-cust-sunita", projectId: hog.id, name: "Sunita Kapoor", phone: "+91 98765 03333", email: "sunita@example.com", totalOrders: 3, totalSpent: 450000 },
    }),
    prisma.customer.create({
      data: { id: "hg-cust-aravind", projectId: hog.id, name: "Aravind Menon", phone: "+91 98765 04444", email: "aravind@example.com", totalOrders: 2, totalSpent: 235000 },
    }),
  ]);

  await prisma.order.create({
    data: {
      orderNumber: "HG-0001", projectId: hog.id, customerId: "hg-cust-sunita", source: "WHATSAPP", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "BANK_TRANSFER", totalAmount: 150000,
      items: { create: [{ productId: "hg-jewel-001", productName: "Diamond Solitaire Ring (GIA Certified)", quantity: 1, unitPrice: 150000, lineTotal: 150000 }] },
      timeline: { create: [
        { status: "PENDING", note: "Private viewing request via WhatsApp" },
        { status: "CONFIRMED", note: "Payment received via bank transfer" },
        { status: "PROCESSING", note: "Ring being prepared in atelier" },
        { status: "SHIPPED", note: "Dispatched with insured courier" },
        { status: "DELIVERED", note: "Delivered and confirmed by client" },
      ] },
    },
  });

  await prisma.lead.create({
    data: { projectId: hog.id, name: "Neha Agarwal", email: "neha.a@example.com", phone: "+91 99887 03333", source: "CALENDLY", status: "NEW", products: ["Engagement ring"], message: "Looking for a custom engagement ring — 2ct diamond, solitaire setting, budget around ₹3L" },
  });

  await prisma.contentEntry.create({
    data: { projectId: hog.id, title: "About Shree Giriraj Gems and Jewels", type: "Page", status: "Published", body: "Established 1995. Where value takes form. Fine jewelry crafted to preserve beauty, rarity, and legacy. A sanctuary for the world's most exceptional stones. Every piece in our vault undergoes rigorous GIA certification. Our design philosophy rejects ephemeral trends in favor of structural integrity and timeless silhouettes that endure through generations. The stone dictates the form." },
  });

  await prisma.contentEntry.create({
    data: { projectId: hog.id, title: "Crown Collection", type: "Page", status: "Published", body: "Nine curated high jewellery masterpieces selected to reflect the house's pursuit of rarity, craftsmanship, and gemstone excellence." },
  });

  await prisma.whatsAppConversation.create({
    data: {
      projectId: hog.id, waContactId: "919988703333", status: "ACTIVE", unreadCount: 1, lastMessageAt: new Date(),
      messages: {
        create: [
          { direction: "INBOUND", content: "I'm looking for a GIA-certified emerald ring for a family heirloom piece. Do you have options I can view?", messageType: "text", createdAt: new Date(Date.now() - 1800000) },
        ],
      },
    },
  });

  // ═══════════════════════════════════════════════
  // TS AROMATICS — B2B Essential Oils & Butters
  // ═══════════════════════════════════════════════

  await Promise.all([
    prisma.product.create({
      data: { id: "ts-carrier-001", projectId: tsa.id, name: "Extra Virgin Coconut Oil (Fractionated)", sku: "TS-CARR-001", category: "Carrier Oils", price: 350, stock: 100, lowStockThreshold: 20, isActive: true },
    }),
    prisma.product.create({
      data: { id: "ts-carrier-002", projectId: tsa.id, name: "Jojoba Oil (Premium)", sku: "TS-CARR-002", category: "Carrier Oils", price: 650, stock: 80, lowStockThreshold: 15, isActive: true },
    }),
    prisma.product.create({
      data: { id: "ts-carrier-003", projectId: tsa.id, name: "Sweet Almond Oil", sku: "TS-CARR-003", category: "Carrier Oils", price: 250, stock: 120, lowStockThreshold: 25, isActive: true },
    }),
    prisma.product.create({
      data: { id: "ts-carrier-004", projectId: tsa.id, name: "Avocado Oil (Rich)", sku: "TS-CARR-004", category: "Carrier Oils", price: 400, stock: 60, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "ts-butter-001", projectId: tsa.id, name: "Shea Butter (Ultra-Refined)", sku: "TS-BTR-001", category: "Butters", price: 450, stock: 50, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "ts-butter-002", projectId: tsa.id, name: "Cocoa Butter (Natural Deodorised)", sku: "TS-BTR-002", category: "Butters", price: 350, stock: 45, lowStockThreshold: 10, isActive: true },
    }),
    prisma.product.create({
      data: { id: "ts-butter-003", projectId: tsa.id, name: "Mango Butter (Soft Spreadable)", sku: "TS-BTR-003", category: "Butters", price: 400, stock: 40, lowStockThreshold: 10, isActive: true },
    }),
  ]);

  await Promise.all([
    prisma.customer.create({
      data: { id: "ts-cust-natural", projectId: tsa.id, name: "Natural Bliss Cosmetics", phone: "+91 99887 01111", email: "info@naturalbliss.in", totalOrders: 6, totalSpent: 89200 },
    }),
    prisma.customer.create({
      data: { id: "ts-cust-aroma", projectId: tsa.id, name: "AromaCraft Labs", phone: "+91 99887 02222", email: "sourcing@aromacraft.in", totalOrders: 3, totalSpent: 45000 },
    }),
  ]);

  await prisma.order.create({
    data: {
      orderNumber: "TS-0001", projectId: tsa.id, customerId: "ts-cust-natural", source: "WHATSAPP", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "BANK_TRANSFER", totalAmount: 35000,
      items: { create: [
        { productId: "ts-carrier-001", productName: "Extra Virgin Coconut Oil (Fractionated)", quantity: 50, unitPrice: 350, lineTotal: 17500 },
        { productId: "ts-carrier-002", productName: "Jojoba Oil (Premium)", quantity: 20, unitPrice: 650, lineTotal: 13000 },
        { productId: "ts-butter-001", productName: "Shea Butter (Ultra-Refined)", quantity: 10, unitPrice: 450, lineTotal: 4500 },
      ] },
      timeline: { create: [
        { status: "PENDING", note: "Bulk order via WhatsApp" },
        { status: "CONFIRMED", note: "Payment received" },
        { status: "PROCESSING", note: "Quality check passed" },
        { status: "SHIPPED", note: "Dispatched with cold chain" },
        { status: "DELIVERED", note: "Delivered to Pune facility" },
      ] },
    },
  });

  await Promise.all([
    prisma.customer.create({
      data: { id: "ts-cust-meera", projectId: tsa.id, name: "Meera Iyer", phone: "+91 99887 00333", email: "meera@example.com", totalOrders: 4, totalSpent: 5600 },
    }),
    prisma.customer.create({
      data: { id: "ts-cust-arjun", projectId: tsa.id, name: "Arjun Nair", phone: "+91 99887 00444", email: "arjun@example.com", totalOrders: 2, totalSpent: 2800 },
    }),
  ]);

  await prisma.lead.create({
    data: { projectId: tsa.id, name: "Pooja Mehta", company: "Bloom Skincare", email: "pooja@bloomskincare.com", source: "WEBSITE_FORM", status: "NEW", products: ["Carrier oils", "Butters"], quantity: "50-100kg monthly", message: "Looking for bulk supply agreement for carrier oils and butters. Need COA and MSDS documents." },
  });

  await prisma.contentEntry.create({
    data: { projectId: tsa.id, title: "About Ts Aromatics", type: "Page", status: "Published", body: "A Legacy of Purity. Pure Aromatics. Ethical Sourcing. Built for Brands. TS Aromatics supplies premium essential oils and botanical ingredients for manufacturers, wellness founders, and formulators who need purity, documentation, and human support. Uncompromising purity with GC/MS documentation available on request. B2B flexibility with sample-to-bulk onboarding, private labelling, and custom blending." },
  });

  await prisma.contentEntry.create({
    data: { projectId: tsa.id, title: "Technical Documentation Library", type: "Page", status: "Published", body: "Access Safety Data Sheets (SDS) and Certificate of Analysis (COA) for all our oils. GC/MS verified batch data with full transparency. Ref ID batch tracking system for serious procurement teams." },
  });

  await prisma.whatsAppConversation.create({
    data: {
      projectId: tsa.id, waContactId: "919988701111", status: "ACTIVE", unreadCount: 1, lastMessageAt: new Date(Date.now() - 7200000),
      messages: {
        create: [
          { direction: "INBOUND", content: "Hi, I need the COA and GC/MS report for your Jojoba Oil batch TSA-24-045. Also interested in bulk pricing for 50L.", messageType: "text", createdAt: new Date(Date.now() - 7200000) },
          { direction: "OUTBOUND", content: "Certainly! Sending the documents now. For 50L, we can offer ₹580/100ml with free shipping. Would you like a sample?", messageType: "text", createdAt: new Date(Date.now() - 6600000) },
        ],
      },
    },
  });

  // ═══════════════════════════════════════════════
  // BHATIA MASTER CLASSES — JEE & NEET Coaching
  // ═══════════════════════════════════════════════

  await Promise.all([
    prisma.product.create({
      data: { id: "bmc-course-001", projectId: bmc.id, name: "JEE Main + Advanced (2-Year Program)", sku: "BMC-JEE-001", category: "JEE", price: 49999 },
    }),
    prisma.product.create({
      data: { id: "bmc-course-002", projectId: bmc.id, name: "NEET UG Preparation (2-Year Program)", sku: "BMC-NEET-001", category: "NEET", price: 49999 },
    }),
    prisma.product.create({
      data: { id: "bmc-course-003", projectId: bmc.id, name: "Foundation (Class 9-10)", sku: "BMC-FND-001", category: "Foundation", price: 29999 },
    }),
    prisma.product.create({
      data: { id: "bmc-course-004", projectId: bmc.id, name: "Crash Course — JEE Mains", sku: "BMC-CRJ-001", category: "Crash Course", price: 19999 },
    }),
    prisma.product.create({
      data: { id: "bmc-course-005", projectId: bmc.id, name: "Crash Course — NEET", sku: "BMC-CRN-001", category: "Crash Course", price: 19999 },
    }),
    prisma.product.create({
      data: { id: "bmc-course-006", projectId: bmc.id, name: "Short-Term Revision Batch", sku: "BMC-RVB-001", category: "Revision", price: 9999 },
    }),
  ]);

  await Promise.all([
    prisma.customer.create({
      data: { id: "bmc-cust-arjun", projectId: bmc.id, name: "Arjun Sharma", phone: "+91 98765 00555", email: "arjun.s@example.com", totalOrders: 1, totalSpent: 49999 },
    }),
    prisma.customer.create({
      data: { id: "bmc-cust-neha", projectId: bmc.id, name: "Neha Patel", phone: "+91 98765 00666", email: "neha.p@example.com", totalOrders: 1, totalSpent: 49999 },
    }),
    prisma.customer.create({
      data: { id: "bmc-cust-rohit", projectId: bmc.id, name: "Rohit Verma", phone: "+91 98765 00777", email: "rohit.v@example.com", totalOrders: 2, totalSpent: 79998 },
    }),
  ]);

  await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "BMC-0001", projectId: bmc.id, customerId: "bmc-cust-arjun", source: "MANUAL", status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "UPI", totalAmount: 49999,
        items: { create: [{ productId: "bmc-course-001", productName: "JEE Main + Advanced (2-Year Program)", quantity: 1, unitPrice: 49999, lineTotal: 49999 }] },
        timeline: { create: [
          { status: "PENDING", note: "Enrollment form submitted" },
          { status: "CONFIRMED", note: "Payment received via UPI" },
        ] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BMC-0002", projectId: bmc.id, customerId: "bmc-cust-neha", source: "MANUAL", status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "BANK_TRANSFER", totalAmount: 49999,
        items: { create: [{ productId: "bmc-course-002", productName: "NEET UG Preparation (2-Year Program)", quantity: 1, unitPrice: 49999, lineTotal: 49999 }] },
        timeline: { create: [
          { status: "PENDING", note: "Enrollment form submitted" },
          { status: "CONFIRMED", note: "Payment confirmed via bank transfer" },
        ] },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BMC-0003", projectId: bmc.id, customerId: "bmc-cust-rohit", source: "MANUAL", status: "PENDING", paymentStatus: "UNPAID", totalAmount: 29999,
        items: { create: [{ productId: "bmc-course-003", productName: "Foundation (Class 9-10)", quantity: 1, unitPrice: 29999, lineTotal: 29999 }] },
        timeline: { create: [{ status: "PENDING", note: "Enrollment form submitted — awaiting payment" }] },
      },
    }),
  ]);

  await Promise.all([
    prisma.lead.create({
      data: { projectId: bmc.id, name: "Ananya Gupta", company: "St. Mary's School", email: "ananya.g@example.com", phone: "+91 99887 05555", source: "WEBSITE_FORM", status: "NEW", products: ["NEET coaching"], message: "Interested in NEET coaching for my daughter, currently in class 11 science stream" },
    }),
    prisma.lead.create({
      data: { projectId: bmc.id, name: "Vikram Joshi", email: "vikram.j@example.com", phone: "+91 99887 06666", source: "WHATSAPP", status: "CONTACTED", products: ["Crash course — JEE Mains"], message: "I'm a dropper, looking for the JEE Mains crash course starting in Jan. Is there still availability?" },
    }),
  ]);

  await Promise.all([
    prisma.contentEntry.create({
      data: { projectId: bmc.id, title: "About Bhatia Master Classes", type: "Page", status: "Published", body: "Ujjain's #1 JEE & NEET Coaching Institute. Founded by Shyam Bhatia — B.Tech, 12+ years teaching experience, mentor to AIR 4, 8, 9, 36, 42, 48, 199. 15+ ex-brand faculty, 90% success rate. 10,000+ students mentored. Concept-driven teaching that builds strong fundamentals and problem-solving skills." },
    }),
    prisma.contentEntry.create({
      data: { projectId: bmc.id, title: "BMC Challenger — Weekly Quiz", type: "Page", status: "Published", body: "One elite question every week. Crack it, share it, own it. Current challenge: A non-conductive transparent liquid containing an air bubble — advanced JEE Physics problem on refractive index and rates of change." },
    }),
    prisma.contentEntry.create({
      data: { projectId: bmc.id, title: "NEET 2026 Guess Paper", type: "Resource", status: "Published", body: "Free NEET 2026 Guess Paper by Shyam Bhatia Sir. Based on latest exam pattern, important chapters & repeated topics from past 5 years. PCB covered — Physics + Chemistry + Biology. 100+ questions with answer key." },
    }),
    prisma.contentEntry.create({
      data: { projectId: bmc.id, title: "Free Study Resources", type: "Collection", status: "Published", body: "DPP Sheets (Daily Practice Problems), PYQ Packs (Previous Year Questions), NIT Opening/Closing Ranks PDF, IIT Rank Cutoffs, NEET College Cutoffs — 100% free for every aspirant." },
    }),
  ]);

  await prisma.whatsAppConversation.create({
    data: {
      projectId: bmc.id, waContactId: "919876503333", status: "ACTIVE", unreadCount: 0, lastMessageAt: new Date(Date.now() - 172800000),
      messages: {
        create: [
          { direction: "INBOUND", content: "When does the next JEE Advanced batch start? Also, can I attend a demo class first?", messageType: "text", createdAt: new Date(Date.now() - 172800000) },
          { direction: "OUTBOUND", content: "Hi! Next batch starts April 15th. Yes, you're welcome for a free demo class. Would you like to come in this Saturday at 11 AM? Our centre is at 10/1 Kalidas Marg, Ujjain.", messageType: "text", createdAt: new Date(Date.now() - 169200000) },
          { direction: "INBOUND", content: "Saturday works! I'll come by. Also, is there a discount if I enroll with a friend?", messageType: "text", createdAt: new Date(Date.now() - 165600000) },
          { direction: "OUTBOUND", content: "Great, see you Saturday! Yes, we have a group enrollment offer — 10% off for pairs. Bring your friend along!", messageType: "text", createdAt: new Date(Date.now() - 162000000) },
        ],
      },
    },
  });

  // ──────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────

  console.log("✓ Seeded 4 projects with real business data\n");
  console.log("  Bighi Brothers       — 7 products, 4 customers, 4 orders, 3 leads, 4 content, 3 WhatsApp");
  console.log("  House of Giriraj     — 5 products, 2 customers, 1 order, 1 lead, 2 content, 1 WhatsApp");
  console.log("  Ts Aromatics         — 7 products, 4 customers, 1 order, 1 lead, 2 content, 1 WhatsApp");
  console.log("  Bhatia Master Classes — 6 products, 3 customers, 3 orders, 2 leads, 4 content, 1 WhatsApp");
  console.log(`  Users: 1 (admin@chiti.com)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
