/** Raw earthquake data from the IPMA API */
export interface IPMAEarthquake {
  time: string;
  lat: string;
  lon: string;
  magnitud: string;
  magType: string;
  depth: number | null;
  obsRegion: string;
  local: string | null;
  degree: string | null;
  dataUpdate: string;
  shakemapid: string;
  source: string;
}

/** IPMA API response shape */
export interface IPMASeismicResponse {
  owner: string;
  country: string;
  idArea: number;
  data: IPMAEarthquake[];
}

/** Region classification */
export type Region = "continent" | "madeira" | "azores";

/** Parsed/normalized earthquake for the frontend */
export interface Earthquake {
  id: string;
  time: Date;
  lat: number;
  lon: number;
  magnitude: number;
  magType: string;
  depth: number | null;
  region: string;
  local: string | null;
  degree: string | null;
  source: string;
  area: Region;
}

/** Time range filter options */
export type TimeFilter = "1h" | "24h" | "7d" | "30d";

/** Advanced filters */
export interface Filters {
  magnitudeRange: [number, number];
  depthRange: [number, number];
  regions: Region[];
}

export const DEFAULT_FILTERS: Filters = {
  magnitudeRange: [0, 10],
  depthRange: [0, 700],
  regions: ["continent", "madeira", "azores"],
};
