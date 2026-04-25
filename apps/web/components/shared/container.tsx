import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  width?: "narrow" | "default" | "wide";
}

const WIDTHS = {
  narrow: "max-w-[760px]",
  default: "max-w-[1280px]",
  wide: "max-w-[1440px]",
} as const;

export function Container({ width = "default", className, ...rest }: Props) {
  return (
    <div className={cn("mx-auto w-full px-6 md:px-10", WIDTHS[width], className)} {...rest} />
  );
}
