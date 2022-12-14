import createBackup from './jobs/CreateBackup.js'
import runScheduledJobs from './jobs/RunScheduledJobs.js'
import scrapeTopPlays from './jobs/ScrapeTopPlays.js'
import updateScores from './jobs/UpdateScores.js'
import updateUsers from './jobs/UpdateUsers.js'
import wipeScores from './jobs/WipeScores.js'

import '../controller/utils/Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

/*
 * Basic command handler script for MOR jobs
 * Example:
 * $ node src/jobs/cli/RunJob.js updateScores
 */

const commands = {
  createBackup,
  runScheduledJobs,
  scrapeTopPlays,
  updateScores,
  updateUsers,
  wipeScores
}

commands.help = () => {
  console.info('\nList of currently supported jobs:\n\n' +
                'createBackup: Create a backup file for the MOR spreadsheet and put it in Google Drive\n' +
                'runScheduledJobs: Run scheduled MOR job scripts, then set the Last Updated tag\n' +
                'scrapeTopPlays: Retrieve submitted scores and the top 100s + firsts + recents of tracked users and insert them into the MOR3 spreadsheet\n' +
                'updateScores: Refresh score data (mainly used after PP reworks - takes a very long time!)\n' +
                'updateUsers: Refresh user data\n' +
                'wipeScores: Delete all scores in the MOR3 spreadsheet\n'
  )
}

const args = process.argv.slice(2)
logger.info(`Manual call to ${args} job, executing...`)

if (args.length !== 1) throw new Error(`${args} is not a valid input! Valid jobs: ${Object.keys(commands)}`)

let success = 0
for (let i = 0; i < Object.keys(commands).length; i++) {
  if (args[0] === Object.keys(commands)[i]) {
    await Object.values(commands)[i]()
    success = 1
  }
}

if (success === 0) throw new Error(`${args} is not a valid input! Valid jobs: ${Object.keys(commands)}`)
