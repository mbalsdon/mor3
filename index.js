import Bot from './src/client/Bot.js'

import createBackup from './src/jobs/jobs/CreateBackup.js'
import runScheduledJobs from './src/jobs/jobs/RunScheduledJobs.js'
import JobHandler from './src/jobs/JobHandler.js'

// Start discord bot
const bot = await Bot.build()
await bot.start()

// Start scheduled jobs
const jobs = {
  createBackup: ['0 0 1,15 * *', createBackup],
  runScheduledJobs: ['0 0,8,16 * * *', runScheduledJobs]
}
const jobHandler = new JobHandler(jobs)
jobHandler.start()
