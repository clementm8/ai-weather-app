import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import openaiHandler from "./api/openai.js";
import weatherHandler from "./api/weather.js";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

// Run the serverless handlers during `npm run dev` so API keys stay off the client.
function localApi(env) {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/openai") && !url.startsWith("/api/weather")) {
          return next();
        }

        process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
        process.env.OPENWEATHER_API_KEY = env.OPENWEATHER_API_KEY;

        try {
          if (req.method === "POST") {
            req.body = await readJsonBody(req);
          }
          if (url.startsWith("/api/weather")) return weatherHandler(req, res);
          return openaiHandler(req, res);
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid JSON body" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), localApi(env)],
  };
});
