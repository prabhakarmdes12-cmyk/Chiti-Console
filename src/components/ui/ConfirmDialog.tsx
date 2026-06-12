"use client";


import ChitiModal from "./ChitiModal";
import ChitiButton from "./ChitiButton";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  loading,
}: ConfirmDialogProps) {
  return (
    <ChitiModal open={open} onClose={onClose} title="">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${variant === "danger" ? "bg-error/10" : variant === "warning" ? "bg-warning/10" : "bg-info/10"}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === "danger" ? "text-error" : variant === "warning" ? "text-warning" : "text-info"}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main">{title}</h3>
            <p className="text-sm text-text-muted mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <ChitiButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ChitiButton>
          <ChitiButton
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmLabel}
          </ChitiButton>
        </div>
      </div>
    </ChitiModal>
  );
}
