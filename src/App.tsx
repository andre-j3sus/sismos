import { useState, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FilterPanel } from "./components/FilterPanel";
import { EarthquakeMap } from "./components/EarthquakeMap";
import { EarthquakeList } from "./components/EarthquakeList";
import { useEarthquakes } from "./hooks/useEarthquakes";
import { useTheme } from "./hooks/useTheme";
import { useLocale } from "./i18n";
import { parseUrlState, useSyncSearchParams } from "./hooks/useSearchParams";

export default function App() {
  // Parse URL search params once on mount for initial state
  const initialUrlState = useMemo(() => parseUrlState(), []);

  const {
    earthquakes,
    loading,
    error,
    lastUpdate,
    timeFilter,
    setTimeFilter,
    filters,
    setFilters,
  } = useEarthquakes(initialUrlState.timeFilter, initialUrlState.filters);

  const { theme, toggle: toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(initialUrlState.selectedId);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listOpen, setListOpen] = useState(() => window.innerWidth >= 1024);

  // On mobile, collapse the list when selecting an earthquake so the map is visible
  const handleListSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id !== null && window.innerWidth < 1024) {
      setListOpen(false);
    }
  }, []);

  // Sync current state → URL search params (replaceState, no history pollution)
  useSyncSearchParams({ timeFilter, filters, selectedId });

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Accent bar — visual identity stripe */}
      <div className="h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 shrink-0" />

      <Header
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        theme={theme}
        onToggleTheme={toggleTheme}
        locale={locale}
        onLocaleChange={setLocale}
        t={t}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((prev) => !prev)}
        filters={filters}
      />

      {/* Collapsible filter panel — always rendered, animated open/close */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <FilterPanel filters={filters} onFiltersChange={setFilters} t={t} />
        </div>
      </div>

      {/* Main content: map full-size, list overlays on top */}
      <main className="flex-1 relative overflow-hidden min-h-0">
        {/* Map — always fills the entire main area */}
        <div className="absolute inset-0">
          <EarthquakeMap
            earthquakes={earthquakes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            theme={theme}
            t={t}
          />
        </div>

        {/* List panel — overlays on right (desktop) / bottom (mobile) */}
        {/* Uses translate for GPU-accelerated animation, map never resizes */}
        {/* z-[1000] ensures it renders above Leaflet's internal layers */}
        <div
          className={`absolute z-[1000] bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out
            bottom-0 left-0 right-0 h-[50vh]
            lg:top-0 lg:right-0 lg:left-auto lg:h-full lg:w-[380px]
            ${listOpen
              ? "translate-y-0 lg:translate-y-0 lg:translate-x-0"
              : "translate-y-full lg:translate-y-0 lg:translate-x-full"
            }`}
        >
          <EarthquakeList
            earthquakes={earthquakes}
            selectedId={selectedId}
            onSelect={handleListSelect}
            loading={loading}
            error={error}
            t={t}
            earthquakeCount={earthquakes.length}
            onToggleList={() => setListOpen(false)}
          />
        </div>

        {/* Floating re-open button — visible only when list is collapsed */}
        {/* inset-0 + pointer-events-none so the wrapper doesn't block map interaction */}
        <div
          className={`absolute inset-0 z-[1000] pointer-events-none transition-opacity duration-300 ${
            listOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Desktop: top-right corner */}
          <button
            onClick={() => setListOpen(true)}
            aria-label={t.showList}
            className={`${listOpen ? "pointer-events-none" : "pointer-events-auto"} hidden lg:flex items-center gap-2 absolute right-3 top-3
              bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
              shadow-lg rounded-lg px-3 py-2.5
              text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
              transition-all duration-200 cursor-pointer active:scale-95`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm font-medium tabular-nums">
              {t.earthquakeCount(earthquakes.length)}
            </span>
          </button>

          {/* Mobile: bottom edge, centered */}
          <button
            onClick={() => setListOpen(true)}
            aria-label={t.showList}
            className={`${listOpen ? "pointer-events-none" : "pointer-events-auto"} flex lg:hidden items-center gap-2 absolute bottom-3 left-1/2 -translate-x-1/2
              bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
              shadow-lg rounded-lg px-3 py-2.5
              text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
              transition-all duration-200 cursor-pointer active:scale-95`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            <span className="text-sm font-medium tabular-nums">
              {t.earthquakeCount(earthquakes.length)}
            </span>
          </button>
        </div>
      </main>

      <Footer lastUpdate={lastUpdate} t={t} />
    </div>
  );
}
