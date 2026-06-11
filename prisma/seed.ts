import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:51214/postgres";
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const project = await prisma.project.upsert({
    where: { slug: "bighi-brothers" },
    update: {},
    create: {
      name: "Bighi Brothers",
      slug: "bighi-brothers",
      type: "ECOMMERCE",
      domain: "bighibrothers.com",
      integrationType: "API",
      isActive: true,
    },
  });

  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: "bb-incense-001" },
      update: {},
      create: {
        id: "bb-incense-001",
        projectId: project.id,
        name: "Premium Incense Sticks",
        sku: "BB-INC-001",
        category: "Incense",
        price: 299,
        stock: 45,
        lowStockThreshold: 10,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "bb-cone-002" },
      update: {},
      create: {
        id: "bb-cone-002",
        projectId: project.id,
        name: "Sandalwood Cone Pack",
        sku: "BB-CONE-002",
        category: "Cones",
        price: 199,
        stock: 8,
        lowStockThreshold: 10,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "bb-oil-003" },
      update: {},
      create: {
        id: "bb-oil-003",
        projectId: project.id,
        name: "Rose Essential Oil",
        sku: "BB-OIL-003",
        category: "Oils",
        price: 899,
        stock: 22,
        lowStockThreshold: 5,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "bb-spray-004" },
      update: {},
      create: {
        id: "bb-spray-004",
        projectId: project.id,
        name: "Lavender Room Spray",
        sku: "BB-SPR-004",
        category: "Sprays",
        price: 449,
        stock: 3,
        lowStockThreshold: 10,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "bb-diya-005" },
      update: {},
      create: {
        id: "bb-diya-005",
        projectId: project.id,
        name: "Brass Diya Set",
        sku: "BB-DIY-005",
        category: "Decor",
        price: 599,
        stock: 15,
        lowStockThreshold: 5,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "bb-thali-006" },
      update: {},
      create: {
        id: "bb-thali-006",
        projectId: project.id,
        name: "Silk Puja Thali",
        sku: "BB-THL-006",
        category: "Thalis",
        price: 1299,
        stock: 0,
        lowStockThreshold: 3,
        isActive: true,
      },
    }),
  ]);

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: "cust-anita" },
      update: {},
      create: {
        id: "cust-anita",
        projectId: project.id,
        name: "Anita Sharma",
        phone: "+91 98765 43210",
        email: "anita@example.com",
        totalOrders: 12,
        totalSpent: 45230,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-rahul" },
      update: {},
      create: {
        id: "cust-rahul",
        projectId: project.id,
        name: "Rahul Verma",
        phone: "+91 87654 32109",
        email: "rahul@example.com",
        totalOrders: 8,
        totalSpent: 23400,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-priya" },
      update: {},
      create: {
        id: "cust-priya",
        projectId: project.id,
        name: "Priya Patel",
        phone: "+91 76543 21098",
        email: "priya@example.com",
        totalOrders: 15,
        totalSpent: 67890,
      },
    }),
    prisma.customer.upsert({
      where: { id: "cust-vikram" },
      update: {},
      create: {
        id: "cust-vikram",
        projectId: project.id,
        name: "Vikram Singh",
        phone: "+91 65432 10987",
        email: "vikram@example.com",
        totalOrders: 3,
        totalSpent: 8990,
      },
    }),
  ]);

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "BB-0042",
        projectId: project.id,
        customerId: "cust-anita",
        source: "WHATSAPP",
        status: "PENDING",
        paymentStatus: "UNPAID",
        totalAmount: 599,
        items: {
          create: [
            {
              productId: "bb-incense-001",
              productName: "Premium Incense Sticks",
              quantity: 2,
              unitPrice: 299,
              lineTotal: 598,
            },
          ],
        },
        timeline: {
          create: {
            status: "PENDING",
            note: "Order placed via WhatsApp",
          },
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BB-0041",
        projectId: project.id,
        customerId: "cust-rahul",
        source: "MANUAL",
        status: "SHIPPED",
        paymentStatus: "PAID",
        paymentMethod: "UPI",
        totalAmount: 299,
        items: {
          create: [
            {
              productId: "bb-cone-002",
              productName: "Sandalwood Cone Pack",
              quantity: 1,
              unitPrice: 199,
              lineTotal: 199,
            },
          ],
        },
        timeline: {
          create: [
            { status: "PENDING", note: "Order created" },
            { status: "CONFIRMED", note: "Payment confirmed via UPI" },
            { status: "PROCESSING", note: "Item packed" },
            { status: "SHIPPED", note: "Dispatched via Delhivery" },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BB-0040",
        projectId: project.id,
        customerId: "cust-priya",
        source: "WEB_CHECKOUT",
        status: "DELIVERED",
        paymentStatus: "PAID",
        paymentMethod: "RAZORPAY",
        totalAmount: 898,
        items: {
          create: [
            {
              productId: "bb-incense-001",
              productName: "Premium Incense Sticks",
              quantity: 3,
              unitPrice: 299,
              lineTotal: 897,
            },
          ],
        },
        timeline: {
          create: [
            { status: "PENDING", note: "Order placed via website" },
            { status: "CONFIRMED", note: "Payment received via Razorpay" },
            { status: "PROCESSING", note: "Order being prepared" },
            { status: "SHIPPED", note: "Handed to courier" },
            { status: "DELIVERED", note: "Delivered successfully" },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: "BB-0039",
        projectId: project.id,
        customerId: "cust-vikram",
        source: "WHATSAPP",
        status: "PROCESSING",
        paymentStatus: "UNPAID",
        totalAmount: 299,
        items: {
          create: [
            {
              productId: "bb-cone-002",
              productName: "Sandalwood Cone Pack",
              quantity: 1,
              unitPrice: 199,
              lineTotal: 199,
            },
          ],
        },
        timeline: {
          create: [
            { status: "PENDING", note: "Order placed via WhatsApp" },
            { status: "CONFIRMED", note: "Order confirmed" },
            { status: "PROCESSING", note: "Being packed" },
          ],
        },
      },
    }),
  ]);

  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        projectId: project.id,
        name: "Rajesh Kumar",
        company: "Herbal Store",
        email: "rajesh@herbalstore.com",
        phone: "+91 99887 76655",
        source: "WEBSITE_FORM",
        status: "NEW",
        products: ["Incense sticks bulk"],
        message: "Looking for wholesale pricing on incense sticks",
      },
    }),
    prisma.lead.create({
      data: {
        projectId: project.id,
        name: "Sneha Reddy",
        company: "Wellness Hub",
        email: "sneha@wellnesshub.com",
        source: "WHATSAPP",
        status: "CONTACTED",
        products: ["Essential oils"],
        message: "Need essential oils for spa",
      },
    }),
    prisma.lead.create({
      data: {
        projectId: project.id,
        name: "Amit Joshi",
        company: "Pooja Supplies",
        email: "amit@poojasupplies.in",
        source: "CALENDLY",
        status: "QUALIFIED",
        products: ["Custom thali set"],
        quantity: "50 units",
      },
    }),
  ]);

  const contentEntries = await Promise.all([
    prisma.contentEntry.create({
      data: {
        projectId: project.id,
        title: "About Us — Bighi Brothers",
        type: "Page",
        status: "Published",
      },
    }),
    prisma.contentEntry.create({
      data: {
        projectId: project.id,
        title: "Product Catalog — Incense",
        type: "Collection",
        status: "Draft",
      },
    }),
    prisma.contentEntry.create({
      data: {
        projectId: project.id,
        title: "Homepage Banner — Summer Sale",
        type: "Banner",
        status: "Draft",
      },
    }),
  ]);

  const whatsappConversations = await Promise.all([
    prisma.whatsAppConversation.create({
      data: {
        projectId: project.id,
        customerId: "cust-anita",
        waContactId: "919876543210",
        status: "ACTIVE",
        unreadCount: 2,
        lastMessageAt: new Date(),
        messages: {
          create: [
            { direction: "INBOUND", content: "Hi, I wanted to check if the Premium Incense Sticks are back in stock?", messageType: "text", createdAt: new Date(Date.now() - 3600000) },
            { direction: "OUTBOUND", content: "Yes, Anita! We just restocked them. Would you like to place an order?", messageType: "text", createdAt: new Date(Date.now() - 3000000) },
            { direction: "INBOUND", content: "Great! Please add 2 packs to my order BB-0042.", messageType: "text", createdAt: new Date(Date.now() - 2400000) },
            { direction: "OUTBOUND", content: "Done! I've updated your order. You'll receive a confirmation shortly.", messageType: "text", createdAt: new Date(Date.now() - 1800000) },
          ],
        },
      },
    }),
    prisma.whatsAppConversation.create({
      data: {
        projectId: project.id,
        waContactId: "919988776655",
        status: "ACTIVE",
        unreadCount: 1,
        lastMessageAt: new Date(Date.now() - 600000),
        messages: {
          create: [
            { direction: "INBOUND", content: "Hello, do you do bulk orders for wedding return gifts?", messageType: "text", createdAt: new Date(Date.now() - 600000) },
          ],
        },
      },
    }),
    prisma.whatsAppConversation.create({
      data: {
        projectId: project.id,
        customerId: "cust-vikram",
        waContactId: "916543210987",
        status: "RESOLVED",
        unreadCount: 0,
        lastMessageAt: new Date(Date.now() - 86400000),
        messages: {
          create: [
            { direction: "INBOUND", content: "Has my order BB-0039 been dispatched?", messageType: "text", createdAt: new Date(Date.now() - 86400000) },
            { direction: "OUTBOUND", content: "Yes Vikram, it's being packed and will be shipped tomorrow. Here's the tracking link: bighibrothers.com/track/BB0039", messageType: "text", createdAt: new Date(Date.now() - 82800000) },
            { direction: "INBOUND", content: "Thank you! Please share the tracking number once available.", messageType: "text", createdAt: new Date(Date.now() - 79200000) },
            { direction: "OUTBOUND", content: "Will do! Let me know if you need anything else.", messageType: "text", createdAt: new Date(Date.now() - 75600000) },
          ],
        },
      },
    }),
  ]);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@chiti.com" },
    update: {},
    create: {
      email: "admin@chiti.com",
      name: "Dev Admin",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.userProject.upsert({
    where: { userId_projectId: { userId: adminUser.id, projectId: project.id } },
    update: {},
    create: {
      userId: adminUser.id,
      projectId: project.id,
      role: "ADMIN",
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: "giriraj-handicrafts" },
    update: {},
    create: {
      name: "House of Giriraj",
      slug: "giriraj-handicrafts",
      type: "B2B_CATALOG",
      domain: "girirajcrafts.com",
      integrationType: "CMS",
      isActive: true,
    },
  });

  await Promise.all([
    prisma.product.upsert({
      where: { id: "gh-murti-001" },
      update: {},
      create: {
        id: "gh-murti-001",
        projectId: project2.id,
        name: "Marble Ganesh Murti",
        sku: "GH-MUR-001",
        category: "Idols",
        price: 2499,
        stock: 12,
        lowStockThreshold: 3,
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "gh-lamp-002" },
      update: {},
      create: {
        id: "gh-lamp-002",
        projectId: project2.id,
        name: "Brass Diya Lamp",
        sku: "GH-LMP-002",
        category: "Decor",
        price: 899,
        stock: 25,
        lowStockThreshold: 5,
        isActive: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.customer.upsert({
      where: { id: "gh-cust-sunil" },
      update: {},
      create: {
        id: "gh-cust-sunil",
        projectId: project2.id,
        name: "Sunil Mehta",
        phone: "+91 98765 01111",
        email: "sunil@example.com",
        totalOrders: 4,
        totalSpent: 15980,
      },
    }),
    prisma.customer.upsert({
      where: { id: "gh-cust-neha" },
      update: {},
      create: {
        id: "gh-cust-neha",
        projectId: project2.id,
        name: "Neha Kapoor",
        phone: "+91 98765 02222",
        email: "neha@example.com",
        totalOrders: 2,
        totalSpent: 4998,
      },
    }),
  ]);

  await prisma.lead.create({
    data: {
      projectId: project2.id,
      name: "Rohit Agarwal",
      company: "Temple Decor",
      email: "rohit@templedecor.in",
      source: "WEBSITE_FORM",
      status: "NEW",
      products: ["Marble idols"],
      message: "Looking for custom marble murtis for temple renovation",
    },
  });

  await prisma.contentEntry.create({
    data: {
      projectId: project2.id,
      title: "About House of Giriraj",
      type: "Page",
      status: "Published",
      body: "House of Giriraj specializes in handcrafted marble and brass decor for temples and homes. Established in 2010, we serve over 200 retail partners across India.",
    },
  });

  await prisma.whatsAppConversation.create({
    data: {
      projectId: project2.id,
      waContactId: "919876501111",
      status: "ACTIVE",
      unreadCount: 1,
      lastMessageAt: new Date(),
      messages: {
        create: [
          { direction: "INBOUND", content: "Hi, do you have marble Ganesh idols in stock?", messageType: "text", createdAt: new Date(Date.now() - 1200000) },
        ],
      },
    },
  });

  await prisma.userProject.upsert({
    where: { userId_projectId: { userId: adminUser.id, projectId: project2.id } },
    update: {},
    create: {
      userId: adminUser.id,
      projectId: project2.id,
      role: "ADMIN",
    },
  });

  console.log("Seeded Bighi Brothers project with:");
  console.log(`  Project: ${project.name} (${project.id})`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Customers: ${customers.length}`);
  console.log(`  Orders: ${orders.length}`);
  console.log(`  Leads: ${leads.length}`);
  console.log(`  Content: ${contentEntries.length}`);
  console.log(`  WhatsApp Conversations: ${whatsappConversations.length}`);
  console.log("");
  console.log("Seeded House of Giriraj project:");
  console.log(`  Products: 2, Customers: 2, Leads: 1, Content: 1, WhatsApp: 1`);
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
