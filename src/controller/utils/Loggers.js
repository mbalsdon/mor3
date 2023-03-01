import MorConfig from './MorConfig.js'

import * as winston from 'winston'
import 'winston-daily-rotate-file'

const DATE_PATTERN = 'YYYY-MM-DD'
const ROTATE_TIME = '3d'
const FORMAT = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.simple()
)

// Logger for Discord bot
winston.loggers.add('bot', {
  level: MorConfig.LOG_LEVEL || 'info',
  defaultMeta: { service: 'bot' },
  format: FORMAT,
  transports: [
    // Log-rotated file
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'info',
      filename: './logs/bot_%DATE%.log',
      datePattern: DATE_PATTERN,
      maxFiles: ROTATE_TIME
    }),
    // Stdout
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'info'
    })
  ]
})

// Logger for scheduled tasks
winston.loggers.add('jobs', {
  level: MorConfig.LOG_LEVEL || 'info',
  defaultMeta: { service: 'jobs' },
  format: FORMAT,
  transports: [
    // Log-rotated file
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'info',
      filename: './logs/jobs_%DATE%.log',
      datePattern: DATE_PATTERN,
      maxFiles: ROTATE_TIME
    }),
    // Stdout
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'info'
    })
  ]
})

// Logger for backend layer processes
winston.loggers.add('debug', {
  level: MorConfig.LOG_LEVEL || 'debug',
  format: FORMAT,
  transports: [
    // Log-rotated file
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'debug',
      filename: './logs/debug_%DATE%.log',
      datePattern: DATE_PATTERN,
      maxFiles: ROTATE_TIME
    }),
    // Stdout
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'debug'
    })
  ]
})
