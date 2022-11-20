import Mods from '../controller/Mods.js'
import MorConfig from '../controller/MorConfig.js'
import MorFacade from '../controller/MorFacade.js'
import MorUtils from '../controller/MorUtils.js'

/**
 * Takes submitted scores and the top 100s and firsts of every user in the MOR sheet and
 * inserts them into their respective MOR mod sheets
 *
 * Should only be run individually for testing purposes -
 * Use runScheduledJobs() instead!
 * @see {@link RunScheduledJobs}
 */
export default async function scrapeTopPlays () {
  /**
   * Populates a dictionary with given array of MorScores -
   * Key: mods; Value: MorScore array
   * @param {{}} dict
   * @param {MorScore[]} scores
   */
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
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS)
  console.info(`::scrapeTopPlays () >> Grabbing tops/firsts from ${userIds.length} users...`) // TODO: replace
  // Key: mods; Value: MorScore array
  const dict = {}
  for (const userId of userIds) {
    const userTops = await mor.getOsuUserScores(userId, 'best')
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS)
    const userFirsts = await mor.getOsuUserScores(userId, 'firsts')
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS)
    populateDict(dict, userTops.concat(userFirsts))
  }
  console.info('::scrapeTopPlays () >> Retrieving submitted scores...') // TODO: replace
  const submittedScores = await mor.getSheetScores(Mods.SS)
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS)
  populateDict(dict, submittedScores)
  console.info('::scrapeTopPlays () >> Collecting data from the sheet and inserting any new scores...') // TODO: replace
  let numInserted = 0
  for (const key of Object.keys(dict)) {
    const sheetScores = await mor.getSheetScores(key)
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS)
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
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  }
  const dateString = new Date(Date.now()).toISOString()
  console.info(`::scrapeTopPlays () >> Job completed at ${dateString}, inserted ${numInserted} new plays.`) // TODO: replace
  console.timeEnd('::scrapeTopPlays () >> Time elapsed') // TODO: replace
}
