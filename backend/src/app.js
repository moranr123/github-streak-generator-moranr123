import express from "express";
import cors from "cors";
import compression from "compression";
import streakRoutes from "./routes/streakRoutes.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";

const app = express();

// Request logging middleware (should be early in the chain)
app.use(requestLogger);

// Compression middleware for performance
app.use(compression({
  level: 6, // Compression level (0-9, 6 is a good balance)
  filter: (req, res) => {
    // Don't compress images (they're already compressed)
    if (req.headers['accept'] && req.headers['accept'].includes('image/')) {
      return false;
    }
    // Use compression for other responses
    return compression.filter(req, res);
  }
}));

app.use(cors());
app.use(express.json());

app.use("/api/streak", streakRoutes);

// Error logging middleware (should be after routes)
app.use(errorLogger);

export default app;
