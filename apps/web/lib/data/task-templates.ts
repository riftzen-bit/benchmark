export interface TaskTemplate {
  slug: string;
  title: string;
  category: string;
  body: string;
  rubric: string;
}

export const TASK_TEMPLATES: ReadonlyArray<TaskTemplate> = Object.freeze([
  {
    slug: "long-context-needle",
    title: "Long-context needle in haystack",
    category: "long-context",
    body:
      "You are given the following 80k-token document. Answer one factual question " +
      "that depends on a single sentence buried in the middle. Cite the page number.\n\n" +
      "[paste your document here]\n\n" +
      "Question: [your needle question]",
    rubric:
      "- Correct fact recovered (yes/no).\n" +
      "- Page citation accurate.\n" +
      "- No hallucinated quote.",
  },
  {
    slug: "code-review-rubric",
    title: "PR review on a real diff",
    category: "code",
    body:
      "Review the following diff. List bugs, security issues, and suggested " +
      "improvements. Quote line numbers.\n\n" +
      "[paste diff here]",
    rubric:
      "- All real bugs flagged.\n" +
      "- No false positives that block valid code.\n" +
      "- Severity tagging present.",
  },
  {
    slug: "math-multistep",
    title: "Multi-step math word problem",
    category: "math",
    body:
      "Solve step by step. Show working. Final numeric answer on the last line.\n\n" +
      "[paste problem]",
    rubric:
      "- Final answer matches key.\n" +
      "- All intermediate steps justified.\n" +
      "- No arithmetic slips.",
  },
]);
