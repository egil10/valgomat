import clsx from "clsx";

export function GlassCard({
  children,
  className,
  strong,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div
      className={clsx(
        strong ? "glass-strong" : "glass",
        "rounded-4xl p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
