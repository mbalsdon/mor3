import Mods from '../controller/Mods.js'
import MorFacade from '../controller/MorFacade.js'
import Utils from '../controller/Utils.js'

export default async function wipeScores () {
  console.time('::wipeScores () >> Time elapsed') // TODO: replace
  console.info('::wipeScores () >> Deleting all scores...') // TODO: replace
  const mor = await MorFacade.build()
  for (const mods of Mods.validModStrings()) {
    console.info(`::wipeScores () >> Deleting ${mods} scores...`) // TODO: replace
    await mor.wipeSheet(mods)
    await Utils.sleep(2000)
  }
  const dateString = new Date(Date.now()).toISOString()
  console.info(`::wipeScores () >> Job completed at ${dateString}`) // TODO: replace
  console.timeEnd('::wipeScores () >> Time elapsed') // TODO: replace
}
