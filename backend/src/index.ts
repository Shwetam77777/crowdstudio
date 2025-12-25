import express, { Application, Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import { prisma } from "./db";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import songsRoutes from "./routes/songs";

const app: Application = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(healthRoutes);
app.use(authRoutes);
app.use(songsRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

const start = async () => {
  try {
    await prisma.$connect();
    console.log("✓ Database connected");

    app.listen(config.port, () => {
      console.log(
        `✓ Server running on http://localhost:${config.port} [${config.nodeEnv}]`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
