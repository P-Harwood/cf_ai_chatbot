export type Error_Messages = {
  ElementError: { element_name: string };
  NoMessage: {};
};

export function log_error<T extends keyof Error_Messages>(
  error_type: T,
  params: Error_Messages[T]
): void {
  switch (error_type) {
    case "ElementError":
      console.error(
        `Element does not exist: ${(params as Error_Messages["ElementError"]).element_name}`
      );
      break;
    case "NoMessage":
      console.error("No string message is in the text input box");
      break;
    default:
      console.error("Malformed error passed to log error");
      break;
  }
}

export function assertString(message: string): message is string {
  if (message.length === 0) {
    log_error("NoMessage", {});
    return false;
  }
  return true;
}
