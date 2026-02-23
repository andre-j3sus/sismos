import type { Earthquake } from "../types";
import type { Translations } from "../i18n";
import { MagnitudeBadge } from "./MagnitudeBadge";
import { formatDateTime, timeAgo, getMagnitudeColor } from "../utils";

interface EarthquakeListProps {
  earthquakes: Earthquake[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  t: Translations;
  earthquakeCount: number;
  onToggleList: () => void;
}

function getAreaLabel(area: string, t: Translations): string {
  switch (area) {
    case "azores":
      return t.azores;
    case "madeira":
      return t.madeira;
    default:
      return t.continent;
  }
}

function getAreaClasses(area: string): string {
  switch (area) {
    case "azores":
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "madeira":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

/** Check if earthquake happened in the last 30 minutes */
function isRecent(time: Date): boolean {
  return Date.now() - time.getTime() < 30 * 60 * 1000;
}

export function EarthquakeList({
  earthquakes,
  selectedId,
  onSelect,
  loading,
  error,
  t,
  earthquakeCount,
  onToggleList,
}: EarthquakeListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky list header: count + collapse button */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums" aria-live="polite">
          {t.earthquakeCount(earthquakeCount)}
        </span>
        <button
          onClick={onToggleList}
          className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer active:scale-95"
          aria-label={t.hideList}
          title={t.hideList}
        >
          {/* Desktop: right-pointing chevron (collapse to right) */}
          <svg className="w-4 h-4 hidden lg:block" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          {/* Mobile: down-pointing chevron (collapse down) */}
          <svg className="w-4 h-4 lg:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* List content */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.loading}</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center flex-1 px-4">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-1">{t.error}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      ) : earthquakes.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center px-6">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" opacity="0.15" />
              <circle cx="50" cy="50" r="30" opacity="0.2" />
              <circle cx="50" cy="50" r="15" opacity="0.3" />
              <circle cx="50" cy="50" r="5" opacity="0.4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.noResults}</p>
          </div>
        </div>
      ) : (
        <div className="earthquake-list overflow-y-auto flex-1 scroll-smooth">
          {earthquakes.map((eq) => {
            const isSelected = eq.id === selectedId;
            const colors = getMagnitudeColor(eq.magnitude);
            const recent = isRecent(eq.time);

            return (
              <button
                key={eq.id}
                onClick={() => onSelect(isSelected ? null : eq.id)}
                className={`group w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? `${colors.bg} border-l-4 ${colors.border}`
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-4 border-l-transparent hover:border-l-gray-300 dark:hover:border-l-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="transition-transform duration-150 group-hover:scale-110">
                    <MagnitudeBadge magnitude={eq.magnitude} size="sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {eq.region}
                      </span>
                      {recent && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(eq.time, t.dateLocale)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {timeAgo(eq.time, t)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {eq.depth != null && <span>{t.depth} {eq.depth} km</span>}
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs ${getAreaClasses(eq.area)}`}
                      >
                        {getAreaLabel(eq.area, t)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
