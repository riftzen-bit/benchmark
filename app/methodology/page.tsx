import { SOURCES } from "@/lib/data/sources";
import { SITE_META } from "@/lib/data/meta";

export const metadata = {
  title: "Phương pháp — Opus 4.7 vs GPT-5.5",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-16 leading-relaxed">
      <p className="mono text-xs uppercase tracking-widest text-[var(--mute)]">
        Phương pháp
      </p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">
        Số liệu lấy từ đâu, và những điều cần lưu ý
      </h1>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Nguồn</h2>
        <p className="mt-3 text-[var(--mute)]">
          Mỗi ô trên bảng <em>Benchmarks</em> dẫn link tới nguồn gốc bằng siêu
          liên kết superscript. Trang chỉ tổng hợp, không tự đo.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]"
              >
                {s.label}
              </a>
              <span className="ml-2 mono text-xs text-[var(--mute)]">
                {s.publisher} · {s.capturedAt}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Cảnh báo</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-[var(--mute)]">
          <li>
            Một số benchmark chỉ được một bên công bố. Trang đánh dấu{" "}
            <span className="mono">n/a</span> thay vì suy đoán.
          </li>
          <li>
            Số có dấu <em>~</em> là ước lượng từ phân tích bên thứ ba khi nhà
            cung cấp chưa công bố trực tiếp.
          </li>
          <li>
            Cùng một benchmark có thể khác nhau khi đổi prompt, harness, hoặc
            effort level. Kết quả trên bảng tương ứng cấu hình mặc định mà nhà
            cung cấp dùng.
          </li>
          <li>
            Tab <em>Tự thử</em> chỉ là phép thử mang tính giai thoại; không
            phải đánh giá thống kê.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-medium">Cập nhật</h2>
        <p className="mt-3 text-[var(--mute)]">
          Lần cuối: <span className="mono">{SITE_META.lastUpdated}</span>. Khi
          một trong hai nhà cung cấp ra model mới hoặc cập nhật model card,
          dataset trong <span className="mono">lib/data/benchmarks.ts</span> sẽ
          được sửa và mốc thời gian trên footer được nâng.
        </p>
      </section>
    </div>
  );
}
