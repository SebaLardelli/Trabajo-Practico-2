import { Router } from "express";
import { listNotices, markNoticesRead, unreadNotices } from "../controllers/notices.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.js";
import { markNoticesSchema } from "../schemas/loan.schema.js";

const router = Router();

router.get("/unread", authMiddleware, unreadNotices);
router.get("/", authMiddleware, listNotices);
router.post("/read", authMiddleware, validateBody(markNoticesSchema), markNoticesRead);

export default router;
