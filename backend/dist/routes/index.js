import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";
import { validate, chatInputSchema } from "../middleware/validate.js";
const router = Router();
router.post("/chat", validate(chatInputSchema), handleChat);
export default router;
//# sourceMappingURL=index.js.map