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

/** Cache TTL in seconds — matches the frontend's 5-min refresh interval */
const CACHE_TTL = 300;

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
        return handleCached(request, url, fetchAllEarthquakes);
      }

      if (url.pathname === "/api/earthquakes/continent") {
        return handleCached(request, url, () => fetchIPMA(7));
      }

      if (url.pathname === "/api/earthquakes/azores") {
        return handleCached(request, url, () => fetchIPMA(3));
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
      "Cache-Control": `public, max-age=${CACHE_TTL}`,
      ...corsHeaders,
      ...SECURITY_HEADERS,
    },
  });
}

async function fetchAllEarthquakes(): Promise<unknown> {
  const [continent, azores] = await Promise.all([
    fetchIPMA(7),
    fetchIPMA(3),
  ]);

  return {
    continent,
    azores,
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * Check the Cloudflare edge cache for a cached response. On miss,
 * call the fetcher, cache the result at the edge for CACHE_TTL seconds,
 * and return it. CORS headers are always set fresh per-request since
 * they depend on the Origin header, but the cached body avoids hitting IPMA.
 */
async function handleCached(
  request: Request,
  url: URL,
  fetcher: () => Promise<unknown>
): Promise<Response> {
  // Build a cache key without the Origin header so all users share the same entry
  const cacheKey = new Request(url.toString(), { method: "GET" });
  // caches.default is Cloudflare Workers' edge cache — not in DOM typings
  const cache = (caches as unknown as { default: Cache }).default;

  const cached = await cache.match(cacheKey);
  if (cached) {
    // Re-apply CORS headers for this specific request's Origin
    const response = new Response(cached.body, cached);
    const corsHeaders = getCorsHeaders(request);
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Cache miss — fetch fresh data from IPMA
  const data = await fetcher();
  const response = jsonResponse(data, getCorsHeaders(request));

  // Store in edge cache (clone because the body can only be consumed once)
  await cache.put(cacheKey, response.clone());

  return response;
}
