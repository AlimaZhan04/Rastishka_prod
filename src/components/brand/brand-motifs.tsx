import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 72"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Росток в горшке с сердцем"
    >
      <path
        d="M31.8 29.2c-.3-9.4 2.4-16.7 8.4-21.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M34.7 18.6C38 8.1 45.5 4.2 54.2 4.4c-.8 9.2-7.4 15.1-19.5 14.2Z"
        className="fill-brand-mint text-primary"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path
        d="M29.2 21.8C17.5 21.4 10.9 15.6 9.5 7c9.5-.6 17.3 3.8 19.7 14.8Z"
        className="fill-brand-sage/65 text-primary"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 30.3h35l-3 32.8a5.3 5.3 0 0 1-5.3 4.8H22.8a5.3 5.3 0 0 1-5.3-4.8l-3-32.8Z"
        className="fill-brand-mint-soft text-primary"
        stroke="currentColor"
        strokeWidth="2.7"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 29.7h39.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 57.2s-9-5.1-9-11.6c0-3.2 2.4-5.6 5.4-5.6 1.8 0 3.1.8 3.6 2.1.6-1.3 1.9-2.1 3.6-2.1 3.1 0 5.4 2.4 5.4 5.6 0 6.5-9 11.6-9 11.6Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleHeart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("pointer-events-none", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M31.5 53.3C25 46.5 10.8 37.6 10.8 24.5c0-7.2 4.8-12 11.1-12 5.2 0 8.4 3.1 9.6 6.3 1.3-3.2 4.5-6.3 9.7-6.3 6.3 0 11.1 4.8 11.1 12 0 13.1-14.3 22-20.8 28.8Z"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LeafSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      className={cn("pointer-events-none", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M25 149c17-46 38-86 76-128"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M42 111C21 105 11 92 9 76c20-1 32 10 33 35Z" fill="currentColor" opacity=".7" />
      <path d="M57 82C40 72 35 56 40 41c18 6 25 20 17 41Z" fill="currentColor" opacity=".82" />
      <path d="M70 65c4-21 16-32 33-34 1 20-10 32-33 34Z" fill="currentColor" opacity=".72" />
      <path d="M33 130C17 126 7 116 4 103c17-2 28 7 29 27Z" fill="currentColor" opacity=".58" />
      <path d="M82 45c2-18 11-29 26-33 3 17-6 29-26 33Z" fill="currentColor" opacity=".9" />
    </svg>
  );
}
