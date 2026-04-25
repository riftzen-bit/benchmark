// Fails CI if SUPABASE_SERVICE_ROLE_KEY is referenced outside the server-only allowlist.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ALLOW = [
  "lib/supabase/admin.ts",
  "app/api/health/route.ts",
  "scripts/",
  ".env.local.example",
  "docs/",
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".git")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    // Only scan executable code. Markdown / env templates are allowed to mention the var name.
    else if (/\.(ts|tsx|js|mjs)$/.test(entry)) yield full;
  }
}

let bad = 0;
for (const f of walk(ROOT)) {
  const rel = relative(ROOT, f).replaceAll("\\", "/");
  if (ALLOW.some((a) => rel.startsWith(a))) continue;
  const src = readFileSync(f, "utf8");
  if (src.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    console.error("Forbidden service-role reference in:", rel);
    bad++;
  }
}
if (bad) {
  console.error(`guardrail FAIL — ${bad} forbidden reference(s)`);
  process.exit(1);
}
console.log("guardrail OK");
