export interface GraphState {
    messages: string[];
    input: string;
    output: string;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map