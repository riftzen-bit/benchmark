import { ModelSpec } from "@/components/home/model-spec";

export function ModelSpecGrid() {
  return (
    <div className="grid grid-cols-1 gap-px bg-[var(--rule)] md:grid-cols-2">
      <ModelSpec model="opus" />
      <ModelSpec model="gpt" />
    </div>
  );
}
