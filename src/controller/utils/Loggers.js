import MorConfig from './MorConfig.js'

import * as winston from 'winston'
import 'winston-daily-rotate-file'

winston.loggers.add('bot', {
  level: MorConfig.LOG_LEVEL || 'info',
  defaultMeta: { service: 'bot' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'info',
      filename: './logs/bot_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d'
    }),
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'info'
    })
  ]
})

winston.loggers.add('jobs', {
  level: MorConfig.LOG_LEVEL || 'info',
  defaultMeta: { service: 'jobs' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      level: MorConfig.LOG_LEVEL || 'info',
      filename: './logs/jobs_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d'
    }),
    new winston.transports.Console({
      level: MorConfig.LOG_LEVEL || 'info'
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: './logs/exception.log'
    })
  ]
})
