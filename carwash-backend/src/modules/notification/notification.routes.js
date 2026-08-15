import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listMyNotifications,
  markRead,
  markAllRead,
  create,
} from "./notification.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/me", listMyNotifications);
router.get("/", listMyNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
router.post("/", create);

export default router;
