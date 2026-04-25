"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; user can select manually */
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-colors hover:bg-transparent hover:text-[var(--foreground)]"
      aria-label={copied ? "Copied to clipboard" : label}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
  );
}
