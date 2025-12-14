// src/chat.ts
console.log("chat.js LOADED");
import { assertString } from "./errors.js";
import { create_element_object } from "./DomElementObject.js";
const chat_display_screen_id = "chat_display_screen";
const chat_input_id = "chat_input_bar";
const send_message_id = "send_message_button";
const chat_display_object = create_element_object(chat_display_screen_id);
const chat_input_object = create_element_object(chat_input_id);
const send_message_object = create_element_object(send_message_id);
function send_Message() {
    const inputRes = chat_input_object.return_element();
    const displayRes = chat_display_object.return_element();
    if (!inputRes.success || !displayRes.success) {
        return;
    }
    const chat_input = inputRes.return_obj;
    const existing_messages = displayRes.return_obj;
    const message = chat_input.value.trim();
    if (!assertString(message))
        return;
    const div = document.createElement("div");
    div.textContent = message;
    existing_messages.appendChild(div);
    existing_messages.scrollTop = existing_messages.scrollHeight;
    chat_input.value = "";
}
function setupChat() {
    const chat_display_ = chat_display_object.update_element();
    const chat_input_ = chat_input_object.update_element();
    const send_button_ = send_message_object.update_element();
    if (!chat_display_.success || !chat_input_.success || !send_button_.success)
        return;
    send_button_.return_obj.onclick = send_Message;
}
function space_listener(event) {
    if (event.key === "Enter")
        send_Message();
}
document.addEventListener("DOMContentLoaded", setupChat);
document.addEventListener("keydown", space_listener);
//# sourceMappingURL=chat.js.map