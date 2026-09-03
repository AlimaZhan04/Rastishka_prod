import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhoneLink({ phone, className }: { phone: string; className?: string }) {
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <a
      href={`tel:${tel}`}
      className={cn(
        "text-foreground hover:text-primary inline-flex min-h-11 items-center gap-2 font-medium transition-colors",
        className,
      )}
    >
      <Phone className="text-primary size-4" aria-hidden="true" />
      <span>{phone}</span>
    </a>
  );
}
