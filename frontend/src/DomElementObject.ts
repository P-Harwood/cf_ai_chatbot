import { log_error } from "./errors.js";
import type { Result } from "./result.js";

export type element_object_handle<T extends HTMLElement> = {
  update_element: () => Result<T>;
  return_element: () => Result<T>;
};

export function assertElement<T extends HTMLElement>(
  element: T | null,
  name: string
): element is T {
  if (element == null) {
    log_error("ElementError", { element_name: name });
    return false;
  }
  return true;
}

export function create_element_object<T extends HTMLElement>(
  element_id: string
): element_object_handle<T> {
  let element_object: T | null = null;

  const get_element = (): Result<T> => {
    element_object = document.getElementById(element_id) as T | null;

    if (!assertElement(element_object, element_id)) {
      return { success: false, err_message: "Element not found" };
    }

    return { success: true, return_obj: element_object };
  };

  const return_safe_element = (): Result<T> => {
    if (element_object) {
      return { success: true, return_obj: element_object };
    }
    return get_element();
  };

  return {
    update_element: get_element,
    return_element: return_safe_element,
  };
}
