import OsuWrapper from './OsuWrapper.js'
import SheetsWrapper from './SheetsWrapper.js'
import DriveWrapper from './DriveWrapper.js'
import Mods from './Mods.js'

export default class MorFacade {
  #osu
  #sheets
  #drive

  constructor (osuWrapper, sheetsWrapper, driveWrapper) {
    if (typeof sheetsWrapper === 'undefined' || typeof osuWrapper === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.#osu = osuWrapper
    this.#sheets = sheetsWrapper
    this.#drive = driveWrapper
  }

  static async build () {
    console.info('MorFacade::build()')
    const osuWrapper = await OsuWrapper.build()
    const sheetsWrapper = await SheetsWrapper.build()
    const driveWrapper = await DriveWrapper.build()
    return new MorFacade(osuWrapper, sheetsWrapper, driveWrapper)
  }

  async getMetadata () {
    console.info('MorFacade::getMetadata()')
    const response = await this.#sheets.fetchMetadata()
    return response
  }

  async getUserIds () {
    console.info('MorFacade::getUserIds()')
    const userIds = await this.#sheets.fetchUserIds()
    return userIds
  }

  async putUser (userId) {
    console.info(`MorFacade::putUser( ${userId} )`)
    const userIds = await this.#sheets.fetchUserIds()
    // Check if ID already in sheet
    if (userIds.includes(userId)) {
      throw new Error(`User with ID ${userId} has already been added`)
    }
    const username = await this.#osu.fetchUsername(userId)
    const response = await this.#sheets.insertUser(userId, username)
    return response
  }

  async deleteUser (userId) {
    console.info(`MorFacade::deleteUser( ${userId} )`)
    const response = await this.#sheets.removeUser(userId)
    return response
  }

  async getModScores (mods) {
    console.info(`MorFacade::getModScores( ${mods} )`)
    const modScores = await this.#sheets.fetchModScores(mods, 'FORMATTED_VALUE')
    return modScores
  }

  async getScore (mods, id) {
    console.info(`MorFacade::getScore( ${mods}, ${id} )`)
    // Check if score in sheet
    const modScores = await this.getModScores(mods)
    const scoreIndex = modScores.map((s) => { return s[0] }).indexOf(id)
    if (scoreIndex === -1) {
      throw new Error(`Score with ID ${id} could not be found`)
    }
    const score = await this.#sheets.fetchScore(mods, scoreIndex)
    return score
  }

  async deleteScore (mods, id) {
    console.info(`MorFacade::deleteScore( ${mods}, ${id} )`)
    const response = await this.#sheets.removeScore(mods, id)
    return response
  }

  async getSubmittedScores () {
    console.info('MorFacade::getSubmittedScores()')
    const response = await this.#sheets.fetchSubmittedScores()
    return response
  }

  async putSubmittedScore (id) {
    console.info(`MorFacade::putSubmittedScore( ${id} )`)
    // Check if score already in sheet
    const submittedScores = await this.getSubmittedScores()
    const index = submittedScores.indexOf(id)
    if (index !== -1) {
      throw new Error(`Score with ID ${id} has already been submitted`)
    }
    const response = await this.#sheets.submitScore(id)
    return response
  }

  async scrapeUserTopPlays () {
    console.time('MorFacade::scrapeUserTopPlays() time elapsed')
    console.info('MorFacade::scrapeUserTopPlays()')
    // Key = Mod string; Value = Array sorted by pp
    const dict = {}
    let numInserted = 0
    // Iterate over each user's top 100, putting each score into the dict
    const userIds = await this.#sheets.fetchUserIds()
    await this.#sleep(1000)
    for (const id of userIds) {
      // Put user's top plays and first place plays in the dictionary
      const tops = await this.#osu.fetchUserTopPlays(id)
      await this.#sleep(1000)
      const firsts = await this.#osu.fetchUserFirstPlacePlays(id)
      await this.#sleep(1000)
      const userScores = this.#uniqueBy(tops.concat(firsts), (i) => i.id)
      this.#populateDict(dict, userScores)
    }
    // Put submitted scores in the dictionary (the submitted scores sheet works as a buffer to reduce API calls)
    const submittedScoreIds = await this.#sheets.fetchSubmittedScores()
    await this.#sleep(1000)
    const submitted = await this.#osu.fetchScores(submittedScoreIds)
    await this.#sleep(1000)
    this.#populateDict(dict, submitted)
    // Sort each array in the dictionary by pp
    for (const k of Object.keys(dict)) {
      dict[k].sort((a, b) => {
        return parseInt(b[5]) - parseInt(a[5])
      })
    }
    // Grab sheet scores, insert any new scores into it, then put them back in the sheet
    for (const k of Object.keys(dict)) {
      const sheetScores = await this.#sheets.fetchModScores(k, 'FORMULA')
      await this.#sleep(1000)
      for (const dictScore of dict[k]) {
        // Checks if it was already in the sheet scores, inserts if not
        if (!(sheetScores.filter((s) => s[0] === dictScore[0]).length > 0)) {
          const ssi = this.#sortedScoreIndex(sheetScores, dictScore)
          sheetScores.splice(ssi, 0, dictScore)
          numInserted = numInserted + 1
        }
      }
      await this.#sheets.replaceScores(k, sheetScores)
      await this.#sleep(1000)
    }
    // Archive the spreadsheet
    
    const dateString = new Date(Date.now()).toISOString()
    await this.#drive.copyFile(process.env.SPREADSHEET_ID, `mor3 ${dateString}`)
    console.timeEnd('MorFacade::scrapeUserTopPlays() time elapsed')
    return `MorFacade::scrapeUserTopPlays() completed at ${dateString}, inserted ${numInserted} new plays`
  }

  /* --- --- --- --- --- ---
     --- PRIVATE METHODS ---
     --- --- --- --- --- --- */

  #sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  // Takes arr and key func; removes duplicates from arr based on key
  #uniqueBy (arr, key) {
    const seen = {}
    return arr.filter((item) => {
      const k = key(item)
      return Object.prototype.hasOwnProperty.call(seen, k) ? false : (seen[k] = true)
    })
  }

  // Puts scores into dict based on mod
  #populateDict (dict, scores) {
    for (const score of scores) {
      const ps = this.#parseScore(score)
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
  #parseScore (s) {
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

  #sortedScoreIndex (arr, val) {
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
}
