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

  console.log("Seeded Bighi Brothers project with:");
  console.log(`  Project: ${project.name} (${project.id})`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Customers: ${customers.length}`);
  console.log(`  Orders: ${orders.length}`);
  console.log(`  Leads: ${leads.length}`);
  console.log(`  Content: ${contentEntries.length}`);
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
