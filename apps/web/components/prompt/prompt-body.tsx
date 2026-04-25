interface Props {
  children: string;
}

export function PromptBody({ children }: Props) {
  return (
    <div className="relative">
      <span className="eyebrow absolute left-4 top-3 text-[9px]">Prompt</span>
      <pre className="mono max-h-80 overflow-auto whitespace-pre-wrap break-words border border-[var(--rule)] bg-[var(--foreground)]/[0.025] p-4 pt-8 text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
