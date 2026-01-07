import { logger } from './logger.js'

/**
 * Error tracking middleware
 * In production, you would integrate with services like Sentry, Rollbar, etc.
 */
export const errorTracker = {
  /**
   * Track an error
   * @param {Error} error - The error to track
   * @param {object} context - Additional context
   */
  trackError(error, context = {}) {
    // Log error with structured logging
    logger.error({
      err: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...context
    }, 'Error tracked')

    // In production, you would send to error tracking service:
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { extra: context })
    // }
  },

  /**
   * Track a warning
   * @param {string} message - Warning message
   * @param {object} context - Additional context
   */
  trackWarning(message, context = {}) {
    logger.warn({ ...context }, message)
  },

  /**
   * Track performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {object} metadata - Additional metadata
   */
  trackPerformance(operation, duration, metadata = {}) {
    logger.info({
      operation,
      duration: `${duration}ms`,
      ...metadata
    }, 'Performance metric')
  }
}
