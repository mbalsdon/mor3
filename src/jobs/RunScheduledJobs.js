import scrapeTopPlays from './ScrapeTopPlays.js'
import updateUsers from './UpdateUsers.js'
import calcModTopLBPlays from './CalcModTopLBPlays.js'
import DriveWrapper from '../controller/DriveWrapper.js'
import SheetsWrapper from '../controller/SheetsWrapper.js'
import * as fs from 'fs'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

export default async function runScheduledJobs () {
  console.time('::runScheduledJobs() >> time elapsed')
  console.info('::runScheduledJobs() >> Running scheduled tasks... This may take a while')

  // Ordering matters; scrapeTopPlays should come before updateUsers/calcTopModLBPlays
  await scrapeTopPlays()
  await updateUsers()
  await calcModTopLBPlays()

  // Archive the spreadsheet & update the "last updated" tag
  const sheets = await SheetsWrapper.build()
  const drive = await DriveWrapper.build()
  const dateString = new Date(Date.now()).toISOString()
  const metadata = await sheets.fetchMetadata()
  await drive.copyFile(config.SPREADSHEETS.SPREADSHEET_ID, `${metadata.properties.title} ${dateString}`)
  await sheets.insertLastUpdated(dateString)

  console.info(`::runScheduledJobs() >> job completed at ${dateString}`)
  console.timeEnd('::runScheduledJobs() >> time elapsed')
}
