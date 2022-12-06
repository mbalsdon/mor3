import Mods from '../../controller/utils/Mods.js'
import MorConfig from '../../controller/utils/MorConfig.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'

import MorFacade from '../../controller/MorFacade.js'

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
  console.info('::scrapeTopPlays () >> Scraping user tops, firsts, and recents... This may take a while!') // TODO: replace

  const mor = await MorFacade.build()

  console.info('::scrapeTopPlays () >> Getting user IDs of tracked players...') // TODO: replace
  const users = await mor.getSheetUsers()

  console.info(`::scrapeTopPlays () >> Grabbing tops/firsts/recents from ${users.length} users...`) // TODO: replace
  // Key: mods; Value: MorScore array
  const dict = {}
  for (const user of users) {
    if (user.autotrack === 'FALSE') {
      console.info(`::scrapeTopPlays () >> Tracking for ${user.username} is ${user.autotrack}, skipping...`) // TODO: replace
      continue
    }

    try {
      console.info(`::scrapeTopPlays() >> Grabbing tops/firsts/recents for user ${user.username}...`) // TODO: replace
      const userTops = await mor.getOsuUserScores(user.userId, 'best')
      const userFirsts = await mor.getOsuUserScores(user.userId, 'firsts')
      const userRecents = await mor.getOsuUserScores(user.userId, 'recent')

      populateDict(dict, userTops.concat(userFirsts).concat(userRecents))
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.info(`::scrapeTopPlays () >> Couldn't find user ${user.username}, skipping...`) // TODO: replace
        continue
      }
    }
  }

  console.info('::scrapeTopPlays () >> Retrieving submitted scores...') // TODO: replace
  const submittedScores = await mor.getSheetScores(Mods.SUBMITTED)
  populateDict(dict, submittedScores)

  console.info('::scrapeTopPlays () >> Collecting data from the sheet and inserting any new scores...') // TODO: replace
  let numInserted = 0
  let combinedScores = []
  for (const key of Object.keys(dict)) {
    const sheetScores = await mor.getSheetScores(key)

    for (const dictScore of dict[key]) {
      // Check if score already in sheetScores, insert if not
      if (!sheetScores.some(s => s.scoreId === dictScore.scoreId)) {
        sheetScores.push(dictScore)
        numInserted++
      }
    }

    console.info(`::scrapeTopPlays () >> Updating the ${key} sheet...`) // TODO: replace
    sheetScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
    await mor.replaceSheetScores(key, sheetScores)

    combinedScores = combinedScores.concat(sheetScores)
  }

  console.info(`::scrapeTopPlays () >> Updating the ${MorConfig.SHEETS.COMBINED.NAME} sheet...`) // TODO: replace
  combinedScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
  await mor.replaceSheetScores(Mods.COMBINED, combinedScores)

  const dateString = new Date(Date.now()).toISOString()
  console.info(`::scrapeTopPlays () >> Job completed at ${dateString}, inserted ${numInserted} new plays.`) // TODO: replace
  console.timeEnd('::scrapeTopPlays () >> Time elapsed') // TODO: replace
}