function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function queryParams(req) {
  if (req.query && (req.query.q || req.query.lat || req.query.lon)) {
    return req.query;
  }
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  return Object.fromEntries(url.searchParams);
}

function isCoord(value, min, max) {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (!isSameOrigin(req)) {
    return send(res, 403, { error: "Cross-origin requests are not allowed" });
  }

  if (req.method !== "GET") {
    return send(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return send(res, 500, { error: "OpenWeather API key not configured" });
  }

  const { q, lat, lon } = queryParams(req);
  let target;

  if (typeof q === "string" && q.trim()) {
    if (q.length > 200) {
      return send(res, 400, { error: "Location query is too long" });
    }
    target = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`;
  } else if (isCoord(lat, -90, 90) && isCoord(lon, -180, 180)) {
    target = `https://api.openweathermap.org/data/2.5/weather?lat=${Number(lat)}&lon=${Number(lon)}&appid=${apiKey}`;
  } else {
    return send(res, 400, { error: "Provide a location query or coordinates" });
  }

  try {
    const response = await fetch(target);
    const data = await response.json();
    return send(res, response.status, data);
  } catch (error) {
    console.error("OpenWeather proxy error:", error);
    return send(res, 500, { error: "Failed to fetch weather data" });
  }
}
