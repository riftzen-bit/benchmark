import { BenchmarkTable } from "@/components/benchmark/benchmark-table";
import { BENCHMARKS } from "@/lib/data/benchmarks";

export const metadata = {
  title: "Benchmarks — Opus 4.7 vs GPT-5.5",
};

export default function BenchmarksPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="mb-12 max-w-[60ch]">
        <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
          Bảng đối chiếu
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">Toàn bộ benchmark</h1>
        <p className="mt-4 text-[var(--mute)]">
          Mỗi ô số đều có siêu liên kết về nguồn. Lọc theo nhóm hoặc sắp xếp theo cột.
          Ô <span className="mono">n/a</span> nghĩa là nhà cung cấp chưa công bố hoặc không
          tìm được số đáng tin cậy.
        </p>
      </header>
      <BenchmarkTable data={BENCHMARKS} />
    </div>
  );
}
