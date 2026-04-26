import { WordUp } from "./word-up";

type Level = "xl" | "lg" | "md";

export function Display({
  level,
  footnoteMark,
  children,
}: {
  level: Level;
  footnoteMark?: "*" | "†";
  children: string;
}) {
  return (
    <span className={`display-${level}`}>
      <WordUp text={children} />
      {footnoteMark && (
        <sup
          className="word-up inline-block align-super text-[0.18em]"
          style={{ animationDelay: `${children.split(" ").length * 80 + 80}ms`, marginLeft: "0.04em" }}
        >
          {footnoteMark}
        </sup>
      )}
    </span>
  );
}
