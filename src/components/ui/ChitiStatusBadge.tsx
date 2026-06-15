const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "error",
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  UNPAID: "error",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "default",
};

const LEAD_STATUS_MAP: Record<string, string> = {
  NEW: "info",
  CONTACTED: "info",
  QUALIFIED: "warning",
  PROPOSAL: "warning",
  WON: "success",
  LOST: "error",
};

const STATUS_MAPS: Record<string, Record<string, string>> = {
  order: ORDER_STATUS_MAP,
  payment: PAYMENT_STATUS_MAP,
  lead: LEAD_STATUS_MAP,
};

type StatusType = "order" | "payment" | "lead" | "default";

interface ChitiStatusBadgeProps {
  status: string;
  type?: StatusType;
  dot?: boolean;
}

const styleMap: Record<string, string> = {
  default: "bg-surface-2 text-text-muted",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

const dotColorMap: Record<string, string> = {
  default: "bg-text-muted",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

export default function ChitiStatusBadge({ status, type = "default", dot = false }: ChitiStatusBadgeProps) {
  const map = STATUS_MAPS[type];
  const variant = map?.[status] || "default";

  if (dot) {
    return (
      <span className={`flex items-center gap-1.5 label-caps ${styleMap[variant]}`}>
        <span className={`status-dot ${dotColorMap[variant]}`} />
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${styleMap[variant]}`}>
      {status}
    </span>
  );
}
