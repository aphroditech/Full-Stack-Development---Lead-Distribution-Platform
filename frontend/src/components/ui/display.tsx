import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/api-types";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  unsent: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  duplicate: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-stroke px-6 py-14 text-center dark:border-dark-3">
      <h3 className="text-lg font-semibold text-dark dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-dark-5 dark:text-dark-6">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
