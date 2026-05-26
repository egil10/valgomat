import clsx from "clsx";
import Image from "next/image";
import type { Party } from "@/lib/types";

/**
 * Renders the party logo as a circular badge. Logos vary in shape and aspect
 * ratio — we put each one inside a circular masked container with a soft
 * brand-colored ring so they sit on the same visual grid.
 */
export function PartyLogo({
  party,
  size = 40,
  ring = true,
  className,
}: {
  party: Party;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white",
        ring && "ring-2",
        className
      )}
      style={{
        width: size,
        height: size,
        // Tailwind can't drive arbitrary ring colors at runtime, so we use boxShadow.
        boxShadow: ring ? `0 0 0 2px ${party.color}33, 0 1px 2px rgba(0,0,0,0.06)` : undefined,
      }}
      aria-label={party.name}
    >
      <Image
        src={party.logo}
        alt={`${party.name} logo`}
        width={size}
        height={size}
        className="h-[78%] w-[78%] object-contain"
        unoptimized
      />
    </span>
  );
}
