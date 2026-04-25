import { ArrowLink } from "@/components/shared/arrow-link";

export function CtaRow() {
  return (
    <div className="flex flex-wrap gap-3">
      <ArrowLink href="/benchmarks" variant="primary">Open the tape</ArrowLink>
      <ArrowLink href="/test-yourself" variant="secondary">Run the prompts</ArrowLink>
    </div>
  );
}
