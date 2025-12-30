
import type {
  DurableObjectNamespace,
  DurableObjectState,
} from "@cloudflare/workers-types";




interface Env { // defined in  wrangler.toml
  ASSETS: Fetcher;
  AI : Ai,
  CHAT: DurableObjectNamespace; 
}

type stored_message = { role: "system" | "user" | "assistant"; content: string };

export class ChatMessagesDurableObject {
  constructor(private state: DurableObjectState, private env: Env) {
    this.state.blockConcurrencyWhile(async () => {
      this.state.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );
      `);
    });
  }

 private async return_messages(url:URL): Promise<Response> {
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 200);
    const rows = this.state.storage.sql
      .exec(
        `SELECT id, role, content, created_at
        FROM messages
        ORDER BY id DESC
        LIMIT ?;`,
        limit
      )
      .toArray();

    return Response.json({ rows });
  }



  private async new_chat_message(request:Request) : Promise<Response>{
  try {
      console.log("Made it into newchatmessage function");
        const { message } = (await request.json()) as { message: string };

        const history =
          (await this.state.storage.get<stored_message[]>("history")) ?? [];

        history.push({ role: "user", content: message });

        const ai = await this.env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: history,
        });

        const replyText = (ai as any).response ?? JSON.stringify(ai);
        history.push({ role: "assistant", content: replyText });

        await this.state.storage.put("history", history);

        this.state.storage.sql.exec(
          `INSERT INTO messages (role, content) VALUES (?, ?), (?, ?);`,
          "user",
          message,
          "assistant",
          replyText
        );

        return Response.json({ reply: replyText });
      } catch (err) {
        return Response.json(
          { error: "DO failed", detail: String(err) },
          { status: 500 }
        );
      }
    }


  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    try{
      if(url.pathname === "/newmessage" && request.method === "POST"){
        return await this.new_chat_message(request);
      }
      if(url.pathname === "/archive" && request.method === "GET"){
        return await this.return_messages(url);
      }
      throw new Error("Request not recognised");
    }catch(err){
      console.error(`[Durable Object Error] ${err}`);
      return Response.json({error:String(err)}, {status:500});
      }
    }
}




export default ChatMessagesDurableObject;