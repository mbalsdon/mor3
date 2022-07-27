import OsuWrapper from './OsuWrapper.js'
import SheetsWrapper from './SheetsWrapper.js'
import DriveWrapper from './DriveWrapper.js'
import Mods from './Mods.js'

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
      throw new Error(`User with ID ${userId} has already been added`)
    }
    const user = await this.#osu.fetchUser(userId)
    const username = user.username
    const rank = user.statistics.global_rank
    const pp = user.statistics.pp
    const response = await this.#sheets.insertUser(userId, username, rank, pp)
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

}
