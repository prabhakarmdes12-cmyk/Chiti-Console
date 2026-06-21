export { authenticate, requireRole, ADMIN_ROLES, FINANCE_ROLES } from "./lib/auth";
export { getCurrentUser, getCurrentUserRole, getAccessibleProjects, roleAtLeast } from "./lib/rbac";
export { checkCapability, getEnabledCapabilities, getProjectCapabilities } from "./lib/capabilities";
