import { SITE_META } from "@/lib/data/meta";
import { SOURCES } from "@/lib/data/sources";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-[var(--rule)]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Cập nhật
            </p>
            <p className="mt-2 font-mono text-sm">{SITE_META.lastUpdated}</p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Nguồn
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {SOURCES.map((s) => (
                <li key={s.id}>
                  <a
                    className="underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.publisher} — {s.label.replace(`${s.publisher} — `, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
              Lưu ý
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--mute)]">
              Dữ liệu là số liệu công khai do nhà cung cấp hoặc nhà phân tích bên thứ ba
              công bố. Trang không chạy model trực tiếp.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
