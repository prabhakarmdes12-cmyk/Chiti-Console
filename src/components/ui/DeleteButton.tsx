"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  label?: string;
  className?: string;
}

export default function DeleteButton({ onDelete, label, className }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onDelete();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className || "text-text-muted hover:text-error transition-colors"} title="Delete">
        {label ? label : <Trash2 className="w-3.5 h-3.5" />}
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Deletion"
        message="This action cannot be undone. Are you sure you want to delete this item?"
        confirmLabel="Delete"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
