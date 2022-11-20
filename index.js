import Bot from './src/client/Bot.js'
import runScheduledJobs from './src/jobs/RunScheduledJobs.js'
import * as cron from 'node-cron'

await Bot.startBot()
cron.schedule('0 */4 * * *', runScheduledJobs)
