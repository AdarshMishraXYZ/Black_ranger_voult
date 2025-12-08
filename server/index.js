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
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Try multiple possible paths for frontend build
  const possiblePaths = [
    path.join(__dirname, "../client/dist"),
    path.join(__dirname, "../public"),
    path.join(__dirname, "./public")
  ];
  
  for (const staticPath of possiblePaths) {
    try {
      const fs = await import("fs").then((m) => m.promises);
      await fs.access(staticPath);
      app.use(express.static(staticPath));
      
      // Serve React app for all non-API routes
      app.get("*", (req, res) => {
        res.sendFile(path.join(staticPath, "index.html"));
      });
      console.log(`✅ Serving static files from: ${staticPath}`);
      break;
    } catch (err) {
      // Path doesn't exist, try next one
    }
  }
}

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
