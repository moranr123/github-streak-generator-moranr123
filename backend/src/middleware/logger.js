import pino from 'pino'

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
})

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  // Log request
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  }, 'Incoming request')

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    }, 'Request completed')
  })

  next()
}

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress
  }, 'Request error')

  next(err)
}
