import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { formCreateSchema } from "./form.schema";
import { createForm, getForm } from "./form.controller";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(getForm));
router.post("/", validateBody(formCreateSchema), asyncHandler(createForm));

export default router;
