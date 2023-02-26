import '../../controller/utils/Loggers.js'
import * as winston from 'winston'
import MorFacade from '../../controller/MorFacade.js'
import Mods from '../../controller/utils/Mods.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'
const logger = winston.loggers.get('jobs')

/**
 * Takes every score in the MOR sheet and removes duplicates; there are instances in
 * which the same score is submitted twice but with different IDs
 */
export default async function removeDuplicates () {
  const startTimeMs = new Date(Date.now()).getTime()
  logger.info('removeDuplicates job initiated; removing duplicate scores... This may take a while!')

  const mor = await MorFacade.build()
  let numRemoved = 0

  const modStrings = Mods.validModStrings()
  for (const mods of modStrings) {
    logger.info(`Retrieving scores from the ${mods} sheet...`)
    const scores = await mor.getSheetScores(mods)
    for (let i = 0; i < scores.length - 1; i++) {
      const a = scores[i]
      const b = scores[i + 1]

      // If everything is the same except score ID
      if ((a.scoreId !== b.scoreId) &&
                (a.userId === b.userId) &&
                (a.username === b.username) &&
                (a.beatmap === b.beatmap) &&
                (a.mods === b.mods) &&
                (a.accuracy === b.accuracy) &&
                (a.pp === b.pp) &&
                (a.starRating === b.starRating) &&
                (a.date === b.date) &&
                (a.beatmapImgLink === b.beatmapImgLink)) {
        // Remove scores if osu!API can't find them
        logger.info(`Found duplicate scores with IDs ${a.scoreId} and ${b.scoreId}, removing...`)
        try { await mor.getOsuScore(a.scoreId) } catch (error) { if (error instanceof NotFoundError) scores.splice(i, 1) }
        try { await mor.getOsuScore(b.scoreId) } catch (error) { if (error instanceof NotFoundError) scores.splice(i + 1, 1) }
        numRemoved = numRemoved + 1
      }
    }

    await mor.replaceSheetScores(mods, scores)
  }

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 60000
  logger.info(`removeDuplicates completed! Found and removed ${numRemoved} duplicate plays. Duration=${durationMin.toFixed(2)}min`)
}
