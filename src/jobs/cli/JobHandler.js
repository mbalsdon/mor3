import scrapeTopPlays from '../ScrapeTopPlays.js'
import updateUsers from '../UpdateUsers.js'
import washSheets from '../WashSheets.js'
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
} else if (args[0] === 'washSheets') {
  await washSheets()

// This is what you should run if you want to update the sheets
} else if (args[0] === 'runScheduledJobs') {
  await runScheduledJobs()
} else {
  // TODO: enumerate commands
  console.log(`${args[0]} is not a valid input!`)
  console.log('Valid jobs: updateUsers, scrapeTopPlays, calcTopModLBPlays, washSheets, runScheduledJobs')
}
