export function log_error(error_type, params) {
    switch (error_type) {
        case "ElementError":
            console.error(`Element does not exist: ${params.element_name}`);
            break;
        case "NoMessage":
            console.error("No string message is in the text input box");
            break;
        default:
            console.error("Malformed error passed to log error");
            break;
    }
}
export function assertString(message) {
    if (message.length === 0) {
        log_error("NoMessage", {});
        return false;
    }
    return true;
}
//# sourceMappingURL=errors.js.map