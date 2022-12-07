import Mods from '../../controller/utils/Mods.js'
import MorConfig from '../../controller/utils/MorConfig.js'
import { NotFoundError } from '../../controller/utils/MorErrors.js'
import MorUser from '../../controller/utils/MorUser.js'

import MorFacade from '../../controller/MorFacade.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

/**
 * Takes every user in the MOR sheet and refreshes their stats.
 *
 * Should only be run individually for testing purposes -
 * Use runScheduledJobs() instead!
 * @see {@link RunScheduledJobs}
 */
export default async function updateUsers () {
  const startTimeMs = new Date(Date.now()).getTime()
  logger.info(`updateUsers job initiated; updating data on the ${MorConfig.SHEETS.USERS.NAME}sheet... This may take a while!`)

  const mor = await MorFacade.build()

  // Key: mods; Value: array of MorScores
  const dict = {}
  logger.info('Grabbing score data from sheets...')
  for (const mods of Mods.validModStrings()) {
    if (mods === Mods.SUBMITTED || mods === Mods.COMBINED) continue
    logger.info(`Grabbing ${mods} scores...`)
    dict[mods] = await mor.getSheetScores(mods)
  }

  logger.info('Retrieving tracked users from sheet...')
  const users = await mor.getSheetUsers()

  logger.info(`Refreshing data for ${users.length} users...`)
  const updatedUsers = []
  for (const user of users) {
    let updatedUser
    logger.info(`Grabbing osu!API data for ${user.username}...`)
    try { updatedUser = await mor.getOsuUser(user.userId, 'id') } catch (error) {
      if (error instanceof NotFoundError) {
        logger.warn(`Couldn't find user ${user.username}, skipping...`)
        continue
      } else throw error
    }

    logger.info(`Counting top25s for user ${user.username}...`)
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

  logger.info(`Updating the ${MorConfig.SHEETS.USERS.NAME} sheet...`)
  updatedUsers.sort((a, b) => { return parseFloat(b.pp) - parseFloat(a.pp) })
  updatedUsers.sort((a, b) => {
    return ((a.autotrack === b.autotrack) ? 0 : ((b.autotrack === 'FALSE') ? -1 : 1))
  })

  await mor.replaceSheetUsers(updatedUsers)

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 60000
  logger.info(`updateUsers completed! Duration=${durationMin.toFixed(2)}min`)
}
