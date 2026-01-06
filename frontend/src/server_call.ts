
import type { ArchiveResponse } from "./chat";
export async function server_call_message(message: string){
    
    const response =  await fetch("/api/chat", {
        method: "POST",
        headers: {"content-type" : "application/json"},
        body: message,
    });

    if(!response.ok) throw new Error(await response.text());
    return (await response.json() as {reply:string});    
}

export async function chat_archive(json_body: string): Promise<ArchiveResponse> {
  const response = await fetch("/api/archive", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json_body,
  });

  if (!response.ok) throw new Error(await response.text());
  return (await response.json()) as ArchiveResponse;
}
