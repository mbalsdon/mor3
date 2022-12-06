import Mods from '../../controller/utils/Mods.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'
import MorUser from '../../controller/utils/MorUser.js'

import MorFacade from '../../controller/MorFacade.js'

/**
 * Takes every user in the MOR sheet and refreshes their stats.
 *
 * Should only be run individually for testing purposes -
 * Use runScheduledJobs() instead!
 * @see {@link RunScheduledJobs}
 */
export default async function updateUsers () {
  console.time('::updateUsers () >> Time elapsed') // TODO: replace
  console.info('::updateUsers () >> Updating user data... This may take a while') // TODO: replace

  const mor = await MorFacade.build()

  // Key: mods; Value: array of 25 highest pp plays
  const dict = {}
  console.info('::updateUsers () >> Grabbing score data from sheets...') // TODO: replace
  for (const mods of Mods.validModStrings()) {
    if (mods === Mods.SUBMITTED || mods === Mods.COMBINED) continue
    dict[mods] = await mor.getSheetScores(mods)
  }

  console.info('::updateUsers () >> Retrieving user IDs from sheet...') // TODO: replace
  const users = await mor.getSheetUsers()

  console.info(`::updateUsers () >> Refreshing data for ${users.length} users...`) // TODO: replace
  const updatedUsers = []
  for (const user of users) {
    let updatedUser
    console.info(`::updateUsers () >> Grabbing osu!API data for user ${user.username}...`) // TODO: replace
    try { updatedUser = await mor.getOsuUser(user.userId, 'id') } catch (error) {
      if (error instanceof NotFoundError) {
        console.info(`::updateUsers () >> Couldn't find user ${user.username}, skipping...`) // TODO: replace
        continue
      } else throw error
    }

    console.info(`::updateUsers () >> Counting top25s for user ${user.username}...`) // TODO: replace
    let [top1s, top2s, top3s, top5s, top10s, top25s] = [0, 0, 0, 0, 0, 0]
    for (const key of Object.keys(dict)) {
      const scores = dict[key]
      const len = (scores.length < 25) ? scores.length : 25

      for (let i = 0; i < len; i++) {
        if (user.userId !== scores[i].userId) continue
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
      updatedUser.userId,
      updatedUser.username,
      updatedUser.playstyle,
      updatedUser.countryCode,
      updatedUser.globalRank,
      updatedUser.countryRank,
      updatedUser.pp,
      updatedUser.accuracy,
      updatedUser.playtime,
      top1s.toString(),
      top2s.toString(),
      top3s.toString(),
      top5s.toString(),
      top10s.toString(),
      top25s.toString(),
      updatedUser.pfpLink,
      user.autotrack
    ]))
  }

  console.info('::updateUsers () >> Updating the sheet...') // TODO: replace
  updatedUsers.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
  updatedUsers.sort((a, b) => {
    return ((a.autotrack === b.autotrack) ? 0 : ((b.autotrack === 'FALSE') ? -1 : 1))
  })

  await mor.replaceSheetUsers(updatedUsers)

  const dateString = new Date(Date.now()).toISOString()
  console.info(`::updateUsers () >> Job completed at ${dateString}, updated ${updatedUsers.length} users`) // TODO: replace
  console.timeEnd('::updateUsers () >> Time elapsed') // TODO: replace
}
