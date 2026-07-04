import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { validateBody } from "../../middleware/validate";
import { publicLeadSchema } from "./public.schema";
import { getPublicForm, submitLead } from "./public.controller";

// No authentication — these are the visitor-facing endpoints.
const router = Router();

router.get("/forms/:slug", asyncHandler(getPublicForm));
router.post("/forms/:slug/leads", validateBody(publicLeadSchema), asyncHandler(submitLead));

export default router;
