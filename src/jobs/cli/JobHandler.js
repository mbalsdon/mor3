import scrapeTopPlays from '../ScrapeTopPlays.js'
import updateUsers from '../UpdateUsers.js'
import updateModSheets from '../UpdatedModSheets.js'
import calcModTopLBPlays from '../CalcModTopLBPlays.js'
import runScheduledJobs from '../RunScheduledJobs.js'

const args = process.argv.slice(2)
console.info(`::JobHandler.js( ${args} )`)

// Should only be run for testing purposes
if (args[0] === 'updateUsers') {
  await updateUsers()

// Should only be run for testing purposes
} else if (args[0] === 'scrapeTopPlays') {
  await scrapeTopPlays()

// Should only be run for testing purposes
} else if (args[0] === 'calcTopModLBPlays') {
  await calcModTopLBPlays()

// Used mainly for PP reworks; takes a very long time
// Suggested that you turn off the bot and any scheduled tasks before running this
} else if (args[0] === 'updateModSheets') {
  await updateModSheets() // TODO: save/load input?

// This is what you should run if you want to update the sheets
} else if (args[0] === 'runScheduledJobs') {
  await runScheduledJobs()
} else {
  // TODO: enumerate commands
  console.log(`${args[0]} is not a valid input!`)
  console.log('Valid jobs: updateUsers, scrapeTopPlays, calcTopModLBPlays, updateModSheets, runScheduledJobs')
}
