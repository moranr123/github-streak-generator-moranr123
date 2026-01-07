import rateLimit from 'express-rate-limit';
import { logger } from './logger.js';

/**
 * General API rate limiter - for JSON endpoints
 * Allows 100 requests per 15 minutes per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn({ 
      ip: req.ip, 
      path: req.path,
      method: req.method 
    }, 'Rate limit exceeded for general API');
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.'
    });
  }
});

/**
 * Card generation rate limiter - stricter for resource-intensive operations
 * Allows 30 requests per 15 minutes per IP
 */
export const cardGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 card generations per windowMs
  message: {
    error: 'Too many card generation requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ 
      ip: req.ip, 
      path: req.path,
      method: req.method,
      username: req.params?.username 
    }, 'Rate limit exceeded for card generation');
    res.status(429).json({
      error: 'Too many card generation requests from this IP, please try again later.'
    });
  }
});

/**
 * Strict rate limiter for sensitive endpoints
 * Allows 10 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ 
      ip: req.ip, 
      path: req.path,
      method: req.method 
    }, 'Rate limit exceeded for strict endpoint');
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.'
    });
  }
});
