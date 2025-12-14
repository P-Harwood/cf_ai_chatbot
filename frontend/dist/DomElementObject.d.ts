import type { Result } from "./result.js";
export type element_object_handle<T extends HTMLElement> = {
    update_element: () => Result<T>;
    return_element: () => Result<T>;
};
export declare function assertElement<T extends HTMLElement>(element: T | null, name: string): element is T;
export declare function create_element_object<T extends HTMLElement>(element_id: string): element_object_handle<T>;
//# sourceMappingURL=DomElementObject.d.ts.map