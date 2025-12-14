import { log_error } from "./errors.js";
export function assertElement(element, name) {
    if (element == null) {
        log_error("ElementError", { element_name: name });
        return false;
    }
    return true;
}
export function create_element_object(element_id) {
    let element_object = null;
    const get_element = () => {
        element_object = document.getElementById(element_id);
        if (!assertElement(element_object, element_id)) {
            return { success: false, err_message: "Element not found" };
        }
        return { success: true, return_obj: element_object };
    };
    const return_safe_element = () => {
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
//# sourceMappingURL=DomElementObject.js.map