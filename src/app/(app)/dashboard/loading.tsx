import { DashboardCard } from "@/components/ui/DashboardCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 rounded-2xl bg-zinc-900/50" />
      <DashboardCard title="Loading">
        <div className="h-24 rounded-xl bg-zinc-900/40" />
      </DashboardCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-40 rounded-2xl bg-zinc-900/40" />
        <div className="h-40 rounded-2xl bg-zinc-900/40" />
      </div>
    </div>
  );
}
