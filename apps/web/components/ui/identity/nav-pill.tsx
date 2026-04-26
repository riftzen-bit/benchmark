import Link from "next/link";

export type NavItem = { href: string; label: string };

export function NavPill({
  items,
  active,
  liveDotOn = false,
  signedInAs = null,
}: {
  items: NavItem[];
  active: string;
  liveDotOn?: boolean;
  signedInAs?: string | null;
}) {
  return (
    <nav
      aria-label="Primary"
      className="absolute left-1/2 top-0 z-20 -translate-x-1/2"
    >
      <div className="flex items-center gap-7 rounded-b-[22px] bg-black px-5 py-3">
        {items.map((it) => {
          const isActive = it.href === active;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "mono text-[11px] uppercase tracking-[0.14em] transition-colors " +
                (isActive ? "text-[var(--cream)]" : "text-[var(--cream-mute)] hover:text-[var(--cream)]")
              }
            >
              {it.label}
            </Link>
          );
        })}
        {liveDotOn && (
          <span className="flex items-center gap-1.5">
            <span
              data-pulse="live"
              className="h-[5px] w-[5px] rounded-full bg-[var(--pos)] [animation:pulse-soft_1.6s_ease-in-out_infinite]"
            />
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)]">Live</span>
          </span>
        )}
        {signedInAs ? (
          <Link
            href="/profile"
            className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream)]"
          >
            {signedInAs}
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="mono text-[11px] uppercase tracking-[0.14em] text-[var(--cream-mute)] hover:text-[var(--cream)]"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
