import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  Earthquake,
  IPMASeismicResponse,
  IPMAEarthquake,
  TimeFilter,
  Filters,
  Region,
} from "../types";
import { DEFAULT_FILTERS } from "../types";

/**
 * Detect if an earthquake from IPMA area 7 (Continente + Madeira)
 * is actually in the Madeira archipelago based on coordinates.
 *
 * Madeira (including Porto Santo): roughly lat 32.0–33.5, lon -17.5 to -15.5
 */
function detectRegion(lat: number, lon: number, ipmaArea: number): Region {
  if (ipmaArea === 3) return "azores";
  // Check if within Madeira bounding box
  if (lat >= 30.0 && lat < 36.0 && lon >= -20.0 && lon <= -14.0) {
    return "madeira";
  }
  return "continent";
}

function parseEarthquake(
  raw: IPMAEarthquake,
  ipmaArea: number
): Earthquake {
  const lat = parseFloat(raw.lat);
  const lon = parseFloat(raw.lon);
  const area = detectRegion(lat, lon, ipmaArea);

  return {
    id: `${area}-${raw.time}-${raw.lat}-${raw.lon}`,
    time: new Date(raw.time),
    lat,
    lon,
    magnitude: parseFloat(raw.magnitud),
    magType: raw.magType,
    depth: raw.depth,
    region: raw.obsRegion || raw.local || "—",
    local: raw.local,
    degree: raw.degree,
    source: raw.source,
    area,
  };
}

function getCutoffDate(filter: TimeFilter): Date {
  const now = new Date();
  switch (filter) {
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

interface UseEarthquakesReturn {
  earthquakes: Earthquake[];
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  refetch: () => void;
}

export function useEarthquakes(
  initialTimeFilter: TimeFilter = "30d",
  initialFilters: Filters = DEFAULT_FILTERS
): UseEarthquakesReturn {
  const [allEarthquakes, setAllEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialTimeFilter);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/earthquakes");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        continent: IPMASeismicResponse;
        azores: IPMASeismicResponse;
        lastUpdate: string;
      };

      const continentQuakes = (data.continent?.data || []).map(
        (q: IPMAEarthquake) => parseEarthquake(q, 7)
      );
      const azoresQuakes = (data.azores?.data || []).map(
        (q: IPMAEarthquake) => parseEarthquake(q, 3)
      );

      const all = [...continentQuakes, ...azoresQuakes].sort(
        (a, b) => b.time.getTime() - a.time.getTime()
      );

      setAllEarthquakes(all);
      setLastUpdate(data.lastUpdate);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load seismic data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const earthquakes = useMemo(() => {
    const cutoff = getCutoffDate(timeFilter);
    const [minMag, maxMag] = filters.magnitudeRange;
    const [minDepth, maxDepth] = filters.depthRange;

    return allEarthquakes.filter((eq) => {
      // Time filter
      if (eq.time < cutoff) return false;

      // Magnitude filter
      if (eq.magnitude < minMag || eq.magnitude > maxMag) return false;

      // Depth filter (null depth passes through — we don't want to hide unknowns)
      if (eq.depth != null && (eq.depth < minDepth || eq.depth > maxDepth)) {
        return false;
      }

      // Region filter
      if (!filters.regions.includes(eq.area)) return false;

      return true;
    });
  }, [allEarthquakes, timeFilter, filters]);

  return {
    earthquakes,
    loading,
    error,
    lastUpdate,
    timeFilter,
    setTimeFilter,
    filters,
    setFilters,
    refetch: fetchData,
  };
}
