import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "reelvault-api",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;