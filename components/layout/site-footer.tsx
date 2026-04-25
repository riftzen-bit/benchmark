import { SITE_META } from "@/lib/data/meta";
import { SOURCES } from "@/lib/data/sources";
import { SITE, NAV } from "@/lib/config/site";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-[var(--rule)]">
      <Container width="wide" className="py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="display text-2xl tracking-tight">
              frontier<span className="text-[var(--accent)]">·</span>
              <span className="italic">tape</span>
            </p>
            <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-[var(--mute)]">
              {SITE.tagline}
            </p>
            <p className="mono mt-6 text-xs text-[var(--mute)]">
              Issue {SITE.issue} · last updated {SITE_META.lastUpdated}
            </p>
          </div>

          <div className="md:col-span-3">
            <Eyebrow>Sections</Eyebrow>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <Eyebrow>Cited sources ({SOURCES.length})</Eyebrow>
            <ul className="mt-3 space-y-2 text-sm">
              {SOURCES.map((s) => (
                <li key={s.id} className="leading-snug">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--rule)] decoration-2 underline-offset-4 hover:decoration-[var(--accent)]"
                  >
                    {s.publisher}
                  </a>
                  <span className="ml-2 text-[var(--mute)]">
                    {s.label.replace(`${s.publisher} — `, "")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
