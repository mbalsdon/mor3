import 'dotenv/config'
import SheetsWrapper from '../controller/SheetsWrapper.js'
import OsuWrapper from '../controller/OsuWrapper.js'
import DriveWrapper from '../controller/DriveWrapper.js'
import Mods from '../controller/Mods.js'

console.time('ScrapeTopPlays.js time elapsed')
console.log('Scraping user top 100s...')

const osu = await OsuWrapper.build()
const sheets = await SheetsWrapper.build()
const drive = await DriveWrapper.build()
// Key = Mod string; Value = array sorted by pp
const dict = {}
let numInserted = 0
// Iterate over each user's top 100, putting each score into the dict
const userIds = await sheets.fetchUserIds()
await sleep(1000)
for (const id of userIds) {
  // Put user's top plays and first place plays in the dict
  const tops = await osu.fetchUserTopPlays(id)
  await sleep(1000)
  const firsts = await osu.fetchUserFirstPlacePlays(id)
  await sleep(1000)
  const userScores = uniqueBy(tops.concat(firsts), (i) => i.id)
  populateDict(dict, userScores)
}
// Put submitted scores in the dict (the submitted scores sheet works as a buffer to reduce API calls)
const submittedScoreIds = await sheets.fetchSubmittedScores()
await sleep(1000)
const submitted = await osu.fetchScores(submittedScoreIds)
await sleep(1000)
populateDict(dict, submitted)
// Sort each array in the dict by pp
for (const k of Object.keys(dict)) {
  dict[k].sort((a, b) => {
    return parseInt(b[5]) - parseInt(a[5])
  })
}
// Grab sheet scores, insert any new scores into it, then put them back in the sheet
for (const k of Object.keys(dict)) {
  const sheetScores = await sheets.fetchModScores(k, 'FORMULA')
  await sleep(1000)
  for (const dictScore of dict[k]) {
    // Checks if it was already in the sheet scores, inserts if not
    if (!(sheetScores.filter((s) => s[0] === dictScore[0]).length > 0)) {
      const ssi = sortedScoreIndex(sheetScores, dictScore)
      sheetScores.splice(ssi, 0, dictScore)
      numInserted = numInserted + 1
    }
  }
  await sheets.replaceScores(k, sheetScores)
  await sleep(1000)
}
// Archive the spreadsheet
const dateString = new Date(Date.now()).toISOString()
await drive.copyFile(process.env.SPREADSHEET_ID, `mor3 ${dateString}`)
await sheets.lastUpdated(dateString)

console.timeEnd('ScrapeTopPlays.js time elapsed')
console.log(`Scrape top plays job completed at ${dateString}, inserted ${numInserted} new plays`)

/* --- --- --- --- --- ---
   --- HELPER  METHODS ---
   --- --- --- --- --- --- */

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Takes arr and key func; removes duplicates from arr based on key
function uniqueBy (arr, key) {
  const seen = {}
  return arr.filter((item) => {
    const k = key(item)
    return Object.prototype.hasOwnProperty.call(seen, k) ? false : (seen[k] = true)
  })
}

// Puts scores into dict based on mod
function populateDict (dict, scores) {
  for (const score of scores) {
    const ps = parseScore(score)
    const key = ps[0]
    const formattedScore = ps.slice(1, ps.length)
    // The key exists
    if (Object.keys(dict).includes(key)) {
      dict[key].push(formattedScore)
      // The key doesn't exist
    } else {
      dict[key] = [formattedScore]
    }
  }
}

// Takes a Score object (https://osu.ppy.sh/docs/index.html#score)
function parseScore (s) {
  return [
    Mods.parseModKey([...s.mods]), // key for dict
        `=HYPERLINK("https://osu.ppy.sh/scores/osu/${s.id}", "${s.id}")`,
        `=HYPERLINK("https://osu.ppy.sh/users/${s.user.id}", "${s.user.username}")`,
        `=HYPERLINK("${s.beatmap.url}", "${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}]")`,
        (s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', ''), // turn the mods into a single string
        Math.round(s.accuracy * 10000) / 100, // 0.xxxx => xx.xx
        s.pp,
        s.created_at
  ]
}

function sortedScoreIndex (arr, val) {
  let low = 0
  let high = arr.length

  while (low < high) {
    const mid = (low + high) >>> 1
    if (arr[mid][5] > val[5]) { // <
      low = mid + 1
    } else {
      high = mid
    }
  }
  return low
}
