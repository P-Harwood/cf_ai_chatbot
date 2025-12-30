import type { DurableObjectNamespace, Fetcher, Ai, ExportedHandler } from "@cloudflare/workers-types";

export { ChatMessagesDurableObject } from "./ChatMessagesDurableObject";



type New_Message_Object = { message: string; sessionId: string };
type Chat_Archive_Request_Object = {from_message: number; sessionId:string};

interface Env { // defined in  wrangler.toml
  ASSETS: Fetcher;
  AI : Ai,
  CHAT : DurableObjectNamespace;
}

function normaliseSessionId(raw: string | null | undefined): string {
  return (raw ?? "default")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40) || "default";
}

function chatStub(env: Env, rawSessionId: string | null | undefined) {
  const sessionId = normaliseSessionId(rawSessionId);
  const id = env.CHAT.idFromName(`chat_${sessionId}`);
  return env.CHAT.get(id);
}

async function readJson<T>(request: Request): Promise<T | null> {
  try { return (await request.json()) as T; }
  catch { return null; }
}




async function newChatMessage(env: Env, request: Request): Promise<Response> {


  const body = await readJson<New_Message_Object>(request);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const message = (body.message ?? "").trim();
  if (!message) return Response.json({ error: "Empty message" }, { status: 400 });


  const stub = chatStub(env, body.sessionId);

  return stub.fetch("https://do/newmessage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
  });
}


async function chatArchiveRequest(env: Env, request: Request): Promise<Response> {
  const body = await readJson<Chat_Archive_Request_Object>(request);
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const from_message_point = Number(body.from_message ?? 0) || 0;

  const limit = 50;

  const stub = chatStub(env, body.sessionId);

return stub.fetch(
  `https://do/archive?limit=${limit}&from_message_point=${from_message_point}`,
  { method: "GET" }
);

}


const worker: ExportedHandler<Env> = {
  async fetch(request : Request, env : Env): Promise<Response> {
    const url = new URL(request.url);

    if(url.pathname === "/api/chat" && request.method === "POST") {
      return newChatMessage(env, request);
    }else if(url.pathname === "/api/archive" && request.method === "POST"){
      return chatArchiveRequest(env,request);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
