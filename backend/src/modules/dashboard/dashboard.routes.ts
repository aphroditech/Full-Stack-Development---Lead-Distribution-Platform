import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { requireAuth } from "../../middleware/auth";
import { getStats } from "./dashboard.controller";

const router = Router();
router.use(requireAuth);

router.get("/stats", asyncHandler(getStats));

export default router;
