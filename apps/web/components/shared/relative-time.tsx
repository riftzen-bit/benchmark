"use client";
import { useEffect, useState } from "react";

interface Props {
  iso: string;
  className?: string;
}

export function RelativeTime({ iso, className }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return <span className={className}>—</span>;
  const diff = Math.max(0, Math.floor((now - t) / 1000));
  return (
    <time dateTime={iso} className={className}>
      {format(diff)}
    </time>
  );
}

function format(sec: number): string {
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} d ago`;
}
