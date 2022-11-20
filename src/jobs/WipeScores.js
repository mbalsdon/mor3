import Mods from '../controller/Mods.js'
import MorConfig from '../controller/MorConfig.js'
import MorFacade from '../controller/MorFacade.js'
import MorUtils from '../controller/MorUtils.js'

/**
 * Deletes all scores in the MOR3 spreadsheet.
 *
 * Should only be run for testing purposes
 * WARNING: This script deletes all scores! Make sure you have a backup.
 */
export default async function wipeScores () {
  console.time('::wipeScores () >> Time elapsed') // TODO: replace
  console.info('::wipeScores () >> Deleting all scores...') // TODO: replace
  const mor = await MorFacade.build()
  for (const mods of Mods.validModStrings()) {
    console.info(`::wipeScores () >> Deleting ${mods} scores...`) // TODO: replace
    await mor.wipeSheet(mods)
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  }
  const dateString = new Date(Date.now()).toISOString()
  console.info(`::wipeScores () >> Job completed at ${dateString}`) // TODO: replace
  console.timeEnd('::wipeScores () >> Time elapsed') // TODO: replace
}
