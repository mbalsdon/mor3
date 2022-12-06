import Mods from '../../controller/utils/Mods.js'
import MorConfig from '../../controller/utils/MorConfig.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'

import MorFacade from '../../controller/MorFacade.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

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
    for (const s of scores) {
      const key = s.mods
      if (Object.keys(dict).includes(key)) dict[key].push(s)
      else dict[key] = [s]
    }
  }

  const startTimeMs = new Date(Date.now()).getTime()
  logger.info(`scrapeTopPlays job initiated; grabbing plays of tracked users... This may take a while!`)

  const mor = await MorFacade.build()

  logger.info('Retrieving tracked users from the sheet...')
  const users = await mor.getSheetUsers()

  logger.info(`Grabbing tops/firsts/recents for ${users.length} users...`)
  // Key: mods; Value: MorScore array
  const dict = {}
  for (const user of users) {
    if (user.autotrack === 'FALSE') {
      logger.warn(`Tracking for ${user.username} is ${user.autotrack}, skipping...`)
      continue
    }

    try {
      logger.info(`Retrieving tops/firsts/recents from user ${user.username}...`)
      const userTops = await mor.getOsuUserScores(user.userId, 'best')
      const userFirsts = await mor.getOsuUserScores(user.userId, 'firsts')
      const userRecents = await mor.getOsuUserScores(user.userId, 'recent')

      populateDict(dict, userTops.concat(userFirsts).concat(userRecents))
    } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(`Couldn't find user ${user.username}, skipping...`)
        continue
      }
    }
  }

  logger.info(`Retrieving scores from the ${Mods.SUBMITTED} sheet...`)
  const submittedScores = await mor.getSheetScores(Mods.SUBMITTED)
  populateDict(dict, submittedScores)

  let numInserted = 0
  let combinedScores = []
  for (const key of Object.keys(dict)) {
    logger.info(`Retrieving scores from the ${key} sheet and inserting any new additions...`)
    const sheetScores = await mor.getSheetScores(key)

    for (const dictScore of dict[key]) {
      // Check if score already in sheetScores, insert if not
      if (!sheetScores.some(s => s.scoreId === dictScore.scoreId)) {
        sheetScores.push(dictScore)
        numInserted++
      }
    }

    sheetScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
    await mor.replaceSheetScores(key, sheetScores)

    combinedScores = combinedScores.concat(sheetScores)
  }

  logger.info(`Updating the ${Mods.COMBINED} sheet...`)
  combinedScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
  await mor.replaceSheetScores(Mods.COMBINED, combinedScores)

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 6000
  logger.info(`scrapeTopPlays completed! Duration=${durationMin.toFixed(2)}min`)
}
