export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b101b] backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className="w-14 h-14 rounded-full border-2 border-zinc-800 border-t-amber-500 animate-spin" />
        {/* Inner Pulse Dot */}
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping absolute" />
      </div>

      <div className="mt-4 text-center">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400 font-bold block">
          Loading
        </span>
        <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">
          Synchronizing...
        </span>
      </div>
    </div>
  );
}