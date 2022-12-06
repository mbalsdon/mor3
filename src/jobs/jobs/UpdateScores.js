import Mods from '../../controller/utils/Mods.js'
import MorConfig from '../../controller/utils/MorConfig.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'
import MorScore from '../../controller/utils/MorScore.js'

import MorFacade from '../../controller/MorFacade.js'

import * as fs from 'fs'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

/**
 * Takes every score in the MOR sheet and refreshes their data.
 *
 * Mainly used after PP reworks; takes a VERY long time -
 * Suggested that you turn off the bot and any scheduled jobs before running this.
 */
export default async function updateScores () {
  const startTimeMs = new Date(Date.now()).getTime()
  logger.info('updateScores job initiated; updating every score in the sheet... This will take a really long time!')

  const mor = await MorFacade.build()

  logger.info('Creating cache (if it doesn\'t exist...')
  if (!fs.existsSync(MorConfig.JOBS_CACHE)) fs.mkdirSync(MorConfig.JOBS_CACHE)
  if (!fs.existsSync(MorConfig.UPDATE_SCORES_CACHE)) fs.writeFileSync(MorConfig.UPDATE_SCORES_CACHE, JSON.stringify({ currentModSheet: Mods.SUBMITTED, scores: [] }))

  logger.info('Reading from cache...')
  const saveData = JSON.parse(fs.readFileSync(MorConfig.UPDATE_SCORES_CACHE))

  // Remove modsheets that have already been updated
  const currentModSheet = saveData.currentModSheet
  const modStrings = Mods.validModStrings().filter(m => (m !== Mods.COMBINED))
  for (const mods of [...modStrings]) {
    if (mods === currentModSheet) break
    else modStrings.shift()
  }

  // Key: mods; Value: score IDs
  const dict = {}
  for (const mods of modStrings) {
    const cache = { currentModSheet: mods, scores: [] }

    dict[mods] = await mor.getSheetScoreIds(mods)

    // Decide which score to start at and populate cache with already-updated scores
    let index = 0
    if (mods === currentModSheet) {
      cache.scores = saveData.scores
      const finishedScoreIds = saveData.scores.map(s => s.scoreId)

      if (finishedScoreIds.length !== 0) {
        const lastFinishedScoreId = finishedScoreIds[finishedScoreIds.length - 1]
        index = dict[mods].indexOf(lastFinishedScoreId) + 1
      }
    }

    logger.info(`Updating ${mods} scores and adding them to the cache...`)
    for (let i = index; i < dict[mods].length; i++) {
      try {
        logger.info(`Grabbing osu!API data for score ${dict[mods][i]} and adding it to the cache...`)
        const score = await mor.getOsuScore(dict[mods][i])
        cache.scores.push(score)
        fs.writeFileSync(MorConfig.UPDATE_SCORES_CACHE, JSON.stringify(cache))
      } catch (error) {
        if (error instanceof NotFoundError) {
          logger.warn(`Couldn't find score ${dict[mods][i]}, skipping...`)
          continue
        } else throw error
      }
    }

    logger.info(`Finished caching ${mods} scores! Retrieving them from the cache and updating the ${mods} sheet...`)
    const updatedCache = JSON.parse(fs.readFileSync(MorConfig.UPDATE_SCORES_CACHE))
    const updatedScores = updatedCache.scores.map(s => {
      return new MorScore([s.scoreId, s.userId, s.username, s.beatmap, s.mods, s.accuracy, s.pp, s.starRating, s.date, s.beatmapImgLink])
    })

    if (mods !== Mods.SUBMITTED) updatedScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })

    if (updatedScores.length === 0) await mor.wipeSheet(mods)
    else await mor.replaceSheetScores(mods, updatedScores)

    logger.info('Resetting the cache...')
    fs.writeFileSync(MorConfig.UPDATE_SCORES_CACHE, JSON.stringify({ currentModSheet: Mods.SUBMITTED, scores: [] }))
  }

  logger.info(`Updating the ${Mods.COMBINED} sheet...`)
  let combinedScores = []
  for (const mods of Mods.validModStrings()) {
    if (mods === Mods.COMBINED) continue
    const scores = await mor.getSheetScores(mods)
    combinedScores = combinedScores.concat(scores)
  }

  // Remove duplicate scores
  const seen = {}
  combinedScores = combinedScores.filter(i => {
    const k = i.scoreId
    return Object.prototype.hasOwnProperty.call(seen, k) ? false : (seen[k] = true)
  })

  combinedScores.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
  await mor.replaceSheetScores(Mods.COMBINED, combinedScores)

  let dateString = new Date(Date.now()).toISOString()
  dateString = dateString.slice(0, dateString.length - 5) + '+00:00'
  await mor.setSheetLastUpdated(dateString)

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 6000
  logger.info(`updateScores completed! Duration=${durationMin.toFixed(2)}min`)
}
