import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import { validateBody } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { distributionCreateSchema, distributionUpdateSchema } from "./distribution.schema";
import {
  createDistribution,
  getDistribution,
  updateDistributionBrokers,
} from "./distribution.controller";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(getDistribution));
router.post("/", validateBody(distributionCreateSchema), asyncHandler(createDistribution));
router.put(
  "/brokers",
  validateBody(distributionUpdateSchema),
  asyncHandler(updateDistributionBrokers),
);

export default router;
