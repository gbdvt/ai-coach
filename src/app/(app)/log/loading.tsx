import { DashboardCard } from "@/components/ui/DashboardCard";

export default function LogLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-14 rounded-xl bg-zinc-900/50" />
      <DashboardCard>
        <div className="h-96 rounded-xl bg-zinc-900/40" />
      </DashboardCard>
    </div>
  );
}
