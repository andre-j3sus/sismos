import type { Translations } from "./i18n";

/** Format a Date to locale string */
export function formatDate(date: Date, dateLocale: string): string {
  return date.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format time portion */
export function formatTime(date: Date, dateLocale: string): string {
  return date.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format date and time together */
export function formatDateTime(date: Date, dateLocale: string): string {
  return `${formatDate(date, dateLocale)}, ${formatTime(date, dateLocale)}`;
}

/** Get a relative time string using translations */
export function timeAgo(date: Date, t: Translations): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return t.minutesAgo(diffMins);
  if (diffHours < 24) return t.hoursAgo(diffHours);
  if (diffDays === 1) return t.yesterday;
  return t.daysAgo(diffDays);
}

/**
 * Get magnitude color classes (light + dark mode).
 */
export function getMagnitudeColor(magnitude: number): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  if (magnitude >= 5.0) {
    return {
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-800 dark:text-red-300",
      border: "border-red-300 dark:border-red-700",
      dot: "bg-red-500",
    };
  }
  if (magnitude >= 4.0) {
    return {
      bg: "bg-orange-100 dark:bg-orange-900/40",
      text: "text-orange-800 dark:text-orange-300",
      border: "border-orange-300 dark:border-orange-700",
      dot: "bg-orange-500",
    };
  }
  if (magnitude >= 3.0) {
    return {
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-300 dark:border-amber-700",
      dot: "bg-amber-500",
    };
  }
  if (magnitude >= 2.0) {
    return {
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-300",
      border: "border-yellow-300 dark:border-yellow-700",
      dot: "bg-yellow-500",
    };
  }
  return {
    bg: "bg-green-50 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
    dot: "bg-green-500",
  };
}

/** Get the Leaflet marker color hex for a magnitude */
export function getMagnitudeHex(magnitude: number): string {
  if (magnitude >= 5.0) return "#ef4444";
  if (magnitude >= 4.0) return "#f97316";
  if (magnitude >= 3.0) return "#f59e0b";
  if (magnitude >= 2.0) return "#eab308";
  return "#22c55e";
}

/** Get marker radius based on magnitude */
export function getMarkerRadius(magnitude: number): number {
  return Math.max(4, magnitude * 3.5);
}
