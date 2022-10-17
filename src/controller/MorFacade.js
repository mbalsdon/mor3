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

  async getUsernames () {
    console.info('MorFacade::getUsernames()')
    const usernames = await this.#sheets.fetchUsernames()
    return usernames
  }

  async getSheetUser (username) {
    console.info(`MorFacade::getSheetUser( ${username} )`)
    const user = await this.#sheets.fetchUser(username)
    return user
  }

  async putUser (username) {
    console.info(`MorFacade::putUser( ${username} )`)
    const user = await this.#osu.fetchUser(username)
    const userIds = await this.#sheets.fetchUserIds()
    // Check if ID already in sheet
    if (userIds.includes(user.id.toString())) {
      throw new Error(`User ${user.username} is already being tracked!`)
    }
    const rank = user.statistics.global_rank
    const pp = user.statistics.pp
    const acc = user.statistics.hit_accuracy.toFixed(2)
    const playtime = Math.round(user.statistics.play_time / 3600)
    const top1s = 0
    const top2s = 0
    const top3s = 0
    const top5s = 0
    const top10s = 0
    const top25s = 0
    const pfpLink = user.avatar_url

    await this.#sheets.insertUser(user.id, user.username, rank, pp, acc, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink)
    return user
  }

  async deleteUser (username) {
    console.info(`MorFacade::deleteUser( ${username} )`)
    const user = await this.#sheets.removeUser(username)
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
      `${id}`,
      `${s.user.id}`,
      `${s.user.username}`,
      `${s.beatmapset.artist} - ${s.beatmapset.title} [${s.beatmap.version}]`,
      (s.mods.length === 0) ? 'NM' : s.mods.join().replaceAll(',', ''), // turn the mods into a single string
      Math.round(s.accuracy * 10000) / 100, // 0.xxxx => xx.xx
      s.pp,
      s.beatmap.difficulty_rating,
      s.created_at,
      s.beatmapset.covers['list@2x']
    ]
    await this.#sheets.submitScore(parsedScore)
    return parsedScore
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
    const mods = submittedScores[4][index]
    await this.#sheets.removeScore(mods, id)
    const s = [submittedScores[0][index],
      submittedScores[1][index],
      submittedScores[2][index],
      submittedScores[3][index],
      submittedScores[4][index],
      submittedScores[5][index],
      submittedScores[6][index],
      submittedScores[7][index],
      submittedScores[8][index],
      submittedScores[9][index]]
    return s
  }

  async getLastUpdated () {
    console.info('MorFacade::getLastUpdated()')
    const s = await this.#sheets.fetchLastUpdated()
    return s
  }
}
