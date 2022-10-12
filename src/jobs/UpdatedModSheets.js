import SheetsWrapper from '../controller/SheetsWrapper.js'

export default async function updateModSheets () {
  console.time('::updateModSheets() >> time elapsed')
  console.info('::updateModSheets() >> Refreshing the entire sheet... This will take a very long time')

  const sheets = await SheetsWrapper.build()

  console.info('THIS FUNCTION IS NOT IMPLEMENTED YET!') // TODO: remove

  //  for each modsheet
  //    check if there's a json file?
  //    take last ID of json file and do a search on the sheet?
  //    batch grab every score ID (from the last ID?)
  //    for each score ID
  //      grab score from osu!API
  //      push score to json file?
  //    grab scores from json file?
  //    sort scores by PP
  //    update the sheet (replaceScores)
  //  endfor

  // save functionality - save current modsheet + all scores "so far" in a json file
  // test on very small sheet - 2->3 users? (need to delete all the scores again D:)

  const dateString = new Date(Date.now()).toISOString()
  await sheets.lastUpdated(dateString)

  console.info(`::updateModSheets() >> job completed at ${dateString}`)
  console.timeEnd('::updateModSheets() >> time elapsed')
}
