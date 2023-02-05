import MorConfig from './MorConfig.js'

import * as winston from 'winston'
import 'winston-daily-rotate-file'

const DATE_PATTERN = 'YYYY-MM-DD'
const ROTATE_TIME = '7d'
const FORMAT = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.simple()
)

winston.loggers.add('bot', {
  level: MorConfig.LOG_LEVEL || 'info',
  defaultMeta: { service: 'bot' },
  format: FORMAT,
  transports: [
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'info',
      filename: './logs/bot_%DATE%.log',
      datePattern: DATE_PATTERN,
      maxFiles: ROTATE_TIME
    }),
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'info'
    })
  ]
})

winston.loggers.add('jobs', {
  level: MorConfig.LOG_LEVEL || 'info',
  defaultMeta: { service: 'jobs' },
  format: FORMAT,
  transports: [
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'info',
      filename: './logs/jobs_%DATE%.log',
      datePattern: DATE_PATTERN,
      maxFiles: ROTATE_TIME
    }),
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'info'
    })
  ]
})
