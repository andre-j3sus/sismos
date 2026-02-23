import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  ScaleControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Map as LeafletMap } from "leaflet";
import type { Earthquake } from "../types";
import type { Theme } from "../hooks/useTheme";
import type { Translations } from "../i18n";
import { getMagnitudeHex, getMarkerRadius, formatDateTime, timeAgo } from "../utils";
import { MagnitudeBadge } from "./MagnitudeBadge";

interface EarthquakeMapProps {
  earthquakes: Earthquake[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  theme: Theme;
  t: Translations;
}

// Default view centered on Portugal
const PORTUGAL_CENTER: [number, number] = [38.0, -10.0];
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
      map.flyTo([earthquake.lat, earthquake.lon], 10, { duration: 0.8 });
    }
  }, [earthquake, map]);

  return null;
}

/** Custom Leaflet control to reset the map to the default Portugal view */
function ResetViewControl({ title }: { title: string }) {
  const map = useMap();

  useEffect(() => {
    const control = new L.Control({ position: "topleft" });

    control.onAdd = () => {
      const container = L.DomUtil.create(
        "div",
        "leaflet-control-reset leaflet-bar leaflet-control"
      );
      const button = L.DomUtil.create("a", "", container);
      button.href = "#";
      button.title = title;
      button.setAttribute("role", "button");
      button.setAttribute("aria-label", title);
      // Home icon SVG
      button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M9 21V12h6v9"/></svg>`;

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (e) => {
        L.DomEvent.preventDefault(e);
        map.flyTo(PORTUGAL_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
      });

      return container;
    };

    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map, title]);

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

      <ScaleControl position="bottomleft" imperial={false} />
      <ResetViewControl title={t.resetView} />

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
          <Tooltip direction="top" offset={[0, -6]}>
            <div className="text-xs leading-snug">
              <div className="flex items-center gap-1.5">
                <MagnitudeBadge magnitude={eq.magnitude} size="sm" />
                <span className="font-medium">{eq.region}</span>
              </div>
              <div className="mt-1 text-gray-500">
                {formatDateTime(eq.time, t.dateLocale)}
                <span className="ml-1.5 text-gray-400">
                  {timeAgo(eq.time, t)}
                </span>
              </div>
              {eq.depth != null && (
                <div className="text-gray-500">
                  {t.depth} {eq.depth} km
                </div>
              )}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
