import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("eyebrow", className)} {...rest} />;
}
