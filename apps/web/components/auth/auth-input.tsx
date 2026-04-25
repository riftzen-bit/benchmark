import { cn } from "@/lib/utils";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function AuthInput({ label, hint, id, className, ...rest }: Props) {
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className="grid gap-1.5">
      <span className="mono text-[10px] uppercase tracking-widest text-[var(--mute)]">
        {label}
      </span>
      <input
        id={fieldId}
        className={cn(
          "border border-[var(--mute)]/40 bg-[var(--background)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--mute)]/60 focus:border-[var(--accent)]",
          className,
        )}
        {...rest}
      />
      {hint ? (
        <span className="text-xs text-[var(--mute)]">{hint}</span>
      ) : null}
    </label>
  );
}
