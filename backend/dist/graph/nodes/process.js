export async function processInput(state) {
    const { input } = state;
    const response = `Processed: "${input}". This is a placeholder response. OpenAI integration will replace this.`;
    return {
        output: response,
        messages: [response],
    };
}
//# sourceMappingURL=process.js.map