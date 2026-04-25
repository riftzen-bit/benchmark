import { PROMPTS } from "@/lib/data/prompts";
import { PLAYGROUNDS } from "@/lib/data/playgrounds";
import { PromptCard } from "@/components/prompt/prompt-card";

export const metadata = {
  title: "Tự thử — Opus 4.7 vs GPT-5.5",
};

export default function TestYourselfPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="mb-12 max-w-[60ch]">
        <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Tự kiểm chứng
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          Test thực tế, không cần API
        </h1>
        <p className="mt-4 text-[var(--mute)]">
          {PROMPTS.length} prompt khó được biên soạn để phân tách hai model. Copy → mở
          playground bên phải → paste cho từng model → so kết quả. Trang này không gửi
          dữ liệu của bạn đi đâu cả.
        </p>
      </header>

      <section className="mb-12 border-t border-[var(--rule)] pt-8">
        <h2 className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Playground khả dụng
        </h2>
        <ul className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          {PLAYGROUNDS.map((p) => (
            <li key={p.id} className="flex items-start gap-3">
              <span className={`mono text-[10px] uppercase tracking-widest ${
                p.needsAccount ? "text-[var(--mute)]" : "text-[var(--accent)]"
              }`}>
                {p.needsAccount ? "login" : "free"}
              </span>
              <div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  {p.label}
                </a>
                {p.note ? (
                  <p className="text-[var(--mute)]">{p.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        {PROMPTS.map((p) => (
          <PromptCard key={p.id} prompt={p} />
        ))}
      </section>
    </div>
  );
}
