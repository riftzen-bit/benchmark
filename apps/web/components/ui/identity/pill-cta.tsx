import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type Common = { children: ReactNode; glyph?: ReactNode };

type AnchorProps = Common & { href: string; onClick?: never };
type ButtonProps = Common & { onClick: MouseEventHandler<HTMLButtonElement>; href?: never };

export function PillCta(props: AnchorProps | ButtonProps) {
  const inner = (
    <>
      <span>{props.children}</span>
      <span aria-hidden="true" className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--paper)] text-[var(--cream)] transition-transform group-hover:scale-[1.08]">
        {props.glyph ?? "→"}
      </span>
    </>
  );
  const cls =
    "group inline-flex items-center gap-2 self-start rounded-full bg-[var(--cream)] py-1.5 pl-5 pr-1.5 text-[14px] font-semibold text-[var(--paper)] transition-[gap] hover:gap-3.5";

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={(props as ButtonProps).onClick} className={cls}>
      {inner}
    </button>
  );
}
