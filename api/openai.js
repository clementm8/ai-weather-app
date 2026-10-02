const ALLOWED_MODEL = "gpt-3.5-turbo-16k";
const MAX_TOKENS = 400;
const MAX_MESSAGES = 4;
const MAX_CONTENT = 4000;

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

function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }
  const cleaned = [];
  for (const message of messages) {
    if (!message || typeof message.content !== "string" || message.content.length > MAX_CONTENT) {
      return null;
    }
    if (!["system", "user", "assistant"].includes(message.role)) {
      return null;
    }
    cleaned.push({ role: message.role, content: message.content });
  }
  return cleaned;
}

function sanitizeFunctions(functions) {
  if (functions == null) return undefined;
  if (!Array.isArray(functions) || functions.length !== 1) return null;
  if (functions[0]?.name !== "displayData") return null;
  if (JSON.stringify(functions).length > 4000) return null;
  return functions;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(body == null ? "" : JSON.stringify(body));
}

export default async function handler(req, res) {
  if (!isSameOrigin(req)) {
    return send(res, 403, { error: "Cross-origin requests are not allowed" });
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "Method not allowed" });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return send(res, 500, { error: "OpenAI API key not configured" });
  }

  const body = req.body || {};
  if (body.model !== ALLOWED_MODEL) {
    return send(res, 400, { error: "Model is not allowed" });
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages) {
    return send(res, 400, { error: "Invalid messages" });
  }

  const functions = sanitizeFunctions(body.functions);
  if (body.functions != null && !functions) {
    return send(res, 400, { error: "Invalid functions" });
  }

  if (body.function_call != null && body.function_call !== "auto") {
    return send(res, 400, { error: "Invalid function_call" });
  }

  const payload = {
    model: ALLOWED_MODEL,
    messages,
    max_tokens: MAX_TOKENS,
  };
  if (functions) {
    payload.functions = functions;
    payload.function_call = "auto";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return send(res, response.status, data);
  } catch (error) {
    console.error("OpenAI proxy error:", error);
    return send(res, 500, { error: "Failed to proxy request to OpenAI" });
  }
}
