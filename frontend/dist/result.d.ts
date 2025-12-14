export type Result<T> = {
    success: true;
    return_obj: T;
} | {
    success: false;
    err_message: string;
};
//# sourceMappingURL=result.d.ts.map