import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <a
      href={`tel:${tel}`}
      className={cn(
        "inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      <Phone className="size-4 text-primary" aria-hidden="true" />
      <span>{phone}</span>
    </a>
  );
}
