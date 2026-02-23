import type { Filters, Region } from "../types";
import { DEFAULT_FILTERS } from "../types";
import type { Translations } from "../i18n";
import { RangeSlider } from "./RangeSlider";

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  t: Translations;
}

const REGIONS: {
  value: Region;
  labelKey: "continent" | "madeira" | "azores";
  dotClass: string;
}[] = [
  { value: "continent", labelKey: "continent", dotClass: "bg-gray-400 dark:bg-gray-500" },
  { value: "madeira", labelKey: "madeira", dotClass: "bg-emerald-500" },
  { value: "azores", labelKey: "azores", dotClass: "bg-blue-500" },
];

function filtersAreDefault(filters: Filters): boolean {
  return (
    filters.magnitudeRange[0] === DEFAULT_FILTERS.magnitudeRange[0] &&
    filters.magnitudeRange[1] === DEFAULT_FILTERS.magnitudeRange[1] &&
    filters.depthRange[0] === DEFAULT_FILTERS.depthRange[0] &&
    filters.depthRange[1] === DEFAULT_FILTERS.depthRange[1] &&
    filters.regions.length === DEFAULT_FILTERS.regions.length
  );
}

export function FilterPanel({
  filters,
  onFiltersChange,
  t,
}: FilterPanelProps) {
  const toggleRegion = (region: Region) => {
    const current = filters.regions;
    const newRegions = current.includes(region)
      ? current.filter((r) => r !== region)
      : [...current, region];
    // Don't allow deselecting all regions
    if (newRegions.length === 0) return;
    onFiltersChange({ ...filters, regions: newRegions });
  };

  return (
    <div className="bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Magnitude */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[100px]">
            {t.magnitude}
          </label>
          <div className="flex-1">
            <RangeSlider
              min={0}
              max={10}
              step={0.1}
              value={filters.magnitudeRange}
              onChange={(magnitudeRange) =>
                onFiltersChange({ ...filters, magnitudeRange })
              }
              formatLabel={(v) => v.toFixed(1)}
            />
          </div>
        </div>

        {/* Depth */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[100px]">
            {t.depthFilter}
          </label>
          <div className="flex-1">
            <RangeSlider
              min={0}
              max={700}
              step={5}
              value={filters.depthRange}
              onChange={(depthRange) =>
                onFiltersChange({ ...filters, depthRange })
              }
              formatLabel={(v) => `${v} ${t.km}`}
            />
          </div>
        </div>

        {/* Region + Clear */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[100px]">
            {t.region}
          </label>
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {REGIONS.map((r) => {
                const isActive = filters.regions.includes(r.value);
                return (
                  <button
                    key={r.value}
                    onClick={() => toggleRegion(r.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${
                      isActive
                        ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 shadow-sm font-medium"
                        : "bg-transparent border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${r.dotClass} ${
                      isActive ? "opacity-100" : "opacity-40"
                    }`} />
                    {t[r.labelKey]}
                  </button>
                );
              })}
            </div>

            {/* Clear filters */}
            {!filtersAreDefault(filters) && (
              <button
                onClick={() => onFiltersChange(DEFAULT_FILTERS)}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer transition-colors duration-200"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
