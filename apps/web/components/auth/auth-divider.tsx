export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative my-2 flex items-center" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-[var(--rule)]" />
      <span className="mono mx-3 text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[var(--rule)]" />
    </div>
  );
}
