const IPMA_BASE = "https://api.ipma.pt/open-data/observation/seismic";

const ALLOWED_ORIGINS = [
  "https://sismos.andrejesus.com",
  "http://localhost:5173",
];

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
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
      return new Response(null, { headers: getCorsHeaders(request) });
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

        return jsonResponse(merged, getCorsHeaders(request));
      }

      if (url.pathname === "/api/earthquakes/continent") {
        const data = await fetchIPMA(7);
        return jsonResponse(data, getCorsHeaders(request));
      }

      if (url.pathname === "/api/earthquakes/azores") {
        const data = await fetchIPMA(3);
        return jsonResponse(data, getCorsHeaders(request));
      }

      return new Response("Not found", {
        status: 404,
        headers: getCorsHeaders(request),
      });
    } catch (error) {
      console.error("Error fetching IPMA data:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch earthquake data from IPMA" }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request),
            ...SECURITY_HEADERS,
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

function jsonResponse(data: unknown, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      ...corsHeaders,
      ...SECURITY_HEADERS,
    },
  });
}
