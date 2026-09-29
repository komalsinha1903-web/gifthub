export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-zinc-800 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-500">Fetching records...</p>
      </div>
    </div>
  );
}