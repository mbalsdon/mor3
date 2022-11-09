import { NotFoundError } from '../controller/Errors.js'
import Mods from '../controller/Mods.js'
import MorFacade from '../controller/MorFacade.js'
import User from '../controller/User.js'
import Utils from '../controller/Utils.js'

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
    await Utils.sleep(1000)
  }
  console.info('::updateUsers () >> Retrieving user IDs from sheet...') // TODO: replace
  const userIds = await mor.getSheetUserIds()
  await Utils.sleep(1000)
  console.info(`::updateUsers () >> Refreshing data for ${userIds.length} users...`) // TODO: replace
  const updatedUsers = []
  for (const userId of userIds) {
    let user
    console.info(`::updateUsers () >> Grabbing osu!API data for user ${userId}...`) // TODO: replace
    try { user = await mor.getOsuUser(userId, 'id') } catch (error) {
      if (error instanceof NotFoundError) {
        console.info(`::updateUsers () >> Couldn't find user ${userId}, skipping...`)
        continue
      } else throw error
    }
    await Utils.sleep(1000)
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
    updatedUsers.push(new User(
      user.userId,
      user.username,
      user.globalRank,
      user.pp,
      user.accuracy,
      user.playtime,
      top1s.toString(),
      top2s.toString(),
      top3s.toString(),
      top5s.toString(),
      top10s.toString(),
      top25s.toString(),
      user.pfpLink
    ))
  }
  console.info('::updateUsers () >> Updating the sheet...') // TODO: replace
  updatedUsers.sort((a, b) => { return parseInt(b.pp) - parseInt(a.pp) })
  await mor.replaceUsers(updatedUsers)
  await Utils.sleep(2000)
  const dateString = new Date(Date.now()).toISOString()
  console.info(`::updateUsers () >> Job completed at ${dateString}, updated ${updatedUsers.length} users`) // TODO: replace
  console.timeEnd('::updateUsers () >> Time elapsed') // TODO: replace
}
