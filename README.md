# sismos.pt

**[sismos.andrejesus.com](https://sismos.andrejesus.com)**

Real-time earthquake monitor for Portugal. Displays seismic data from [IPMA](https://www.ipma.pt) (Instituto Português do Mar e da Atmosfera) on an interactive map.

Built as a lightweight alternative to IPMA's own website, which tends to crash during seismic events.

## Features

- **Interactive map** — Leaflet map with circle markers colored and sized by magnitude
- **Earthquake list** — Scrollable, synced with map selection, pulsing indicator for recent quakes
- **Filters** — Time range (1h/24h/7d/30d), magnitude, depth, and region (Continente/Madeira/Acores)
- **Shareable URLs** — Filters and selected earthquake persisted in search params
- **Dark mode** — Follows OS preference, toggleable, persisted in localStorage
- **Bilingual** — Portuguese and English
- **Collapsible list** — Overlay panel that slides away to reveal full map
- **Auto-refresh** — Data updates every 5 minutes

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Leaflet
- **Build**: Vite 7
- **Hosting**: Cloudflare Workers (API proxy + static assets)
- **Data**: IPMA public seismic API (no auth required)

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build & Deploy

```bash
npm run build     # Production build
npm run deploy    # Build + deploy to Cloudflare Workers
```

## Data Source

Earthquake data provided by [IPMA](https://www.ipma.pt) — Instituto Português do Mar e da Atmosfera. Updated hourly. Free for non-commercial use with attribution.
