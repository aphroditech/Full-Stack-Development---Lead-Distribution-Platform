import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { assignLeadSchema } from "./lead.schema";
import { assignLead, listLeads } from "./lead.controller";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(listLeads));
router.post("/:id/assign", validateBody(assignLeadSchema), asyncHandler(assignLead));

export default router;
