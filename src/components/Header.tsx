import type { TimeFilter, Filters } from "../types";
import { DEFAULT_FILTERS } from "../types";
import type { Theme } from "../hooks/useTheme";
import type { Locale, Translations } from "../i18n";

interface HeaderProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  theme: Theme;
  onToggleTheme: () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  t: Translations;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  filters: Filters;
}

function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.magnitudeRange[0] !== DEFAULT_FILTERS.magnitudeRange[0] ||
    filters.magnitudeRange[1] !== DEFAULT_FILTERS.magnitudeRange[1] ||
    filters.depthRange[0] !== DEFAULT_FILTERS.depthRange[0] ||
    filters.depthRange[1] !== DEFAULT_FILTERS.depthRange[1] ||
    filters.regions.length !== DEFAULT_FILTERS.regions.length
  );
}

export function Header({
  timeFilter,
  onTimeFilterChange,
  theme,
  onToggleTheme,
  locale,
  onLocaleChange,
  t,
  filtersOpen,
  onToggleFilters,
  filters,
}: HeaderProps) {
  const timeFilters: { value: TimeFilter; label: string; short: string }[] = [
    { value: "1h", label: t.timeFilter1h, short: "1h" },
    { value: "24h", label: t.timeFilter24h, short: "24h" },
    { value: "7d", label: t.timeFilter7d, short: "7d" },
    { value: "30d", label: t.timeFilter30d, short: "30d" },
  ];

  const active = hasActiveFilters(filters);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      {/*
        Single flex-wrap container.
        - Desktop (sm+): everything fits in one row.
        - Mobile: branding + right controls on row 1, time pills wrap to row 2.
      */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-3">
        {/* Left: Branding + count — always first */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-7 h-7 text-red-500"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="45" opacity="0.2" />
              <circle cx="50" cy="50" r="30" opacity="0.3" />
              <circle cx="50" cy="50" r="15" opacity="0.6" />
              <circle cx="50" cy="50" r="5" opacity="1" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Sismos
              <span className="text-red-500">.net</span>
            </h1>
          </div>
        </div>

        {/* Right controls: time pills + filter + locale + theme — push to end */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Time filter pills — hidden on mobile, shown inline on sm+ */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {timeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => onTimeFilterChange(f.value)}
                aria-pressed={timeFilter === f.value}
                className={`px-3 py-2 text-sm rounded-md transition-all duration-200 cursor-pointer active:scale-95 ${
                  timeFilter === f.value
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filters toggle */}
          <button
            onClick={onToggleFilters}
            className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${
              filtersOpen
                ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            aria-label={t.toggleFilters}
            title={t.filters}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {active && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Language toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => onLocaleChange("pt")}
              aria-pressed={locale === "pt"}
              className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
                locale === "pt"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              PT
            </button>
            <button
              onClick={() => onLocaleChange("en")}
              aria-pressed={locale === "en"}
              className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
                locale === "en"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label={theme === "dark" ? t.switchToLight : t.switchToDark}
            title={theme === "dark" ? t.switchToLight : t.switchToDark}
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>

        {/* Time filter pills — mobile only, full-width second row */}
        <div className="flex sm:hidden items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 w-full">
          {timeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => onTimeFilterChange(f.value)}
              aria-pressed={timeFilter === f.value}
              className={`flex-1 px-2 py-2 text-sm rounded-md transition-all duration-200 cursor-pointer active:scale-95 ${
                timeFilter === f.value
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {f.short}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
