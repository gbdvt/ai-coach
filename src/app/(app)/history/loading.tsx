export default function HistoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-14 rounded-xl bg-zinc-900/50" />
      <div className="h-12 rounded-xl bg-zinc-900/40" />
      <div className="h-24 rounded-2xl bg-zinc-900/40" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-900/35" />
        ))}
      </div>
    </div>
  );
}
