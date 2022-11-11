import scrapeTopPlays from '../ScrapeTopPlays.js'
import updateUsers from '../UpdateUsers.js'
import calcModTopLBPlays from '../CalcModTopLBPlays.js'
import runScheduledJobs from '../RunScheduledJobs.js'
import updateScores from '../UpdateScores.js'
import wipeScores from '../WipeScores.js'

/*
 * Basic command handler script for MOR jobs
 * Example:
 * $ node src/jobs/cli/JobHandler.js updateScores
*/

const commands = {
  /* Should only be run individually for testing purposes */
  updateUsers,

  /* Should only be run individually for testing purposes */
  scrapeTopPlays,

  /* Mainly used after PP reworks; takes a VERY long time
     Suggested that you turn off the bot and any scheduled jobs before running this */
  updateScores,

  /* Should only be run individually for testing purposes */
  calcModTopLBPlays,

  /* This is what you should run if you want to update the sheets */
  runScheduledJobs,

  /* Should only be run for testing purposes
     WARNING: This script deletes all the scores in the spreadsheets */
  wipeScores
}

const args = process.argv.slice(2)
console.info(`::JobHandler.js (${args})`) // TODO: replace

if (args.length !== 1) throw new Error(`${args} is not a valid input! Valid jobs: ${Object.keys(commands)}`)

let success = 0
for (let i = 0; i < Object.keys(commands).length; i++) {
  if (args[0] === Object.keys(commands)[i]) {
    await Object.values(commands)[i]()
    success = 1
  }
}

if (success === 0) throw new Error(`${args} is not a valid input! Valid jobs: ${Object.keys(commands)}`)
