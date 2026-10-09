import { type ReactNode } from "react";

/** Elevated surface so cards don’t look like flat HTML on the page background */
export default function SurfaceCard({
  children,
  className = "",
  padding = "md",
}: {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}) {
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "p-4"
        : padding === "lg"
          ? "p-6 sm:p-8"
          : "p-5 sm:p-6";

  return (
    <div
      className={`surface-card relative rounded-2xl border border-white/12 overflow-hidden ${pad} ${className}`}
    >
      {children}
    </div>
  );
}
