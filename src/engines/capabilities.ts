import { Capability, ENGINE_REGISTRY } from "./registry";

export function hasCapability(enabled: Capability[], capability: Capability): boolean {
  return enabled.includes(capability);
}

export function hasAllCapabilities(enabled: Capability[], required: Capability[]): boolean {
  return required.every((c) => enabled.includes(c));
}

export function hasAnyCapability(enabled: Capability[], required: Capability[]): boolean {
  return required.some((c) => enabled.includes(c));
}

export function getEnabledEngines(enabled: Capability[]): Capability[] {
  const result: Capability[] = [];
  for (const cap of enabled) {
    const def = ENGINE_REGISTRY[cap];
    if (def?.dependsOn) {
      const depsMet = def.dependsOn.every((d) => enabled.includes(d as Capability));
      if (!depsMet) continue;
    }
    result.push(cap);
  }
  return result;
}

export function getEngineNavItems(enabled: Capability[]) {
  const items: { label: string; href: string; icon: string; children?: { label: string; href: string; icon: string }[] }[] = [];
  for (const cap of getEnabledEngines(enabled)) {
    const def = ENGINE_REGISTRY[cap];
    if (def) items.push(...def.navItems);
  }
  return items;
}

export function getDashboardSections(enabled: Capability[]): string[] {
  const sections: string[] = [];
  for (const cap of getEnabledEngines(enabled)) {
    const def = ENGINE_REGISTRY[cap];
    if (def?.dashboardSection && !sections.includes(def.dashboardSection)) {
      sections.push(def.dashboardSection);
    }
  }
  return sections;
}

export function projectTypeToCapabilities(type: string): Capability[] {
  switch (type) {
    case "MARKETPLACE":
      return ["COMMERCE", "MARKETPLACE", "CRM", "FINANCE", "ANALYTICS", "AI"];
    case "ECOMMERCE":
      return ["COMMERCE", "CRM", "ANALYTICS", "AI"];
    case "B2B_CATALOG":
      return ["COMMERCE", "CRM", "ANALYTICS"];
    case "SAAS":
      return ["CRM", "ANALYTICS"];
    case "CONTENT":
      return ["CONTENT", "ANALYTICS"];
    default:
      return ["COMMERCE", "CRM", "ANALYTICS"];
  }
}

export function getDefaultNavItems(): { label: string; href: string; icon: string }[] {
  return [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Analytics", href: "/analytics", icon: "ChartColumn" },
    { label: "Settings", href: "/settings", icon: "Settings" },
    { label: "System", href: "/system", icon: "Monitor" },
  ];
}
