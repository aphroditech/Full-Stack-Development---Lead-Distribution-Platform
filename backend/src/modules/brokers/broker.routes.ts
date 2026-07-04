import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { brokerCreateSchema, brokerUpdateSchema } from "./broker.schema";
import {
  createBroker,
  deleteBroker,
  getBroker,
  listBrokers,
  updateBroker,
} from "./broker.controller";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(listBrokers));
router.post("/", validateBody(brokerCreateSchema), asyncHandler(createBroker));
router.get("/:id", asyncHandler(getBroker));
router.put("/:id", validateBody(brokerUpdateSchema), asyncHandler(updateBroker));
router.delete("/:id", asyncHandler(deleteBroker));

export default router;
