export type Error_Messages = {
    ElementError: {
        element_name: string;
    };
    NoMessage: {};
};
export declare function log_error<T extends keyof Error_Messages>(error_type: T, params: Error_Messages[T]): void;
export declare function assertString(message: string): message is string;
//# sourceMappingURL=errors.d.ts.map