import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

export const queryToolSchemas = {
  getOrders: {
    description: "Query orders with optional filters. Use for questions about revenue, orders, sales, amounts.",
    inputSchema: z.object({
      minAmount: z.number().optional().describe("Minimum order amount in rupees"),
      maxAmount: z.number().optional().describe("Maximum order amount in rupees"),
      status: z.string().optional().describe("Order status: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED"),
      paymentStatus: z.string().optional().describe("Payment status: UNPAID, PAID, PARTIAL, REFUNDED"),
      daysBack: z.number().optional().describe("Only include orders from the last N days"),
      limit: z.number().optional().describe("Maximum number of orders to return"),
    }),
  },

  getRevenue: {
    description: "Get revenue data aggregated over a time period.",
    inputSchema: z.object({
      daysBack: z.number().optional().describe("Look back period in days"),
    }),
  },

  getCustomers: {
    description: "Query customer data. Use for questions about customers, clients, top spenders.",
    inputSchema: z.object({
      minOrders: z.number().optional().describe("Minimum number of orders"),
      topBySpend: z.boolean().optional().describe("Sort by total spent descending"),
      limit: z.number().optional(),
    }),
  },

  getProducts: {
    description: "Query product data. Use for questions about products, inventory, stock, out of stock items.",
    inputSchema: z.object({
      outOfStock: z.boolean().optional().describe("Only show products with stock = 0"),
      category: z.string().optional(),
      limit: z.number().optional(),
    }),
  },

  getLeads: {
    description: "Query lead data. Use for questions about leads, prospects, pipeline.",
    inputSchema: z.object({
      status: z.string().optional().describe("Filter by status: NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST"),
      minScore: z.number().optional().describe("Minimum AI lead score (0-100)"),
      daysBack: z.number().optional(),
      limit: z.number().optional(),
    }),
  },
};

export type ToolName = keyof typeof queryToolSchemas;

async function getCookieProjectId(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const id = cookieStore.get("chiti_project")?.value;
    return id && id !== "all" ? id : null;
  } catch {
    return null;
  }
}

function pf(projectId: string | null) {
  return projectId ? { projectId } : {};
}

type OrderArgs = { minAmount?: number; maxAmount?: number; status?: string; paymentStatus?: string; daysBack?: number; limit?: number };
type RevenueArgs = { daysBack?: number };
type CustomerArgs = { minOrders?: number; topBySpend?: boolean; limit?: number };
type ProductArgs = { outOfStock?: boolean; category?: string; limit?: number };
type LeadArgs = { status?: string; minScore?: number; daysBack?: number; limit?: number };

export async function executeTool(name: ToolName, rawArgs: Record<string, unknown>): Promise<unknown> {
  const pid = await getCookieProjectId();

  switch (name) {
    case "getOrders": {
      const args = rawArgs as OrderArgs;
      const where: any = { ...pf(pid) };
      if (args.minAmount !== undefined || args.maxAmount !== undefined) {
        where.totalAmount = {};
        if (args.minAmount !== undefined) where.totalAmount.gte = args.minAmount;
        if (args.maxAmount !== undefined) where.totalAmount.lte = args.maxAmount;
      }
      if (args.status) where.status = args.status;
      if (args.paymentStatus) where.paymentStatus = args.paymentStatus;
      if (args.daysBack) {
        const d = new Date(); d.setDate(d.getDate() - args.daysBack);
        where.createdAt = { gte: d };
      }
      const orders = await prisma.order.findMany({
        where, orderBy: { createdAt: "desc" }, take: args.limit ?? 10,
        include: { customer: { select: { name: true } } },
      });
      return orders.map((o) => ({
        orderNumber: o.orderNumber, amount: Number(o.totalAmount),
        status: o.status, paymentStatus: o.paymentStatus,
        customer: o.customer?.name || null, source: o.source,
        date: o.createdAt.toISOString().split("T")[0],
      }));
    }

    case "getRevenue": {
      const args = rawArgs as RevenueArgs;
      const where: any = { ...pf(pid) };
      if (args.daysBack) {
        const d = new Date(); d.setDate(d.getDate() - args.daysBack);
        where.createdAt = { gte: d };
      }
      const result = await prisma.order.aggregate({ where, _sum: { totalAmount: true }, _count: { id: true } });
      return { totalRevenue: Number(result._sum.totalAmount ?? 0), orderCount: result._count.id };
    }

    case "getCustomers": {
      const args = rawArgs as CustomerArgs;
      const where: any = { ...pf(pid) };
      if (args.minOrders) where.totalOrders = { gte: args.minOrders };
      const customers = await prisma.customer.findMany({
        where, orderBy: args.topBySpend ? { totalSpent: "desc" } : { createdAt: "desc" },
        take: args.limit ?? 10,
      });
      return customers.map((c) => ({ name: c.name, phone: c.phone, totalOrders: c.totalOrders, totalSpent: Number(c.totalSpent) }));
    }

    case "getProducts": {
      const args = rawArgs as ProductArgs;
      const where: any = { ...pf(pid), isActive: true };
      if (args.outOfStock) where.stock = 0;
      if (args.category) where.category = args.category;
      const products = await prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: args.limit ?? 10 });
      return products.map((p) => ({ name: p.name, category: p.category, price: Number(p.price), stock: p.stock }));
    }

    case "getLeads": {
      const args = rawArgs as LeadArgs;
      const where: any = { ...pf(pid) };
      if (args.status) where.status = args.status;
      if (args.minScore) where.score = { gte: args.minScore };
      if (args.daysBack) {
        const d = new Date(); d.setDate(d.getDate() - args.daysBack);
        where.createdAt = { gte: d };
      }
      const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: args.limit ?? 10 });
      return leads.map((l) => ({ name: l.name, company: l.company, status: l.status, score: l.score, source: l.source, date: l.createdAt.toISOString().split("T")[0] }));
    }

    default:
      return "Unknown tool";
  }
}
