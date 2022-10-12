import SheetsWrapper from '../controller/SheetsWrapper.js'

export default async function calcModTopLBPlays () {
  console.time('::calcModTopLBPlays() >> time elapsed')
  console.info('::calcModTopLBPlays() >> Determining users\' best plays... This may take a while')

  const sheets = await SheetsWrapper.build()

  console.info('THIS FUNCTION IS NOT IMPLEMENTED YET!')

  const dateString = new Date(Date.now()).toISOString()
  await sheets.lastUpdated(dateString)

  console.info(`::scrapeTopPlays() >> job completed at ${dateString}`)
  console.timeEnd('::calcModTopLBPlays() >> time elapsed')
}
