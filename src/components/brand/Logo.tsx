import { Link } from "@tanstack/react-router";

import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string | undefined }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
      fill="none"
    >
      {/* isometric cube built from three faces — a 3D asset in one mark */}
      <path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9L12 2.5Z" className="stroke-current" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 7.5 12 12.5l9-5" className="stroke-current" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 12.5v9" className="stroke-current" strokeWidth="1.5" />
      <path d="M12 7.2 16.6 9.8 12 12.4 7.4 9.8 12 7.2Z" className="fill-primary" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string | undefined;
  showWordmark?: boolean | undefined;
}) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-center gap-2 rounded-md text-foreground",
        className,
      )}
      aria-label={`${BRAND.name} home`}
    >
      <LogoMark className="h-6 w-6 text-foreground/80 transition-colors group-hover:text-foreground" />
      {showWordmark ? (
        <span className="text-[15px] font-semibold tracking-tight">
          {BRAND.name}
        </span>
      ) : null}
    </Link>
  );
}
