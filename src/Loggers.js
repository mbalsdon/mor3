import * as winston from 'winston'
import 'winston-daily-rotate-file'

winston.loggers.add('bot', {
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'bot' },
  transports: [
    new winston.transports.DailyRotateFile({ 
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.simple(),
      filename: './logs/bot_%DATE%.log', 
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d'
    }),
    new winston.transports.Console({ 
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.simple()
    })
  ]
})

winston.loggers.add('jobs', {
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'jobs' },
  transports: [
    new winston.transports.DailyRotateFile({ 
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.simple(),
      filename: './logs/jobs_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d' 
    }),
    new winston.transports.Console({ 
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.simple()
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'exception.log' 
    })
  ]
})
