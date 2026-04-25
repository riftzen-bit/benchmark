export type Winner = "opus" | "gpt" | "tie" | "na";

const TIE_THRESHOLD = 0.5;

export function winnerOf(args: {
  opus: number | null;
  gpt: number | null;
  higherIsBetter: boolean;
}): Winner {
  const { opus, gpt, higherIsBetter } = args;
  if (opus === null || gpt === null) return "na";
  if (Math.abs(opus - gpt) <= TIE_THRESHOLD) return "tie";
  const opusBetter = higherIsBetter ? opus > gpt : opus < gpt;
  return opusBetter ? "opus" : "gpt";
}

export function deltaOf(opus: number | null, gpt: number | null): number | null {
  if (opus === null || gpt === null) return null;
  return opus - gpt;
}
