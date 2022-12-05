import createBackup from './jobs/CreateBackup.js'
import runScheduledJobs from './jobs/RunScheduledJobs.js'
import scrapeTopPlays from './jobs/ScrapeTopPlays.js'
import updateScores from './jobs/UpdateScores.js'
import updateUsers from './jobs/UpdateUsers.js'
import wipeScores from './jobs/WipeScores.js'

/*
 * Basic command handler script for MOR jobs
 * Example:
 * $ node src/jobs/cli/RunJob.js updateScores
 */

const commands = {
  updateUsers,
  scrapeTopPlays,
  updateScores,
  runScheduledJobs,
  wipeScores,
  createBackup
}

const args = process.argv.slice(2)
console.info(`::RunJob.js (${args})`) // TODO: replace

if (args.length !== 1) throw new Error(`${args} is not a valid input! Valid jobs: ${Object.keys(commands)}`)

let success = 0
for (let i = 0; i < Object.keys(commands).length; i++) {
  if (args[0] === Object.keys(commands)[i]) {
    await Object.values(commands)[i]()
    success = 1
  }
}

if (success === 0) throw new Error(`${args} is not a valid input! Valid jobs: ${Object.keys(commands)}`)
