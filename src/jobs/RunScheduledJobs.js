import MorConfig from '../controller/MorConfig.js'
import MorFacade from '../controller/MorFacade.js'
import MorUtils from '../controller/MorUtils.js'

import calcModTopLBPlays from './CalcModTopLBPlays.js'
import scrapeTopPlays from './ScrapeTopPlays.js'
import updateUsers from './UpdateUsers.js'

/**
 * Runs cron/scheduled MOR job scripts,
 * sets the Last Updated tag on the MOR sheet,
 * then creates a backup file.
 *
 * This is what you should run if you want to update the MOR spreadsheet.
 */
export default async function runScheduledJobs () {
  console.time('::runScheduledJobs () >> Time elapsed') // TODO: replace
  console.info('::runScheduledJobs () >> Running scheduled tasks... This may take a while') // TODO: replace
  // Ordering matters; scrapeTopPlays should come before updateUsers/calcTopModLBPlays
  console.info('::runScheduledJobs () >> Running the scrapeTopPlays script...') // TODO: replace
  await scrapeTopPlays()
  console.info('::runScheduledJobs () >> Running the updateUsers script...') // TODO: replace
  await updateUsers()
  console.info('::runScheduledJobs () >> Running the calcModTopLBPlays script...') // TODO: replace
  await calcModTopLBPlays()
  console.info('::runScheduledJobs () >> Archiving the spreadsheet and updating the "last updated" tag...') // TODO: replace
  const mor = await MorFacade.build()
  let dateString = new Date(Date.now()).toISOString()
  dateString = dateString.slice(0, dateString.length - 5) + '+00:00'
  await mor.setSheetLastUpdated(dateString)
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  console.info(`::runScheduledJobs () >> Job completed at ${dateString}`) // TODO: replace
  console.timeEnd('::runScheduledJobs () >> Time elapsed') // TODO: replace
}
