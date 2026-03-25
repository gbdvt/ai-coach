import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function DashboardCard({ title, children, className = "", action }: Props) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-sm backdrop-blur-sm ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-2">
          {title ? (
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
