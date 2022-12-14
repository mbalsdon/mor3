import MorFacade from '../../controller/MorFacade.js'

import scrapeTopPlays from './ScrapeTopPlays.js'
import updateUsers from './UpdateUsers.js'

import '../../controller/utils/Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

/**
 * Runs cron/scheduled MOR job scripts,
 * then sets the Last Updated tag on the MOR sheet.
 *
 * This is what you should run if you want to update the MOR spreadsheet.
 */
export default async function runScheduledJobs () {
  const startTimeMs = new Date(Date.now()).getTime()
  logger.info('runScheduledJobs initiated; running scheduled tasks... This may take a while!')

  // Ordering matters; scrapeTopPlays should come before updateUsers
  await scrapeTopPlays()
  await updateUsers()

  logger.info('Scheduled tasks completed! Updating the "last updated" tag on the sheet...')

  const mor = await MorFacade.build()
  let dateString = new Date(Date.now()).toISOString()
  dateString = dateString.slice(0, dateString.length - 5) + '+00:00'
  await mor.setSheetLastUpdated(dateString)

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 60000
  logger.info(`runScheduledJobs completed! Duration=${durationMin.toFixed(2)}min`)
}
