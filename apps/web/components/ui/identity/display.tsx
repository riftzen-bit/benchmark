import { WordUp } from "./word-up";

type Level = "xl" | "lg" | "md";
type Heading = "h1" | "h2" | "h3";

export function Display({
  level,
  as: Tag = "h1",
  footnoteMark,
  children,
}: {
  level: Level;
  as?: Heading;
  footnoteMark?: "*" | "†";
  // string required: WordUp splits on spaces.
  children: string;
}) {
  return (
    <Tag className={`display-${level}`}>
      <span className="inline-block">
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
    </Tag>
  );
}
