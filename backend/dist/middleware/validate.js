import { z } from "zod";
export const chatInputSchema = z.object({
    input: z.string().min(1, "Input is required").max(10000, "Input too long"),
});
export function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.issues.map((i) => i.message).join(", ");
            res.status(400).json({ success: false, error: message });
            return;
        }
        next();
    };
}
//# sourceMappingURL=validate.js.map