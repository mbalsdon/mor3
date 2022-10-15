import 'dotenv/config'
import SheetsWrapper from '../controller/SheetsWrapper.js'
import OsuWrapper from '../controller/OsuWrapper.js'
import Mods from '../controller/Mods.js'

export default async function scrapeTopPlays () {
  console.time('::scrapeTopPlays() >> time elapsed')
  console.info('::scrapeTopPlays() >> Scraping user top 100s and #1s... This may take a while')

  const osu = await OsuWrapper.build()
  const sheets = await SheetsWrapper.build()
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
      return parseInt(b[6]) - parseInt(a[6]) // TODO: magic number
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

  const dateString = new Date(Date.now()).toISOString()
  console.info(`::scrapeTopPlays() >> job completed at ${dateString}, inserted ${numInserted} new plays`)
  console.timeEnd('::scrapeTopPlays() >> time elapsed')
}

/* --- --- --- --- --- ---
   --- HELPER  METHODS ---
   --- --- --- --- --- --- */

// TODO: make these private?

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

// TODO: duplicated code (MorFacade.js::putSubmittedScore)
// Takes a Score object (https://osu.ppy.sh/docs/index.html#score)
function parseScore (s) {
  return [
    Mods.parseModKey([...s.mods]), // key for dict
    s.id,
    s.user.id,
    s.user.username,
    `${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}]`,
    (s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', ''), // turn the mods into a single string
    Math.round(s.accuracy * 10000) / 100, // 0.xxxx => xx.xx
    s.pp,
    s.beatmap.difficulty_rating,
    s.created_at,
    s.beatmapset.covers['list@2x']
  ]
}

// Takes a list of scores (arr) and a score (val), returns the index of arr to put val in (sorted by PP)
function sortedScoreIndex (arr, val) {
  let low = 0
  let high = arr.length

  while (low < high) {
    const mid = (low + high) >>> 1
    if (arr[mid][6] > val[6]) { // 6 is a magic number, refers to the PP column
      low = mid + 1
    } else {
      high = mid
    }
  }
  return low
}
