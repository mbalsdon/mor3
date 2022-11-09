import scrapeTopPlays from './ScrapeTopPlays.js'
import updateUsers from './UpdateUsers.js'
import calcModTopLBPlays from './CalcModTopLBPlays.js'
import MorFacade from '../controller/MorFacade.js'
import Config from '../controller/Config.js'
import Utils from '../controller/Utils.js'

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
  const metadata = await mor.getSheetMetadata()
  await Utils.sleep(1000)
  await mor.copyFile(Config.SHEETS.SPREADSHEET.ID, `${metadata.properties.title} ${dateString}`)
  await Utils.sleep(1000)
  await mor.setSheetLastUpdated(dateString)
  await Utils.sleep(1000)
  console.info(`::runScheduledJobs () >> Job completed at ${dateString}`) // TODO: replace
  console.timeEnd('::runScheduledJobs () >> Time elapsed') // TODO: replace
}
