import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export function VoteGlyph({ direction = "up", ...rest }: GlyphProps & { direction?: "up" | "down" }) {
  return (
    <Svg {...rest}>
      <g transform={direction === "down" ? "translate(0,16) scale(1,-1)" : undefined}>
        <path d="M3 10 L8 4 L13 10" />
        <path d="M8 4 L8 13" />
      </g>
    </Svg>
  );
}

export function FlagGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M3 2 L3 14" />
      <path d="M3 2 L13 2 L11 5 L13 8 L3 8" />
    </Svg>
  );
}

export function ShareGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <circle cx="4" cy="8" r="2" />
      <circle cx="12" cy="3" r="2" />
      <circle cx="12" cy="13" r="2" />
      <path d="M5.7 7 L10.3 4" />
      <path d="M5.7 9 L10.3 12" />
    </Svg>
  );
}

export function CopyGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="9" height="10" />
      <path d="M5 4 V2 H14 V12 H11" />
    </Svg>
  );
}

export function SortGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M5 3 L5 13 M2 6 L5 3 L8 6" />
      <path d="M11 13 L11 3 M14 10 L11 13 L8 10" />
    </Svg>
  );
}

export function FilterGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M2 3 L14 3 L10 8 L10 13 L6 11 L6 8 Z" />
    </Svg>
  );
}

export function SearchGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4" />
      <path d="M10.2 10.2 L14 14" />
    </Svg>
  );
}

export function ExternalLinkGlyph(props: GlyphProps) {
  return (
    <Svg {...props}>
      <path d="M3 3 L9 3 L9 9" />
      <path d="M9 3 L3 9" />
      <path d="M3 13 L13 13 L13 6" />
    </Svg>
  );
}
