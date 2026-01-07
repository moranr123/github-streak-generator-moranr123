import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import streakRoutes from "./routes/streakRoutes.js";
import { requestLogger, errorLogger } from "./middleware/logger.js";
import { logger } from "./middleware/logger.js";

const app = express();

// Security headers middleware (should be first)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow images from external sources
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images
}));

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

// Configure CORS with origin restrictions
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'X-RateLimit-Remaining', 'X-RateLimit-Limit', 'X-RateLimit-Reset'],
};

app.use(cors(corsOptions));

// Request size limits to prevent DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use("/api/streak", streakRoutes);

// Error logging middleware (should be after routes)
app.use(errorLogger);

// Final error handler middleware (must be last)
app.use((err, req, res, next) => {
  // Log error if not already logged
  if (!res.headersSent) {
    logger.error({ 
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name
      },
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress
    }, 'Unhandled error');
    
    // Send error response
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';
    
    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
