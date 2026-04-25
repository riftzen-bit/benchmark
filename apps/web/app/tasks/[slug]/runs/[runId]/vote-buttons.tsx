"use client";
import { useTransition } from "react";
import { voteAction } from "./actions";

export function VoteButtons({
  runId,
  slug,
  tally,
  ownVote,
  signedIn,
}: {
  runId: string;
  slug: string;
  tally: { up: number; down: number; score: number };
  ownVote: -1 | 0 | 1;
  signedIn: boolean;
}) {
  const [pending, start] = useTransition();
  const cast = (value: -1 | 0 | 1) => {
    if (!signedIn) return;
    start(async () => {
      await voteAction(runId, slug, value);
    });
  };
  return (
    <div className="mono inline-flex items-center gap-1 border border-[var(--rule)] text-xs">
      <button
        type="button"
        disabled={pending || !signedIn}
        onClick={() => cast(ownVote === 1 ? 0 : 1)}
        aria-pressed={ownVote === 1}
        title={signedIn ? "Upvote" : "Sign in to vote"}
        className={`px-2 py-1 ${ownVote === 1 ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
      >
        ▲ {tally.up}
      </button>
      <span className="border-x border-[var(--rule)] px-2 py-1 tabular-nums">{tally.score}</span>
      <button
        type="button"
        disabled={pending || !signedIn}
        onClick={() => cast(ownVote === -1 ? 0 : -1)}
        aria-pressed={ownVote === -1}
        title={signedIn ? "Downvote" : "Sign in to vote"}
        className={`px-2 py-1 ${ownVote === -1 ? "bg-[var(--ink)] text-[var(--paper)]" : ""}`}
      >
        ▼ {tally.down}
      </button>
    </div>
  );
}
