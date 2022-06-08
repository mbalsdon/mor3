const OsuWrapper = require('./OsuWrapper')
const SheetsWrapper = require('./SheetsWrapper')

module.exports = class MorFacade {
  osu
  sheets

  constructor (osuWrapper, sheetsWrapper) {
    if (typeof sheetsWrapper === 'undefined' || typeof osuWrapper === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.osu = osuWrapper
    this.sheets = sheetsWrapper
  }

  static async build () {
    const osuWrapper = await OsuWrapper.build()
    const sheetsWrapper = await SheetsWrapper.build()
    return new MorFacade(osuWrapper, sheetsWrapper)
  }

  async getUserIds () {
    console.info('MorFacade::getUserIds()')
    const userIds = await this.sheets.fetchUserIds()
    return userIds
  }

  async putUser (userId) {
    console.info(`MorFacade::putUser( ${userId} )`)
    const userIds = await this.sheets.fetchUserIds()
    // Check if ID already in sheet
    if (userIds.includes(userId)) {
      throw new Error(`User ID ${userId} has already been added`)
    // Else put ID & username in sheet
    } else {
      const username = await this.osu.fetchUsername(userId)
      const response = await this.sheets.insertUser(userId, username)
      return response
    }
  }

  async deleteUser (userId) {
    console.info(`MorFacade::deleteUser( ${userId} )`)
    const response = await this.sheets.removeUser(userId)
    return response
  }

  async getMetadata () {
    console.info('MorFacade::getMetadata()')
    const response = await this.sheets.fetchMetadata()
    return response
  }

  async scrapeUserTopPlays () {
    console.info('MorFacade::scrapeUserTopPlays()')
    const userIds = await this.sheets.fetchUserIds()
    // Key = Mod string; Value = Array sorted by pp
    const dict = {}
    // Iterate over each user's top 100, putting each score into the dict
    for (const id of userIds) {
      const scores = await this.osu.fetchUserTopPlays(id)
      for (const score of scores) {
        const ps = this.parseScore(score)
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

    for (const k of Object.keys(dict)) {
      dict[k].sort((a, b) => {
        return parseInt(a[4]) - parseInt(b[4])
      })
    }

    // TODO: put the dict in sheet
  }

  // private
  // takes a Score object (https://osu.ppy.sh/docs/index.html#score)
  parseScore (s) {
    return [
      this.parseModKey([...s.mods]), // key for dict
      `=HYPERLINK("https://osu.ppy.sh/users/${s.user.id}", ${s.user.username})`,
      `=HYPERLINK("${s.beatmap.url}", "${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}]")`,
      (s.mods.length === 0) ? 'NM' : s.mods.join(), // turn the mods into a single string
      Math.round(s.accuracy * 10000) / 100, // 0.xxxx => xx.xx
      s.pp,
      s.created_at
    ]
  }

  // private
  // takes mods (array of str) from Score obj, returns "normalized form" (e.g. HDNC => HDDT; NF => NM)
  parseModKey (mods) {
    // NC => DT
    if (mods.includes('NC')) mods.splice(mods.indexOf('NC'), 1, 'DT')
    // NF / SO / SD / PF => remove it
    if (mods.includes('NF')) mods.splice(mods.indexOf('NF'), 1)
    if (mods.includes('SO')) mods.splice(mods.indexOf('SO'), 1)
    if (mods.includes('SD')) mods.splice(mods.indexOf('SD'), 1)
    if (mods.includes('PF')) mods.splice(mods.indexOf('PF'), 1)
    // empty => NM
    if (mods.length === 0) {
      return 'NM'
    } else {
      return mods.join()
    }
  }
}
