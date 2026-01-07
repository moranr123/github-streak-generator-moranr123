import rateLimit from 'express-rate-limit';
import { logger } from './logger.js';

// General API rate limiter - 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn({ 
      ip: req.ip, 
      path: req.path,
      method: req.method 
    }, 'Rate limit exceeded');
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Stricter rate limiter for card generation - 30 requests per 15 minutes per IP
export const cardGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 card generations per windowMs
  message: {
    error: 'Too many card generation requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ 
      ip: req.ip, 
      username: req.params.username,
      path: req.path 
    }, 'Card generation rate limit exceeded');
    
    res.status(429).json({
      error: 'Too many card generation requests, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});
