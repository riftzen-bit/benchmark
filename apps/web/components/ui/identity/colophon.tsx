export function Colophon({ left, right }: { left: string; right: string }) {
  return (
    <div className="mono flex justify-between border-t border-[var(--rule)] px-8 py-[18px] text-[10px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
