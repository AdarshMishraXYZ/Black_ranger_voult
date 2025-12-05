import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { pool } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import identityRoutes from "./routes/identities.js";
import qrRoutes from "./routes/qr.js";
import verifyRoutes from "./routes/verify.js";
import logsRoutes from "./routes/logs.js";
import statsRoutes from "./routes/stats.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://secondaryrepo-b834p998o-adarshs-projects-14021ad6.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        database: "disconnected",
        error: error.message,
      });
  }
});

// Public key endpoint for offline verification
app.get("/api/public-key", async (req, res) => {
  try {
    const fs = await import("fs").then((m) => m.promises);
    const path = await import("path");
    const publicKeyPath =
      process.env.JWT_PUBLIC_KEY_PATH || "./keys/public_key.pem";
    const publicKey = await fs.readFile(path.resolve(publicKeyPath), "utf8");
    res.json({ publicKey });
  } catch (error) {
    res.status(500).json({ error: "Public key not available" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/identities", identityRoutes);
app.use("/api/generate-qr", qrRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/stats", statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BLACK RANGER Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await pool.end();
  process.exit(0);
});
