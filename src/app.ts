import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import { AppRouters } from "./app/routes";

const app: Application = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["x-guest-id"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1", AppRouters);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Multi-vendor e-commerce API is running" });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
