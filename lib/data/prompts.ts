import { PromptSchema, type Prompt } from "@/lib/schema/prompt";

const raw: Prompt[] = [
  {
    id: "long-context-needle",
    title: "Needle in a long stack",
    category: "long-context",
    difficulty: "hard",
    body: `Bên dưới là 50 đoạn văn về lịch sử cà phê Việt Nam (mỗi đoạn ~400 từ). Trong đoạn thứ 37, có chính xác một câu chứa số tài khoản giả định "AC-19880412-XQ". Hãy trích nguyên câu đó, kèm số đoạn, và liệt kê 3 manh mối ngữ nghĩa giúp bạn loại trừ các đoạn còn lại.

(Khi paste vào playground, đính kèm 50 đoạn văn dài bất kỳ — yêu cầu trích đúng câu chứa chuỗi đó.)`,
    watchFor: [
      "Trích đúng câu chứa AC-19880412-XQ",
      "Nêu đúng số đoạn 37",
      "Không bịa các câu lân cận",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "multi-file-refactor",
    title: "Refactor đa-file (TypeScript)",
    category: "coding",
    difficulty: "hard",
    body: `Cho 3 file TS ngắn: \`user.ts\`, \`auth.ts\`, \`api.ts\`. Trong \`auth.ts\` có lỗi off-by-one ở kiểm tra hết hạn token (\`<\` thay vì \`<=\`). Yêu cầu:
1. Xác định bug và giải thích.
2. Đề xuất diff tối thiểu (unified diff) sửa đúng chỗ.
3. Liệt kê các call-site bị ảnh hưởng.
4. Viết 1 test Vitest tái hiện bug.

(Paste 3 file mẫu khi test.)`,
    watchFor: [
      "Phát hiện đúng off-by-one",
      "Diff sạch, không refactor thừa",
      "Test thực sự fail trước khi sửa",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "aime-style",
    title: "Toán reasoning (AIME-style)",
    category: "math",
    difficulty: "extreme",
    body: `Cho \\(f(x) = x^3 - 6x^2 + 11x - 6\\). Tìm tổng tất cả số nguyên \\(n\\) trong \\([-100, 100]\\) sao cho \\(f(n) \\mid n^4 + 1\\). Trình bày đầy đủ lập luận, không dùng tool ngoài.`,
    watchFor: [
      "Phân tích nghiệm f(n)",
      "Lập luận chia hết chặt chẽ",
      "Không bỏ sót n âm",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "agent-tool-plan",
    title: "Plan agentic tool-use",
    category: "agent",
    difficulty: "hard",
    body: `Bạn là agent điều phối, có 4 tool: \`search_web(q)\`, \`read_url(u)\`, \`run_python(code)\`, \`write_file(path, content)\`. Nhiệm vụ: tổng hợp giá xăng RON95 trung bình tại 5 thành phố lớn Việt Nam trong tuần qua, xuất ra \`prices.csv\`. Hãy xuất plan dưới dạng JSON có \`steps: [{tool, input, why}]\`. Tối thiểu hoá số tool call.`,
    watchFor: [
      "Plan có thứ tự hợp lý",
      "Không gọi tool dư thừa",
      "Định dạng JSON hợp lệ",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "vision-chart-read",
    title: "Đọc biểu đồ độ phân giải cao",
    category: "vision",
    difficulty: "medium",
    body: `(Đính kèm 1 ảnh PNG biểu đồ cột so sánh 6 model trên 1 benchmark — chú thích nhỏ, lưới mảnh.)
Hãy:
1. Đọc giá trị chính xác cho từng cột (đến 1 chữ số thập phân).
2. Xếp hạng từ cao xuống thấp.
3. Tính chênh lệch giữa cột 1 và cột cuối.

(Yêu cầu cho cả 2 model: chỉ trả lời sau khi đọc ảnh; không đoán.)`,
    watchFor: [
      "Đọc đúng giá trị cột",
      "Không hallucinate model không có",
      "Phép trừ cuối chính xác",
    ],
    playgroundIds: ["claude-ai", "chatgpt", "duckai"],
  },
  {
    id: "multilingual-mix",
    title: "Suy luận đa ngôn ngữ",
    category: "multilingual",
    difficulty: "hard",
    body: `Đoạn dưới đây xen kẽ Việt – Anh – 中文 – 日本語. Yêu cầu:
1. Dịch toàn bộ ra tiếng Anh học thuật.
2. Trích 3 luận điểm chính.
3. Chỉ ra 1 mâu thuẫn nội tại nếu có.

"Thị trường AI 2026 cho thấy 三大玩家 đang định hình. While Anthropic 主张 safety-first, OpenAI 強調 deployment 速度. 一方、Googleは両方を試みているが、結果は混合的。 Tuy nhiên, có chuyên gia cho rằng cả ba đều đang lặp lại sai lầm của social-media era."`,
    watchFor: [
      "Bản dịch chính xác cả 4 ngôn ngữ",
      "Luận điểm rút gọn hợp lý",
      "Phát hiện hoặc khẳng định không có mâu thuẫn rõ",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "adversarial-logic",
    title: "Logic ngược-trực-giác",
    category: "reasoning",
    difficulty: "hard",
    body: `Có 100 hộp đánh số 1..100. Mỗi hộp chứa một số nguyên dương (có thể trùng). Bạn được biết: tổng tất cả các số bằng 5050, và mỗi hộp \\(i\\) chứa số khác \\(i\\). Hỏi: số lượng cấu hình hợp lệ là chẵn hay lẻ? Giải thích.`,
    watchFor: [
      "Lập luận parity rõ ràng",
      "Không nhầm lẫn với hoán vị derangement đơn thuần",
      "Kết luận đúng chẵn/lẻ",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "long-horizon-plan",
    title: "Kế hoạch dài hạn 12 tuần",
    category: "planning",
    difficulty: "medium",
    body: `Lập kế hoạch 12 tuần để một dev mid-level (đã biết React) chuyển sang chuyên về compiler internals. Yêu cầu: tuần x tuần, mỗi tuần có (a) mục tiêu đo được, (b) 2-3 tài nguyên cụ thể có tên thật, (c) một bài tập kết thúc tuần. Không phóng đại, không "self-help" giọng văn.`,
    watchFor: [
      "Tài nguyên có thật, không bịa",
      "Mục tiêu đo được",
      "Lộ trình tăng dần độ khó",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "creative-constraint",
    title: "Sáng tác có ràng buộc",
    category: "creative",
    difficulty: "medium",
    body: `Viết một truyện flash 250 từ về một AI từ chối trả lời. Ràng buộc:
- Mỗi câu phải dài đúng ≤ 12 từ.
- Phải có 3 lần nhắc đến "mưa" mà không nói nó là ẩn dụ cho gì.
- Không dùng từ "consciousness", "soul", "feel".`,
    watchFor: [
      "Đếm đúng câu ≤ 12 từ",
      "Đủ 3 lần 'mưa'",
      "Không vi phạm danh sách cấm",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
  {
    id: "debug-underspec",
    title: "Debug khi spec thiếu",
    category: "debug",
    difficulty: "hard",
    body: `Đoạn Python sau đôi khi trả về list rỗng:

\`\`\`python
def dedupe_keep_order(xs):
    seen = set()
    out = []
    for x in xs:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out
\`\`\`

Người dùng báo: "Khi tôi truyền list các dict, nó không bao giờ dedupe." Hỏi: bug do đâu? Đề xuất 2 cách sửa với trade-off khác nhau, và viết test phân biệt 2 cách đó.`,
    watchFor: [
      "Hiểu dict không hashable / hashable",
      "2 hướng sửa thực sự khác nhau (ví dụ: hash-by-key vs serialize)",
      "Test phân biệt rõ ràng",
    ],
    playgroundIds: ["lmarena", "duckai", "claude-ai", "chatgpt"],
  },
];

export const PROMPTS: ReadonlyArray<Prompt> = Object.freeze(
  raw.map((p) => Object.freeze(PromptSchema.parse(p))),
);
