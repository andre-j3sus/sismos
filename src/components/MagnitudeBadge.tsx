import { getMagnitudeColor } from "../utils";

interface MagnitudeBadgeProps {
  magnitude: number;
  magType?: string;
  size?: "sm" | "md";
}

export function MagnitudeBadge({
  magnitude,
  magType,
  size = "md",
}: MagnitudeBadgeProps) {
  const colors = getMagnitudeColor(magnitude);
  const sizeClasses =
    size === "sm"
      ? "text-xs px-1.5 py-0.5 min-w-[2.5rem]"
      : "text-sm px-2 py-1 min-w-[3rem]";

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
      title={magType ? `Magnitude ${magType}` : undefined}
    >
      {magnitude.toFixed(1)}
    </span>
  );
}
