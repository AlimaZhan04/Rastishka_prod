import type { ComponentType, SVGProps } from "react";
import { InstagramIcon, FacebookIcon } from "./social-icons";
import { ThreadsIcon } from "./threads-icon";
import { cn } from "@/lib/utils";

type Socials = { instagram?: string; facebook?: string; threads?: string };
type Item = { href: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

export function SocialLinks({ socials, className }: { socials: Socials; className?: string }) {
  const items: Item[] = [];
  if (socials.instagram)
    items.push({ href: socials.instagram, label: "Instagram", Icon: InstagramIcon });
  if (socials.facebook)
    items.push({ href: socials.facebook, label: "Facebook", Icon: FacebookIcon });
  if (socials.threads) items.push({ href: socials.threads, label: "Threads", Icon: ThreadsIcon });

  if (items.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {items.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="bg-secondary text-primary hover:bg-brand-mint-soft hover:text-brand-teal focus-visible:ring-ring/40 grid size-11 place-items-center rounded-full transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:outline-none"
          >
            <Icon className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
