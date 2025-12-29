import type { Result } from "./result.js";

import { assertString } from "./errors.js";
import { create_element_object } from "./DomElementObject.js";
import { chat_archive, server_call_message } from "./server_call.js";

export type New_Chat_Object = { message: string; sessionId: string };
type Chat_Archive_Request_Object = {from_message: number; sessionId:string};

export type ArchiveResponse = { rows: ArchiveRow[] };
export type ArchiveRow = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};


const chat_display_screen_id = "chat_display_screen";
const chat_input_id = "chat_input_bar";
const send_message_id = "send_message_button";

const update_user_button_id = "update_user_button";
const update_user_input_id = "update_user_input";
const chat_session_id = "chat_recipricant";


const enum author{Local, Foreign}

const chat_display_object = create_element_object<HTMLDivElement>(chat_display_screen_id);
const chat_input_object   = create_element_object<HTMLInputElement>(chat_input_id);
const send_message_object = create_element_object<HTMLButtonElement>(send_message_id);

const update_user_input_object   = create_element_object<HTMLInputElement>(update_user_input_id);
const update_user_button_object = create_element_object<HTMLButtonElement>(update_user_button_id);
const chat_id_text_object = create_element_object<HTMLHeadingElement>(chat_session_id);

let chat_id : string = "Default";


async function send_Message(): Promise<Result<boolean>> {
  const inputRes = chat_input_object.return_element();
  if (!inputRes.success){
    return {success:false, err_message: "Input element not found"};
  }
  const chat_input = inputRes.return_obj;
  const message = chat_input.value.trim();
  add_message(message, author.Local);
  chat_input.value = "";

  const to_send : New_Chat_Object = {message : message, sessionId: chat_id};
  const json_body : string = JSON.stringify(to_send);
  console.log("SEND:", { message, chat_id });
  const server_response = await server_call_message(json_body);
  console.log(server_response);
  add_message(server_response.reply, author.Foreign);
  return {success:true, return_obj:true};
}

function add_message(content: string, sender : author) :Result<boolean> { 
  // result boolean is a placeholder, incase to be replaced with message details later such as message id

  const displayRes = chat_display_object.return_element();

  if (!displayRes.success) {
    return {success:false, err_message: "Chat Display element not found"};
  }

  
  const existing_messages = displayRes.return_obj;

  
  if (!assertString(content)) return {success:false, err_message:"Message to send is not detected as a string"};

  const div = document.createElement("div");
  div.classList.add("Message", sender === author.Local? "Local-Message" : "Foreign-Message");
  div.textContent = content;
  existing_messages.appendChild(div);
  existing_messages.scrollTop = existing_messages.scrollHeight;

  // return_obj placeholder 
  return {success:true, return_obj:true};
}


async function update_Chat_Id(): Promise<void> {
  const user_input_ = update_user_input_object.return_element();
  const chat_id_element = chat_id_text_object.return_element();
  if (!user_input_.success || !chat_id_element.success) return;

  chat_id = user_input_.return_obj.value.trim();
  if (!chat_id) return;

  chat_id_element.return_obj.textContent = chat_id;
  user_input_.return_obj.value = "";
  await get_Message_Archive();
}

async function get_Message_Archive():Promise<void>{
  const chat_display_ = chat_display_object.return_element(); 
  if (!chat_display_.success) return;

  chat_display_.return_obj.replaceChildren(); // Clears current messages from the screen

  const req: Chat_Archive_Request_Object = { from_message: 0, sessionId: chat_id }; // default most recent messages exclusively

  const json_body = JSON.stringify(req);

  try {
    const archive = await chat_archive(json_body);
    console.log("archive:", archive);

    if (!archive || !Array.isArray(archive.rows)) {
      throw new Error("Bad archive response (missing rows array)");
    }

    console.log("rows:", archive.rows);

    for (const row of archive.rows) {
      add_message(row.content, row.role === "user" ? author.Local : author.Foreign);
    }
  } catch (err) {
    console.error("archive fetch failed:", err);
    }
}




function setupChat(): void {
  const chat_display_: Result<HTMLDivElement>  = chat_display_object.update_element();
  const chat_input_:   Result<HTMLInputElement> = chat_input_object.update_element();
  const send_button_:  Result<HTMLButtonElement> = send_message_object.update_element();
  const user_input_:  Result<HTMLInputElement> = update_user_input_object.update_element();
  const user_button_:  Result<HTMLButtonElement> = update_user_button_object.update_element();
  const recipricant_ : Result<HTMLHeadingElement> = chat_id_text_object.update_element();

  if (!chat_display_.success || !chat_input_.success || !send_button_.success || !user_input_.success || !user_button_.success || !recipricant_.success ) return;

  recipricant_.return_obj.textContent = chat_id;
  
  send_button_.return_obj.onclick = send_Message;
  user_button_.return_obj.onclick = update_Chat_Id;

  get_Message_Archive();
}

function space_listener(event: KeyboardEvent): void {
  if (event.key === "Enter") send_Message();
}

document.addEventListener("DOMContentLoaded", setupChat);
document.addEventListener("keydown", space_listener);
