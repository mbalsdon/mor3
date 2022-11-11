import MorFacade from '../controller/MorFacade.js'
import * as fs from 'fs'
import Config from '../controller/Config.js'
import Mods from '../controller/Mods.js'
import Utils from '../controller/Utils.js'
import { NotFoundError } from '../controller/Errors.js'
import Score from '../controller/Score.js'

/**
 * Takes every score in the MOR sheet and refreshes their data.
 * 
 * Mainly used after PP reworks; takes a VERY long time -
 * Suggested that you turn off the bot and any scheduled jobs before running this.
 */
export default async function updateScores () {
  console.time('::updateScores () >> Time elapsed') // TODO: replace
  console.info('::updateScores () >> Refreshing the entire sheet... This will take a very long time!') // TODO: replace
  const mor = await MorFacade.build()
  console.info('::updateScores () >> Creating cache (if it doesn\'t exist)...') // TODO: replace
  if (!fs.existsSync(Config.JOBS_CACHE)) fs.mkdirSync(Config.JOBS_CACHE)
  if (!fs.existsSync(Config.UPDATE_SCORES_CACHE)) fs.writeFileSync(Config.UPDATE_SCORES_CACHE, JSON.stringify({ currentModSheet: Mods.SS, scores: [] }))
  console.info('::updateScores () >> Reading cache...') // TODO: replace
  const saveData = JSON.parse(fs.readFileSync(Config.UPDATE_SCORES_CACHE))
  // Remove modsheets that have already been updated
  const currentModSheet = saveData.currentModSheet
  const modStrings = Mods.validModStrings()
  for (const mods of Mods.validModStrings()) {
    if (mods === currentModSheet) break
    else modStrings.shift()
  }
  // Key: mods; Value: score IDs
  const dict = {}
  for (const mods of modStrings) {
    const cache = { currentModSheet: mods, scores: [] }
    dict[mods] = await mor.getSheetScoreIds(mods)
    await Utils.sleep(1000)
    // Decide which score to start at
    let index = 0
    if (mods === currentModSheet) {
      const finishedScoreIds = saveData.scores.map(s => s.scoreId)
      if (finishedScoreIds.length !== 0) {
        const lastFinishedScoreId = finishedScoreIds[finishedScoreIds.length - 1]
        index = dict[mods].indexOf(lastFinishedScoreId) + 1
      }
    }
    console.info('::updateScores () >> Updating scores and adding them to the cache...') // TODO: replace
    for (let i = index; i < dict[mods].length; i++) {
      try {
        const score = await mor.getOsuScore(dict[mods][i])
        await Utils.sleep(1000)
        cache.scores.push(score)
        fs.writeFileSync(Config.UPDATE_SCORES_CACHE, JSON.stringify(cache))
      } catch (error) {
        if (error instanceof NotFoundError) {
          console.info(`::updateScores () >> Couldn't find score ${dict[mods][i]}, skipping...`) // TODO: replace
          continue
        } else throw error
      }
    }
    console.info('::updateScores () >> Grabbing updated scores from cache...') // TODO: replace
    const updatedCache = JSON.parse(fs.readFileSync(Config.UPDATE_SCORES_CACHE))
    const updatedScores = updatedCache.scores.map(s => {
      return new Score(s.scoreId, s.userId, s.username, s.beatmap, s.mods, s.accuracy, s.pp, s.starRating, s.date, s.beatmapImgLink)
    })
    if (mods !== Mods.SS) updatedScores.sort((a, b) => { return parseInt(b.pp) - parseInt(a.pp) })
    console.info('::updateScores() >> Updating sheet and resetting cache...') // TODO: replace
    if (updatedScores.length === 0) await mor.wipeSheet(mods)
    else await mor.replaceSheetScores(mods, updatedScores)
    await Utils.sleep(2000)
    fs.writeFileSync(Config.UPDATE_SCORES_CACHE, JSON.stringify({ currentModSheet: Mods.SS, scores: [] }))
  }
  let dateString = new Date(Date.now()).toISOString()
  dateString = dateString.slice(0, dateString.length - 5) + '+00:00'
  await mor.setSheetLastUpdated(dateString)
  console.info(`::updateScores () >> Job completed at ${dateString}`) // TODO: replace
  console.timeEnd('::updateScores () >> Time elapsed') // TODO: replace
}
