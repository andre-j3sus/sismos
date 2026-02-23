const IPMA_BASE = "https://api.ipma.pt/open-data/observation/seismic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Only handle /api routes — everything else is served as static assets
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      if (url.pathname === "/api/earthquakes") {
        // Fetch both regions in parallel
        const [continent, azores] = await Promise.all([
          fetchIPMA(7),
          fetchIPMA(3),
        ]);

        const merged = {
          continent,
          azores,
          lastUpdate: new Date().toISOString(),
        };

        return jsonResponse(merged);
      }

      if (url.pathname === "/api/earthquakes/continent") {
        const data = await fetchIPMA(7);
        return jsonResponse(data);
      }

      if (url.pathname === "/api/earthquakes/azores") {
        const data = await fetchIPMA(3);
        return jsonResponse(data);
      }

      return new Response("Not found", {
        status: 404,
        headers: CORS_HEADERS,
      });
    } catch (error) {
      console.error("Error fetching IPMA data:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch earthquake data from IPMA" }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }
  },
};

async function fetchIPMA(idArea: number) {
  const response = await fetch(`${IPMA_BASE}/${idArea}.json`, {
    headers: {
      "User-Agent": "sismos.pt/1.0 (earthquake monitor)",
    },
  });

  if (!response.ok) {
    throw new Error(`IPMA API returned ${response.status} for area ${idArea}`);
  }

  return response.json();
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      ...CORS_HEADERS,
    },
  });
}
