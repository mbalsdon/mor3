const OsuWrapper = require('./OsuWrapper')
const SheetsWrapper = require('./SheetsWrapper')
const Mods = require('./Mods')

module.exports = class MorFacade {
  #osu
  #sheets

  constructor (osuWrapper, sheetsWrapper) {
    if (typeof sheetsWrapper === 'undefined' || typeof osuWrapper === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.#osu = osuWrapper
    this.#sheets = sheetsWrapper
  }

  static async build () {
    const osuWrapper = await OsuWrapper.build()
    const sheetsWrapper = await SheetsWrapper.build()
    return new MorFacade(osuWrapper, sheetsWrapper)
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

  // async putScore (mods, id) {
  //   console.info(`MorFacade::putScore( ${mods}, ${id} )`)
  //   const modScores = await this.getModScores(mods)
  //   // Check if score already in sheet
  //   const scoreIndex = modScores.map((s) => { return s[0] }).indexOf(id)
  //   if (scoreIndex !== -1) {
  //     throw new Error(`Score with ID ${id} has already been added`)
  //   }
  //   const score = await this.#osu.fetchScore(id)
  //   const ps = this.#parseScore(score)
  //   const response = this.#sheets.insertScores(mods, [ps.slice(1, ps.length)])
  //   return response
  // }

  async deleteScore (mods, id) {
    console.info(`MorFacade::deleteScore( ${mods}, ${id} )`)
    const response = await this.#sheets.removeScore(mods, id)
    return response
  }

  async scrapeUserTopPlays () {
    console.info('MorFacade::scrapeUserTopPlays()')
    const userIds = await this.#sheets.fetchUserIds()
    // Key = Mod string; Value = Array sorted by pp
    const dict = {}
    // Iterate over each user's top 100, putting each score into the dict
    for (const id of userIds) {
      // Join tops and firsts, remove duplicates
      const tops = await this.#osu.fetchUserTopPlays(id)
      const firsts = await this.#osu.fetchUserFirstPlacePlays(id)
      const scores = this.#uniqueBy(tops.concat(firsts), (i) => i.id)
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
    // Sort each dict array by pp
    for (const k of Object.keys(dict)) {
      dict[k].sort((a, b) => {
        return parseInt(b[5]) - parseInt(a[5])
      })
    }
    // Grab sheet scores, insert new scores into it, then put them back in the sheet
    for (const k of Object.keys(dict)) {
      const sheetScores = await this.#sheets.fetchModScores(k, 'FORMULA')
      for (const dictScore of dict[k]) {
        // If it wasn't in the sheet scores, insert it
        if (!(sheetScores.filter((s) => s[0] === dictScore[0]).length > 0)) {
          const ssi = this.#sortedScoreIndex(sheetScores, dictScore)
          sheetScores.splice(ssi, 0, dictScore)
        }
      }
      await this.#sheets.replaceScores(k, sheetScores)
    }
    return 'good'
  }

  // Takes arr and key func; removes duplicates from arr based on key
  #uniqueBy (arr, key) {
    const seen = {}
    return arr.filter((item) => {
      const k = key(item)
      return Object.prototype.hasOwnProperty.call(seen, k) ? false : (seen[k] = true)
    })
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
      let mid = (low + high) >>> 1
      if (arr[mid][5] > val[5]) { // <
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }
}
