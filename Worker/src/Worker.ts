import type { Fetcher, ExportedHandler } from "@cloudflare/workers-types";

interface Env {
  ASSETS: Fetcher; // from wrangler.toml binding
}

type ChatRequestBody = { message: string };
type ChatResponseBody = { reply: string };

async function handleChatRequest(request: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message = body.message?.trim() ?? "";
  if (!message) {
    return new Response(JSON.stringify({ error: "Empty message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stage 2a: dummy echo
  const reply: ChatResponseBody["reply"] = `Echo: ${message}`;

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const worker: ExportedHandler<Env> = {
  async fetch(request : Request, env : Env): Promise<Response> {
    const url = new URL(request.url);

    // Backend route
    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChatRequest(request);
    }

    // Everything else → static frontend from ./frontend
    return env.ASSETS.fetch(request);
  },
};

export default worker;
