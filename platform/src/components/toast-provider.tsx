"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";

type ToastVariant = "success" | "error";
type ToastAction = { label: string; href: string };
type Toast = { id: number; message: string; variant: ToastVariant; action?: ToastAction };
type ShowToast = (message: string, variant: ToastVariant, action?: ToastAction) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useSitePreferences();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ShowToast>((message, variant, action) => {
    const id = ++nextId.current;
    setToasts((current) => [...current.slice(-3), { id, message, variant, action }]);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-viewport">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} closeLabel={t("close")} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, closeLabel, onDismiss }: { toast: Toast; closeLabel: string; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.variant === "error" ? 8000 : 5500);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id, toast.variant]);

  return (
    <div className={`notice ${toast.variant} toast-item`} role={toast.variant === "error" ? "alert" : "status"}>
      <span>{toast.message}</span>
      {toast.action && <Link className="toast-action" href={toast.action.href}>{toast.action.label}</Link>}
      <button className="toast-dismiss" type="button" aria-label={closeLabel} onClick={() => onDismiss(toast.id)}>×</button>
    </div>
  );
}

export function ToastMessage({ message, variant, action }: { message?: string | null; variant: ToastVariant; action?: ToastAction }) {
  const showToast = useContext(ToastContext);
  const lastMessage = useRef("");

  if (!showToast) throw new Error("ToastMessage must be used within ToastProvider");

  useEffect(() => {
    const text = message?.trim() ?? "";
    if (!text) {
      lastMessage.current = "";
      return;
    }
    const fingerprint = `${variant}\u0000${text}\u0000${action?.label ?? ""}\u0000${action?.href ?? ""}`;
    if (lastMessage.current === fingerprint) return;
    lastMessage.current = fingerprint;
    showToast(text, variant, action);
  }, [action?.href, action?.label, message, showToast, variant]);

  return null;
}
