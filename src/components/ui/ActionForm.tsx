"use client";

import { useState } from "react";
import { useToast } from "./ChitiToast";

interface ActionFormProps {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  successMessage?: string;
  className?: string;
  onSuccess?: () => void;
}

export default function ActionForm({ action, children, successMessage = "Done!", className, onSuccess }: ActionFormProps) {
  const { addToast } = useToast();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      addToast("success", successMessage);
      onSuccess?.();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      {pending && <span className="sr-only">Saving...</span>}
    </form>
  );
}
