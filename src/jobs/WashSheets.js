import SheetsWrapper from '../controller/SheetsWrapper.js'

export default async function washSheets () {
  console.time('::washSheets() >> time elapsed')
  console.info('::washSheets() >> Refreshing the entire sheet... This will take a very long time')

  const sheets = await SheetsWrapper.build()

  console.info('THIS FUNCTION IS NOT IMPLEMENTED YET!')

  const dateString = new Date(Date.now()).toISOString()
  await sheets.lastUpdated(dateString)

  console.info(`::washSheets() >> job completed at ${dateString}`)
  console.timeEnd('::washSheets() >> time elapsed')
}
