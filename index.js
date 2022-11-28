import Bot from './src/client/Bot.js'
import createBackup from './src/jobs/CreateBackup.js'
import runScheduledJobs from './src/jobs/RunScheduledJobs.js'
import * as cron from 'node-cron'

const bot = await Bot.build()
await bot.start()
cron.schedule('0 0 1,14 * *', createBackup)
cron.schedule('0 0,4,8,12,16,20 * * *', runScheduledJobs)
