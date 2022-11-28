import Mods from '../controller/Mods.js'
import MorConfig from '../controller/MorConfig.js'
import { NotFoundError } from '../controller/MorErrors.js'
import MorFacade from '../controller/MorFacade.js'
import MorUser from '../controller/MorUser.js'
import MorUtils from '../controller/MorUtils.js'

/**
 * Takes every user in the MOR sheet and refreshes their stats.
 *
 * Should only be run individually for testing purposes -
 * Use runScheduledJobs() instead!
 * @see {@link RunScheduledJobs}
 */
export default async function updateUsers () {
  console.time('::updateUsers () >> Time elapsed') // TODO: replace
  console.info('::updateUsers () >> Updating user rank and PP data... This may take a while') // TODO: replace
  const mor = await MorFacade.build()
  // Key: mods; Value: array of 25 highest pp plays
  const dict = {}
  console.info('::updateUsers () >> Grabbing score data from sheets...') // TODO: replace
  for (const mods of Mods.validModStrings()) {
    if (mods === Mods.SS) continue
    dict[mods] = await mor.getSheetScores(mods)
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  }
  console.info('::updateUsers () >> Retrieving user IDs from sheet...') // TODO: replace
  const userIds = await mor.getSheetUserIds()
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  console.info(`::updateUsers () >> Refreshing data for ${userIds.length} users...`) // TODO: replace
  const updatedUsers = []
  for (const userId of userIds) {
    let user
    console.info(`::updateUsers () >> Grabbing osu!API data for user ${userId}...`) // TODO: replace
    try { user = await mor.getOsuUser(userId, 'id') } catch (error) {
      if (error instanceof NotFoundError) {
        console.info(`::updateUsers () >> Couldn't find user ${userId}, skipping...`) // TODO: replace
        continue
      } else throw error
    }
    await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
    console.info(`::updateUsers () >> Counting top25s for user ${userId}...`) // TODO: replace
    let [top1s, top2s, top3s, top5s, top10s, top25s] = [0, 0, 0, 0, 0, 0]
    for (const key of Object.keys(dict)) {
      const scores = dict[key]
      const len = (scores.length < 25) ? scores.length : 25
      for (let i = 0; i < len; i++) {
        if (userId !== scores[i].userId) continue
        else if (i === 0) top1s++
        else if (i === 1) top2s++
        else if (i === 2) top3s++
        else if (i === 3 || i === 4) top5s++
        else if (i >= 5 && i < 10) top10s++
        else if (i >= 10 && i < 25) top25s++
        else throw new RangeError(`i = ${i} - This should never happen!`)
      }
    }
    updatedUsers.push(new MorUser([
      user.userId,
      user.username,
      user.playstyle,
      user.globalRank,
      user.countryRank,
      user.pp,
      user.accuracy,
      user.playtime,
      top1s.toString(),
      top2s.toString(),
      top3s.toString(),
      top5s.toString(),
      top10s.toString(),
      top25s.toString(),
      user.pfpLink,
      user.tracking
    ]))
  }
  console.info('::updateUsers () >> Updating the sheet...') // TODO: replace
  updatedUsers.sort((a, b) => { return parseInt(b.pp) - parseInt(a.pp) })
  await mor.replaceSheetUsers(updatedUsers)
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 9)
  const dateString = new Date(Date.now()).toISOString()
  console.info(`::updateUsers () >> Job completed at ${dateString}, updated ${updatedUsers.length} users`) // TODO: replace
  console.timeEnd('::updateUsers () >> Time elapsed') // TODO: replace
}
