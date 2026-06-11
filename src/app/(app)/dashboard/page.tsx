import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ShoppingCart, TrendingUp, Users, DollarSign } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getProjectId, projectFilter } from "@/lib/db/queries";
import ChitiStatCard from "@/components/ui/ChitiStatCard";
import ChitiCard from "@/components/ui/ChitiCard";
import ChitiPageHeader from "@/components/ui/ChitiPageHeader";
import ChitiStatusBadge from "@/components/ui/ChitiStatusBadge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projectId = await getProjectId();
  const today = new Date();
  today.setDate(today.getDate() - 1);

  const [orderCount, revenue, customerCount, recentOrders, projects] = await Promise.all([
    prisma.order.count({
      where: { ...projectFilter(projectId), createdAt: { gte: today } },
    }),
    prisma.order.aggregate({
      where: { ...projectFilter(projectId) },
      _sum: { totalAmount: true },
    }),
    prisma.customer.count({ where: { ...projectFilter(projectId) } }),
    prisma.order.findMany({
      where: { ...projectFilter(projectId) },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { customer: true },
    }),
    prisma.project.findMany({
      where: { isActive: true },
      select: { name: true, id: true },
    }),
  ]);

  const totalRevenue = revenue._sum.totalAmount ?? 0;
  const conversionRate = orderCount > 0 ? ((orderCount / (customerCount || 1)) * 100).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Revenue", value: `₹${Number(totalRevenue).toLocaleString("en-IN")}`, change: "+12%", icon: DollarSign, color: "text-success" },
    { label: "Orders Today", value: String(orderCount), change: "+3", icon: ShoppingCart, color: "text-brand-secondary" },
    { label: "Active Customers", value: String(customerCount), change: "+5", icon: Users, color: "text-dataviz-sapphire" },
    { label: "Conversion Rate", value: `${conversionRate}%`, change: "+0.8%", icon: TrendingUp, color: "text-dataviz-amber" },
  ];

  return (
    <div className="space-y-6">
      <ChitiPageHeader
        title={`Good morning, ${session.user.name?.split(" ")[0] || "there"}`}
        description="Here is your operations overview."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <ChitiStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.length === 0 && (
              <p className="text-sm text-text-muted py-4 text-center">No orders yet</p>
            )}
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-text-main font-medium">{order.customer?.name || "Unknown"}</p>
                  <p className="text-xs text-text-muted">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-main">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                  <ChitiStatusBadge status={order.status} type="order" />
                </div>
              </div>
            ))}
          </div>
        </ChitiCard>

        <ChitiCard>
          <h2 className="text-sm font-medium text-text-muted mb-4">Active Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <p className="text-sm text-text-main">{project.name}</p>
                </div>
              </div>
            ))}
          </div>
        </ChitiCard>
      </div>
    </div>
  );
}
