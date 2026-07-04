import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error";
import authRoutes from "./modules/auth/auth.routes";
import publicRoutes from "./modules/public/public.routes";
import brokerRoutes from "./modules/brokers/broker.routes";
import formRoutes from "./modules/forms/form.routes";
import distributionRoutes from "./modules/distribution/distribution.routes";
import leadRoutes from "./modules/leads/lead.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", true);
  app.use(helmet());
  if (env.CORS_ORIGIN) {
    app.use(
      cors({
        origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
        credentials: true,
      }),
    );
  }
  app.use(express.json({ limit: "1mb" }));
  if (env.NODE_ENV !== "test") app.use(morgan("tiny"));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/brokers", brokerRoutes);
  app.use("/api/form", formRoutes);
  app.use("/api/distribution", distributionRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
