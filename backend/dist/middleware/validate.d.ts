import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
export declare const chatInputSchema: z.ZodObject<{
    input: z.ZodString;
}, z.core.$strip>;
export declare function validate(schema: z.ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map