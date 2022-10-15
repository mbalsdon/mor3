import 'dotenv/config'
import * as fs from 'fs'
import Mods from '../controller/Mods.js'
import OsuWrapper from '../controller/OsuWrapper.js'
import SheetsWrapper from '../controller/SheetsWrapper.js'

export default async function updateModSheets () {
  console.time('::updateModSheets() >> time elapsed')
  console.info('::updateModSheets() >> Refreshing the entire sheet... This will take a very long time')

  const osu = await OsuWrapper.build()
  const sheets = await SheetsWrapper.build()

  // Make save directory
  if (!fs.existsSync('./src/jobs/save')) {
    fs.mkdirSync('./sr/jobs/save/')
  }

  // If savefile doesn't exist, make it
  let currentModSheet
  if (!fs.existsSync('./src/jobs/save/updateModSheets.json')) {
    fs.writeFileSync('./src/jobs/save/updateModSheets.json', 
      JSON.stringify({"currentModSheet": "Submitted Scores", "scores": []}))
  }

  // Read savefile
  let saveDataRaw = fs.readFileSync('./src/jobs/save/updateModSheets.json')
  let saveData = JSON.parse(saveDataRaw)
  currentModSheet = saveData.currentModSheet

  // "Set" which sheet the loop will start at using savefile
  let modStrings = ['Submitted Scores'].concat(Mods.modStrings)
  let remainingModStrings = [...modStrings]
  for (const mods of modStrings) {
    if (mods === currentModSheet) {
      break
    }
    remainingModStrings.shift()
  }

  // Key: mod combo | Value: score IDs from modsheet
  const dict = {}
  for (const mods of remainingModStrings) {

    // Read savefile at start of each iteration
    let saveDataRaw = fs.readFileSync('./src/jobs/save/updateModSheets.json')
    let saveData = JSON.parse(saveDataRaw)
    
    saveData.currentModSheet = mods

    dict[mods] = await sheets.fetchModScoreIds(mods, 'FORMATTED_VALUE')
    await sleep(1000)

    // "Set" which score the loop will start at using savefile
    let startOfRemainingScores = 0
    if (mods === currentModSheet) {
      const finishedScoreIds = saveData.scores.map(s => s[0])
      if (finishedScoreIds.length === 0) {
        startOfRemainingScores = 0
      } else {
        const lastFinishedScoreId = finishedScoreIds[finishedScoreIds.length - 1]
        startOfRemainingScores = dict[mods].indexOf(lastFinishedScoreId.toString()) + 1
      }
    }

    // Fetch each score from osu!API and push it to the savefile
    for (let i = startOfRemainingScores; i < dict[mods].length; i++) {
      try {
        const s = await osu.fetchScore(dict[mods][i])
        await sleep(1000)
        saveData.scores.push([ // TODO: class
          `${s.id}`,
          `${s.user.id}`,
          `${s.user.username}`,
          `${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}]`,
          (s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', ''), // turn the mods into a single string
          Math.round(s.accuracy * 10000) / 100, // 0.xxxx => xx.xx
          s.pp,
          s.beatmap.difficulty_rating,
          s.created_at,
          s.beatmapset.covers['list@2x']
        ])
        fs.writeFileSync('./src/jobs/save/updateModSheets.json', JSON.stringify(saveData))
      } catch (error) {
        continue
      }
    }

    // Grab the updated scores from the savefile
    const updatedSaveDataRaw = fs.readFileSync('./src/jobs/save/updateModSheets.json')
    const updatedSaveData = JSON.parse(updatedSaveDataRaw)
    const updatedScores = updatedSaveData.scores


    // Sort the scores by PP
    let sortedScores = updatedScores.sort((a, b) => {
      return parseInt(b[6]) - parseInt(a[6]) // TODO: magic numba
    })

    // Update the sheet and reset the savefile
    await sheets.replaceScores(mods, sortedScores)
    await sleep(1000)
    fs.writeFileSync('./src/jobs/save/updateModSheets.json', 
      JSON.stringify({"currentModSheet": "Submitted Scores", "scores": []}))
  }

  const dateString = new Date(Date.now()).toISOString()
  await sheets.lastUpdated(dateString)

  console.info(`::updateModSheets() >> job completed at ${dateString}`)
  console.timeEnd('::updateModSheets() >> time elapsed')
}

/* --- --- --- --- --- ---
   --- HELPER  METHODS ---
   --- --- --- --- --- --- */

// TODO: make these private ?

// TODO: duplicate code
function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
