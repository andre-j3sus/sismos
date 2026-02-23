import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import type { Earthquake } from "../types";
import type { Theme } from "../hooks/useTheme";
import type { Translations } from "../i18n";
import { getMagnitudeHex, getMarkerRadius, formatDateTime } from "../utils";
import { MagnitudeBadge } from "./MagnitudeBadge";

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  theme: Theme;
  t: Translations;
}

// Default view centered on Portugal
const PORTUGAL_CENTER: [number, number] = [39.5, -8.0];
const DEFAULT_ZOOM = 6;

const TILE_URLS = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

const TILE_ATTRIBUTIONS = {
  light:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

/** Component that flies to a selected earthquake */
function FlyToSelected({
  earthquake,
}: {
  earthquake: Earthquake | undefined;
}) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (earthquake && earthquake.id !== prevId.current) {
      prevId.current = earthquake.id;
      map.flyTo([earthquake.lat, earthquake.lon], 8, { duration: 0.8 });
    }
  }, [earthquake, map]);

  return null;
}

export function EarthquakeMap({
  earthquakes,
  selectedId,
  onSelect,
  theme,
  t,
}: EarthquakeMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const selected = earthquakes.find((eq) => eq.id === selectedId);

  return (
    <MapContainer
      center={PORTUGAL_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      ref={mapRef}
      zoomControl
      preferCanvas
    >
      {/* Key on theme forces TileLayer remount when theme changes */}
      <TileLayer
        key={theme}
        attribution={TILE_ATTRIBUTIONS[theme]}
        url={TILE_URLS[theme]}
      />

      <FlyToSelected earthquake={selected} />

      {earthquakes.map((eq) => (
        <CircleMarker
          key={eq.id}
          center={[eq.lat, eq.lon]}
          radius={getMarkerRadius(eq.magnitude)}
          pathOptions={{
            color: getMagnitudeHex(eq.magnitude),
            fillColor: getMagnitudeHex(eq.magnitude),
            fillOpacity: selectedId === eq.id ? 0.9 : 0.5,
            weight: selectedId === eq.id ? 3 : 1.5,
          }}
          eventHandlers={{
            click: () => onSelect(eq.id),
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <div className="mb-2">
                <MagnitudeBadge magnitude={eq.magnitude} />
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {eq.region}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {eq.depth != null
                    ? `${t.depthLabel}: ${eq.depth} km`
                    : t.depthNA}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatDateTime(eq.time, t.dateLocale)}
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
