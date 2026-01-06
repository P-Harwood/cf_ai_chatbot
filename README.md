Simple AI chatbot on Cloudflare.

- Frontend: plain HTML + TypeScript (compiled with tsc)
- Backend: Cloudflare Worker (serves static files + API routes)
- AI: Cloudflare Workers AI (model: @cf/meta/llama-3-8b-instruct)
- Storage: Durable Objects (SQLite) per sessionId
  - Stores full chat history (for AI context) in DO storage
  - Stores messages in a SQLite table called messages (for archive)

Includes PROMPTS.md

---

## How it works (high level)

- Frontend calls:
  - POST /api/chat with { message, sessionId }
  - POST /api/archive with { from_message, sessionId }

- Worker:
  - normalises sessionId (lowercase, strips weird chars, max 40)
  - routes each chat to a Durable Object instance using idFromName("chat_" + sessionId)
  - forwards:
    - /api/chat -> DO /newmessage (POST)
    - /api/archive -> DO /archive (GET) with query params

- Durable Object:
  - creates SQLite table messages on startup (CREATE TABLE IF NOT EXISTS)
  - /newmessage:
    - adds message to history
    - calls Workers AI with messages: history
    - saves assistant reply
    - inserts both user + assistant into SQLite
    - returns { reply }
  - /archive:
    - returns last N rows from SQLite (ordered newest first)

---

## Repo structure

- frontend/
  - src/ (TypeScript)
  - dist/ (compiled output + static assets served by the Worker)
- Worker/
  - Worker.ts (main Worker entry)
  - ChatMessagesDurableObject.ts (DO)
- wrangler.toml

---

## Requirements

- Node.js + npm
- Cloudflare account (wrangler login)
- Wrangler via npx

Check:
~~~bash
node -v
npm -v
npx wrangler -v
```

---

## Install + build + deploy (recommended)

This is the exact fresh setup flow you tested:

```bash
git clone git@github.com:P-Harwood/cf_ai_chatbot.git
cd cf_ai_chatbot \
  && npm install \
  && cd frontend && npm install && npx tsc \
  && cd ../Worker && npm install \
  && cd .. && npx wrangler deploy
```

After deploy, open the workers.dev URL wrangler prints.

---

## Local dev note (important)

This project uses Workers AI plus SQLite Durable Objects.

* Workers AI binding needs a remote runtime.
* SQLite Durable Objects do not pair well with remote dev.

So the full real behaviour (AI + storage together) is tested via deploy.

If you run local dev, the AI call will fail with:
Binding AI needs to be run remotely

---

## API

### POST /api/chat

Body:

```json
{ "message": "hello", "sessionId": "default" }
```

Response:

```json
{ "reply": "..." }
```

### POST /api/archive

Body:

```json
{ "from_message": 0, "sessionId": "default" }
```

Note: it is worth noting that from_message is not connected to functionality at the moment

Response:

```json
{ "rows": [ { "id": 1, "role": "user", "content": "...", "created_at": "..." } ] }
```

Note: rows are returned newest first (ORDER BY id DESC). 

---

## Quick live test (curl)

Replace YOUR_WORKERS_URL with your deployed workers.dev url.

```bash
curl -s -X POST https://YOUR_WORKERS_URL/api/chat \
  -H "content-type: application/json" \
  -d '{"message":"hello","sessionId":"default"}'

curl -s -X POST https://YOUR_WORKERS_URL/api/archive \
  -H "content-type: application/json" \
  -d '{"from_message":0,"sessionId":"default"}'
```
