import 'dotenv/config'
import OsuWrapper from '../controller/OsuWrapper.js'
import SheetsWrapper from '../controller/SheetsWrapper.js'

console.time('UpdateUsers.js time elapsed')
console.log('Updating user rank and PP data...')

const sheets = await SheetsWrapper.build()
const osu = await OsuWrapper.build()
// Re-grab all the user data
const users = []
const userIds = await sheets.fetchUserIds()
for (const id of userIds) {
  const user = await osu.fetchUser(id)
  await sleep(1000)
  users.push([id, user.username, user.statistics.global_rank, user.statistics.pp])
}
// Sort by PP
users.sort((a, b) => {
  return parseInt(b[3]) - parseInt(a[3])
})
// Update the sheet
await sheets.replaceUsers(users)
await sleep(1000)
const dateString = new Date(Date.now()).toISOString()

console.timeEnd('UpdateUsers.js time elapsed')
console.log(`Update users job completed at ${dateString}`)

/* --- --- --- --- --- ---
   --- HELPER  METHODS ---
   --- --- --- --- --- --- */

   function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }