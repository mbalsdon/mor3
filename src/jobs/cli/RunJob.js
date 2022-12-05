import createBackup from '../CreateBackup.js'
import runScheduledJobs from '../RunScheduledJobs.js'
import scrapeTopPlays from '../ScrapeTopPlays.js'
import updateScores from '../UpdateScores.js'
import updateUsers from '../UpdateUsers.js'
import wipeScores from '../WipeScores.js'

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
