import { useEffect, useRef } from "react";
import type { TimeFilter, Filters, Region } from "../types";
import { DEFAULT_FILTERS } from "../types";

/**
 * URL search params ↔ app state sync.
 *
 * Params format (only non-default values appear in URL):
 *   ?time=24h            — time filter (default: 30d)
 *   &mag=3,10            — magnitude range (default: 0,10)
 *   &depth=0,100         — depth range (default: 0,700)
 *   &regions=azores      — comma-separated regions (default: all three)
 *   &quake=<id>          — selected earthquake ID
 */

const VALID_TIME_FILTERS: TimeFilter[] = ["1h", "24h", "7d", "30d"];
const VALID_REGIONS: Region[] = ["continent", "madeira", "azores"];
const DEFAULT_TIME_FILTER: TimeFilter = "30d";

export interface UrlState {
  timeFilter: TimeFilter;
  filters: Filters;
  selectedId: string | null;
}

// ── Parse URL → State ──────────────────────────────────────────

function parseTimeFilter(value: string | null): TimeFilter {
  if (value && VALID_TIME_FILTERS.includes(value as TimeFilter)) {
    return value as TimeFilter;
  }
  return DEFAULT_TIME_FILTER;
}

function parseRange(
  value: string | null,
  min: number,
  max: number,
  defaultValue: [number, number]
): [number, number] {
  if (!value) return defaultValue;
  const parts = value.split(",");
  if (parts.length !== 2) return defaultValue;
  const lo = parseFloat(parts[0]);
  const hi = parseFloat(parts[1]);
  if (isNaN(lo) || isNaN(hi)) return defaultValue;
  const clampedLo = Math.max(min, Math.min(max, lo));
  const clampedHi = Math.max(min, Math.min(max, hi));
  if (clampedLo >= clampedHi) return defaultValue;
  return [clampedLo, clampedHi];
}

function parseRegions(value: string | null): Region[] {
  if (!value) return [...DEFAULT_FILTERS.regions];
  const parts = value.split(",").filter((r): r is Region =>
    VALID_REGIONS.includes(r as Region)
  );
  // If nothing valid, return all regions
  return parts.length > 0 ? parts : [...DEFAULT_FILTERS.regions];
}

export function parseUrlState(): UrlState {
  if (typeof window === "undefined") {
    return {
      timeFilter: DEFAULT_TIME_FILTER,
      filters: DEFAULT_FILTERS,
      selectedId: null,
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    timeFilter: parseTimeFilter(params.get("time")),
    filters: {
      magnitudeRange: parseRange(params.get("mag"), 0, 10, DEFAULT_FILTERS.magnitudeRange),
      depthRange: parseRange(params.get("depth"), 0, 700, DEFAULT_FILTERS.depthRange),
      regions: parseRegions(params.get("regions")),
    },
    selectedId: params.get("quake") || null,
  };
}

// ── State → URL ────────────────────────────────────────────────

function rangeEquals(a: [number, number], b: [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function regionsEqual(a: Region[], b: Region[]): boolean {
  if (a.length !== b.length) return false;
  const sorted1 = [...a].sort();
  const sorted2 = [...b].sort();
  return sorted1.every((v, i) => v === sorted2[i]);
}

export function buildSearchString(state: UrlState): string {
  const params = new URLSearchParams();

  if (state.timeFilter !== DEFAULT_TIME_FILTER) {
    params.set("time", state.timeFilter);
  }

  if (!rangeEquals(state.filters.magnitudeRange, DEFAULT_FILTERS.magnitudeRange)) {
    params.set("mag", state.filters.magnitudeRange.join(","));
  }

  if (!rangeEquals(state.filters.depthRange, DEFAULT_FILTERS.depthRange)) {
    params.set("depth", state.filters.depthRange.join(","));
  }

  if (!regionsEqual(state.filters.regions, DEFAULT_FILTERS.regions)) {
    params.set("regions", state.filters.regions.join(","));
  }

  if (state.selectedId) {
    params.set("quake", state.selectedId);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function syncToUrl(state: UrlState): void {
  if (typeof window === "undefined") return;
  const search = buildSearchString(state);
  const newUrl = window.location.pathname + search;
  // Only update if URL actually changed
  if (window.location.pathname + window.location.search !== newUrl) {
    history.replaceState(null, "", newUrl);
  }
}

// ── Hook ───────────────────────────────────────────────────────

/**
 * Syncs the given state to URL search params using replaceState.
 * Call this from App.tsx, passing the current state on every render.
 * Uses a ref to skip the initial sync (URL → state direction is handled
 * by parseUrlState on mount).
 */
export function useSyncSearchParams(state: UrlState): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render — the URL already has the correct params
    // (or none, meaning defaults). We don't want to overwrite a
    // shared URL on mount before the data loads and selectedId resolves.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    syncToUrl(state);
  }, [state.timeFilter, state.filters, state.selectedId]);
}
