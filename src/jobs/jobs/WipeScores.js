import Mods from '../../controller/utils/Mods.js'
import MorConfig from '../../controller/utils/MorConfig.js'
import MorUtils from '../../controller/utils/MorUtils.js'

import MorFacade from '../../controller/MorFacade.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

/**
 * Deletes all scores in the MOR3 spreadsheet.
 *
 * Should only be run for testing purposes -
 * WARNING: This script deletes all scores! Make sure you have a backup.
 */
export default async function wipeScores () {
  const startTimeMs = new Date(Date.now()).getTime()
  logger.info(`wipeScores job initiated; deleting all scores in the ${MorConfig.SHEETS.SPREADSHEET.NAME} sheet... Make sure you have a backup!`)

  const sleepTimeMs = 10000
  logger.warn(`Waiting ${sleepTimeMs / 1000}s before beginning... Exit now if you didn't mean to run this!`)
  await MorUtils.sleep(sleepTimeMs)

  const mor = await MorFacade.build()

  for (const mods of Mods.validModStrings()) {
    logger.info(`Deleting ${mods} scores...`)
    await mor.wipeSheet(mods)
  }

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 6000
  logger.info(`wipeScores completed! Duration=${durationMin.toFixed(2)}min`)
}
