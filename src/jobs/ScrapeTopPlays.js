import Mods from '../controller/Mods.js'
import MorFacade from '../controller/MorFacade.js'
import Utils from '../controller/Utils.js'

/**
 * Takes submitted scores and the top 100s and firsts of every user in the MOR sheet and
 * inserts them into their respective MOR mod sheets
 * 
 * Should only be run individually for testing purposes -
 * Use runScheduledJobs() instead!
 * @see {@link RunScheduledJobs}
 */
export default async function scrapeTopPlays () {
  // TODO: doc
  const populateDict = function (dict, scores) {
    console.info(`::scrapeTopPlays >> populateDict (dict, array of ${scores.length} scores)`) // TODO: replace
    for (const s of scores) {
      const key = s.mods
      if (Object.keys(dict).includes(key)) dict[key].push(s)
      else dict[key] = [s]
    }
  }

  console.time('::scrapeTopPlays () >> Time elapsed') // TODO: replace
  console.info('::scrapeTopPlays () >> Scraping user top 100s and #1s... This may take a while!') // TODO: replace
  const mor = await MorFacade.build()
  console.info('::scrapeTopPlays () >> Getting user IDs of tracked players...') // TODO: replace
  const userIds = await mor.getSheetUserIds()
  await Utils.sleep(1000)
  console.info(`::scrapeTopPlays () >> Grabbing tops/firsts from ${userIds.length} users...`) // TODO: replace
  // Key: mods; Value: score array (sorted by pp)
  const dict = {}
  for (const userId of userIds) {
    const userTops = await mor.getOsuUserScores(userId, 'best')
    await Utils.sleep(1000)
    const userFirsts = await mor.getOsuUserScores(userId, 'firsts')
    await Utils.sleep(1000)
    populateDict(dict, userTops.concat(userFirsts))
  }
  console.info('::scrapeTopPlays () >> Retrieving submitted scores...') // TODO: replace
  const submittedScores = await mor.getSheetScores(Mods.SS)
  await Utils.sleep(1000)
  populateDict(dict, submittedScores)
  console.info('::scrapeTopPlays () >> Collecting data from the sheet and inserting any new scores...') // TODO: replace
  let numInserted = 0
  for (const key of Object.keys(dict)) {
    const sheetScores = await mor.getSheetScores(key)
    await Utils.sleep(1000)
    for (const dictScore of dict[key]) {
      // Check if score already in sheetScores, insert if not
      if (!sheetScores.some(s => s.scoreId === dictScore.scoreId)) {
        sheetScores.push(dictScore)
        numInserted++
      }
    }
    console.info(`::scrapeTopPlays () >> Updating the ${key} sheet...`) // TODO: replace
    sheetScores.sort((a, b) => { return parseInt(b.pp) - parseInt(a.pp) })
    await mor.replaceSheetScores(key, sheetScores)
    await Utils.sleep(2000)
  }
  const dateString = new Date(Date.now()).toISOString()
  console.info(`::scrapeTopPlays () >> Job completed at ${dateString}, inserted ${numInserted} new plays.`) // TODO: replace
  console.timeEnd('::scrapeTopPlays () >> Time elapsed') // TODO: replace
}
