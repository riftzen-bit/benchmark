import { PLAYGROUNDS } from "@/lib/data/playgrounds";
import { PlaygroundCard } from "./playground-card";

export function PlaygroundGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {PLAYGROUNDS.map((p) => (
        <PlaygroundCard key={p.id} p={p} />
      ))}
    </div>
  );
}
