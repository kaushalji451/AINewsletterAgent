export function shouldContinue(state) {
    if (state.input.trim().length === 0) {
        return "__end__";
    }
    return "process";
}
//# sourceMappingURL=conditional.js.map