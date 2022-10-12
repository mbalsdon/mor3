import 'dotenv/config'
import Mods from '../controller/Mods.js'
import OsuWrapper from '../controller/OsuWrapper.js'
import SheetsWrapper from '../controller/SheetsWrapper.js'

console.time('UpdateUsers.js time elapsed')
console.info('Updating user rank and PP data...')

const sheets = await SheetsWrapper.build()
const osu = await OsuWrapper.build()
// Re-grab all the user data
const users = []
const userIds = await sheets.fetchUserIds()
await sleep(1000)
for (const userId of userIds) {
  let top1s = 0
  let top2s = 0
  let top3s = 0
  let top5s = 0
  let top10s = 0
  let top25s = 0
  // Counts user's scores that are in the top25 of each modsheet
  for (const mods of Mods.modStrings) {
    const modScores = await sheets.fetchModScores(mods, 'FORMATTED_VALUE')
    await sleep(1000)
    const length = (modScores.length < 25) ? modScores.length : 25
    for (let i = 0; i < length; i++) {
      if (userId === modScores[i][1]) { // TODO: 2 === magic numba
        if (i === 0) {
          top1s = top1s + 1
        } else if (i === 1) {
          top2s = top2s + 1
        } else if (i === 2) {
          top3s = top3s + 1
        } else if (i === 3 || i === 4) {
          top5s = top5s + 1
        } else if (i >= 5 && i < 10) {
          top10s = top10s + 1
        } else if (i >= 10 && i < 25) {
          top25s = top25s + 1
        } else {
          throw new Error(`i===${i} - This should never happen!`)
        }
      }
    }
  }

  // Get osu!API-side data
  const user = await osu.fetchUser(userId)
  await sleep(1000)

  // Unify and push data
  users.push([
    userId,
    user.username,
    user.statistics.global_rank,
    user.statistics.pp,
    user.statistics.hit_accuracy.toFixed(2),
    Math.round(user.statistics.play_time / 3600),
    top1s,
    top2s,
    top3s,
    top5s,
    top10s,
    top25s,
    user.avatar_url])
}
// Sort by PP
users.sort((a, b) => {
  return parseInt(b[3]) - parseInt(a[3]) // TODO: magic number
})
// Update the sheet
await sheets.replaceUsers(users)
await sleep(1000)
const dateString = new Date(Date.now()).toISOString()

console.timeEnd('UpdateUsers.js time elapsed')
console.info(`Update users job completed at ${dateString}`)

/* --- --- --- --- --- ---
   --- HELPER  METHODS ---
   --- --- --- --- --- --- */

// TODO: duplicate code
function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
