import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/brand-motifs";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="РАСтишка — на главную"
      className={cn(
        "group/logo focus-visible:ring-ring/45 inline-flex min-h-11 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-3",
        className,
      )}
    >
      <BrandMark className="text-primary h-11 w-10 transition-transform duration-300 group-hover/logo:scale-[1.04] group-hover/logo:-rotate-2" />
      <span className="font-heading text-primary text-[1.35rem] leading-none font-extrabold tracking-[-0.035em] sm:text-2xl">
        РАС<span className="font-bold tracking-[-0.045em]">тишка</span>
      </span>
    </Link>
  );
}
