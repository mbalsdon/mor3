import OsuWrapper from './OsuWrapper.js'
import SheetsWrapper from './SheetsWrapper.js'
import DriveWrapper from './DriveWrapper.js'

import 'dotenv/config'

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

  async getUser (id) {
    console.info(`MorFacade::getUser( ${id} )`)
    const user = await this.#osu.fetchUser()
    return user
  }

  async getUsers () {
    console.info('MorFacade::getUsers()')
    const users = await this.#sheets.fetchUsers()
    return users
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
    if (userIds.includes(userId.toString())) {
      throw new Error(`User with ID ${userId} is already being tracked!`)
    }
    const user = await this.#osu.fetchUser(userId)
    const username = user.username
    const rank = user.statistics.global_rank
    const pp = user.statistics.pp
    const acc = user.statistics.hit_accuracy
    const playtime = user.statistics.play_time / 3600
    const top1s = 0 // TODO
    const top2s = 0 // TODO
    const top3s = 0 // TODO
    const pfpLink = user.avatar_url

    await this.#sheets.insertUser(userId, username, rank, pp, acc, playtime, top1s, top2s, top3s, pfpLink)
    return user
  }

  async deleteUser (userId) {
    console.info(`MorFacade::deleteUser( ${userId} )`)
    await this.#sheets.removeUser(userId)
    const user = await this.#osu.fetchUser(userId)
    return user
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
      throw new Error(`Score with ID ${id} could not be found.`)
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
    // TODO: should also insert into modsheet; not MVP but pretty cringe w/o
    console.info(`MorFacade::putSubmittedScore( ${id} )`)
    // Check if score already in sheet
    const submittedScores = await this.#sheets.fetchSubmittedScores()
    const index = submittedScores.indexOf(id)
    if (index !== -1) {
      throw new Error(`Score with ID ${id} has already been submitted!`)
    }
    const s = await this.#osu.fetchScore(id)
    const parsedScore = [
      `=HYPERLINK("https://osu.ppy.sh/scores/osu/${id}", "${id}")`,
      `=HYPERLINK("https://osu.ppy.sh/users/${s.user.id}", "${s.user.username}")`,
      `=HYPERLINK("${s.beatmap.url}", "${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}]")`,
      (s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', ''), // turn the mods into a single string
      Math.round(s.accuracy * 10000) / 100, // 0.xxxx => xx.xx
      s.pp,
      s.created_at
    ]
    await this.#sheets.submitScore(parsedScore)
    return s
  }

  async deleteSubmittedScore (id) {
    console.info(`MorFacade::deleteSubmittedScore( ${id} )`)
    // Check if score exists (can't check this through osu!API since it's possible for score IDs to get deleted if score is overwritten)
    const submittedScores = await this.#sheets.fetchSubmittedScoresFull()
    const index = submittedScores[0].indexOf(id)
    if (index === -1) {
      throw new Error(`Score with ID ${id} could not be found.`)
    }
    // Get mods
    const mods = submittedScores[3][index]
    await this.#sheets.removeScore(mods, id)
    const s = [submittedScores[0][index],
      submittedScores[1][index],
      submittedScores[2][index],
      submittedScores[3][index],
      submittedScores[4][index],
      submittedScores[5][index],
      submittedScores[6][index]]
    return s
  }
}
