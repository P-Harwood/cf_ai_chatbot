import { assertString } from "./errors.js";
import { create_element_object } from "./DomElementObject.js";
const chat_display_screen_id = "chat_display_screen";
const chat_input_id = "chat_input_bar";
const send_message_id = "send_message_button";
var author;
(function (author) {
    author[author["Local"] = 0] = "Local";
    author[author["Foreign"] = 1] = "Foreign";
})(author || (author = {}));
const chat_display_object = create_element_object(chat_display_screen_id);
const chat_input_object = create_element_object(chat_input_id);
const send_message_object = create_element_object(send_message_id);
function send_Message() {
    const inputRes = chat_input_object.return_element();
    if (!inputRes.success) {
        return;
    }
    const chat_input = inputRes.return_obj;
    const message = chat_input.value.trim();
    add_message(message, author.Local);
    chat_input.value = "";
}
function add_message(content, sender) {
    // result boolean is a placeholder, incase to be replaced with message details later such as message id
    const displayRes = chat_display_object.return_element();
    if (!displayRes.success) {
        return { success: false, err_message: "Chat Display element not found" };
    }
    const existing_messages = displayRes.return_obj;
    if (!assertString(content))
        return { success: false, err_message: "Message to send is not detected as a string" };
    const div = document.createElement("div");
    div.classList.add("Message", sender === author.Local ? "Local-Message" : "Foreign-Message");
    //div.className = sender === author.Local? "Local-Message" : "Foreign-Sender";
    div.textContent = content;
    existing_messages.appendChild(div);
    existing_messages.scrollTop = existing_messages.scrollHeight;
    // return_obj placeholder 
    return { success: true, return_obj: true };
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