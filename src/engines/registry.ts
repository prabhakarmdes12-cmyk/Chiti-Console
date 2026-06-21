export interface EngineDefinition {
  id: string;
  label: string;
  description: string;
  dependsOn?: string[];
  navItems: EngineNavItem[];
  dashboardSection?: string;
}

export interface EngineNavItem {
  label: string;
  href: string;
  icon: string;
  children?: EngineNavItem[];
}

export type Capability = "COMMERCE" | "MARKETPLACE" | "CRM" | "FINANCE" | "CONTENT" | "ANALYTICS" | "AI";

export const ENGINE_REGISTRY: Record<Capability, EngineDefinition> = {
  COMMERCE: {
    id: "COMMERCE",
    label: "Commerce",
    description: "Orders, products, inventory management",
    navItems: [
      { label: "Orders", href: "/orders", icon: "ShoppingCart" },
      { label: "Products", href: "/products", icon: "Package" },
    ],
    dashboardSection: "ECOMMERCE",
  },
  MARKETPLACE: {
    id: "MARKETPLACE",
    label: "Marketplace",
    description: "Vendors, listings, enquiries, bookings",
    dependsOn: ["COMMERCE"],
    navItems: [
      { label: "Vendors", href: "/vendors", icon: "Building2" },
      { label: "Listings", href: "/listings", icon: "ClipboardList" },
      { label: "Enquiries", href: "/enquiries", icon: "MessageSquare" },
    ],
    dashboardSection: "MARKETPLACE",
  },
  CRM: {
    id: "CRM",
    label: "CRM",
    description: "Customers, leads, WhatsApp communication",
    navItems: [
      { label: "Customers", href: "/customers", icon: "Users" },
      { label: "Leads", href: "/leads", icon: "Target" },
      { label: "WhatsApp", href: "/whatsapp", icon: "MessageCircle" },
    ],
    dashboardSection: "B2B_CATALOG",
  },
  FINANCE: {
    id: "FINANCE",
    label: "Finance",
    description: "Escrow, payouts, refunds, wallets, invoices",
    dependsOn: ["MARKETPLACE"],
    navItems: [
      {
        label: "Finance", href: "/finance", icon: "Landmark",
        children: [
          { label: "Escrow", href: "/finance/escrow", icon: "ShieldCheck" },
          { label: "Wallets", href: "/finance/wallets", icon: "Wallet" },
          { label: "Payouts", href: "/finance/payouts", icon: "ArrowUpRight" },
          { label: "Refunds", href: "/finance/refunds", icon: "ArrowDownLeft" },
          { label: "Commissions", href: "/finance/commissions", icon: "Percent" },
        ],
      },
    ],
  },
  CONTENT: {
    id: "CONTENT",
    label: "Content",
    description: "CMS, blog posts, pages",
    navItems: [
      { label: "Content", href: "/content", icon: "FileText" },
    ],
    dashboardSection: "CONTENT",
  },
  ANALYTICS: {
    id: "ANALYTICS",
    label: "Analytics",
    description: "Reports, dashboards, exports",
    navItems: [
      { label: "Analytics", href: "/analytics", icon: "ChartColumn" },
    ],
  },
  AI: {
    id: "AI",
    label: "AI",
    description: "Business assistant, automation, forecasting",
    navItems: [],
  },
};
