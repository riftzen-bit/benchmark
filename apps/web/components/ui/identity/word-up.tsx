export function WordUp({ text }: { text: string }) {
  const words = text.split(" ").filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="word-up inline-block"
          style={{ animationDelay: `${i * 80}ms`, marginRight: "0.25em" }}
        >
          {w}
        </span>
      ))}
    </>
  );
}
