import OsuWrapper from './OsuWrapper.js'
import SheetsWrapper from './SheetsWrapper.js'
import DriveWrapper from './DriveWrapper.js'
import 'dotenv/config'
import { AlreadyExistsError, ConstructorError, InvalidModsError, NotFoundError } from './Errors.js'
import User from './User.js'
import Score from './Score.js'
import Config from './Config.js'
import Mods from './Mods.js'
import Utils from './Utils.js'

export default class MorFacade {
  #OSU
  #SHEETS
  #DRIVE

  constructor (osuWrapper, sheetsWrapper, driveWrapper) {
    if (typeof osuWrapper === 'undefined') throw new ConstructorError('osuWrapper is undefined! NOTE: Constructor cannot be called directly.')
    if (typeof sheetsWrapper === 'undefined') throw new ConstructorError('sheetsWrapper is undefined! NOTE: Constructor cannot be called directly.')
    if (typeof driveWrapper === 'undefined') throw new ConstructorError('driveWrapper is undefined! NOTE: Constructor cannot be called directly.')
    this.#OSU = osuWrapper
    this.#SHEETS = sheetsWrapper
    this.#DRIVE = driveWrapper
  }

  static async build () {
    console.info('MorFacade::build ()') // TODO: replace
    const [osuWrapper, sheetsWrapper, driveWrapper] = await Promise.all([OsuWrapper.build(), SheetsWrapper.build(), DriveWrapper.build()])
    return new MorFacade(osuWrapper, sheetsWrapper, driveWrapper)
  }

  async getSheetMetadata () {
    console.info('MorFacade::getSheetMetadata ()') // TODO: replace
    const response = await this.#SHEETS.getMetadata()
    return response
  }

  async getSheetLastUpdated () {
    console.info('MorFacade::getSheetLastUpdated ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.MAIN.NAME,
      Config.LAST_UPDATE_CELL,
      Config.LAST_UPDATE_CELL,
      'FORMATTED_VALUE',
      'ROWS')
    return response.values[0][0]
  }

  async setSheetLastUpdated (date) {
    console.info(`MorFacade::setSheetLastUpdated (${date})`) // TODO: replace
    if (!Utils.isValidDate(date)) throw new TypeError(`date must be a valid date string! Val=${date}`)
    const response = await this.#SHEETS.updateRange(
      [[date]],
      Config.SHEETS.MAIN.NAME,
      Config.LAST_UPDATE_CELL,
      Config.LAST_UPDATE_CELL,
      'RAW'
    )
    return response
  }

  async getOsuUser (username, searchParam = 'username') {
    console.info(`MorFacade::getOsuUser (${username})`) // TODO: replace
    const response = await this.#OSU.getUser(username, searchParam)
    return new User(response.id.toString(),
      response.username,
      String(response.statistics.global_rank),
      response.statistics.pp === null ? '0' : response.statistics.pp.toFixed(3),
      response.statistics.hit_accuracy.toFixed(2),
      Math.round(response.statistics.play_time / 3600).toString(),
      '-1', '-1', '-1', '-1', '-1', '-1',
      response.avatar_url)
  }

  async getOsuUserScores (userId, type = 'best') {
    console.info(`MorFacade::getOsuUserScores (${userId}, ${type})`) // TODO: replace
    if (!Utils.isPositiveNumericString(userId)) throw new TypeError(`userId must be a positive number string! Val=${userId}`)
    if (type !== 'best' && type !== 'firsts') throw new TypeError(`type must be one of 'best' or 'firsts'! Val=${type}`)
    const scores = await this.#OSU.getUserPlays(userId, type)
    const ret = []
    for (const score of scores) {
      ret.push(new Score(
        score.id.toString(),
        score.user.id.toString(),
        score.user.username,
        `${score.beatmapset.artist} - ${score.beatmapset.title} [${score.beatmap.version}]`,
        Mods.parseModKey(score.mods),
        (score.accuracy * 100).toFixed(2),
        score.pp === null ? '0' : score.pp.toFixed(3),
        score.beatmap.difficulty_rating.toFixed(2),
        score.created_at.replace('Z', '+00:00'),
        score.beatmapset.covers['list@2x']
      ))
    }
    return ret
  }

  async getSheetUsers () {
    console.info('MorFacade::getSheetUsers ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.USERS.NAME,
      User.columnLetter('userId'),
      User.columnLetter('pfpLink'),
      'FORMATTED_VALUE',
      'ROWS'
    )
    const ret = []
    response.values.slice(1).forEach(a => {
      const u = new User(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13])
      ret.push(u)
    })
    return ret
  }

  async getSheetUserIds () {
    console.info('MorFacade::getSheetUserIds ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.USERS.NAME,
      User.columnLetter('userId'),
      User.columnLetter('userId'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  async getSheetUserPps () {
    console.info('MorFacade::getSheetUserPps ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.USERS.NAME,
      User.columnLetter('pp'),
      User.columnLetter('pp'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  async getSheetScoreIds (mods) {
    console.info(`MorFacade::getSheetScoreIds (${mods})`) // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS[mods].NAME,
      Score.columnLetter('scoreId'),
      Score.columnLetter('scoreId'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  async getSheetUsernames () {
    console.info('MorFacade::getSheetUsernames ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.USERS.NAME,
      User.columnLetter('username'),
      User.columnLetter('username'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  async getSheetUser (username) {
    console.info(`MorFacade::getSheetUser (${username})`) // TODO: replace
    const usernames = await this.getSheetUsernames()
    const index = usernames.map(u => u.toLowerCase()).indexOf(username.toLowerCase())
    if (index !== -1) {
      const response = await this.#SHEETS.getRange(
        Config.SHEETS.USERS.NAME,
          `${User.columnLetter('userId')}${index + User.START_ROW}`,
          `${User.columnLetter('pfpLink')}${index + User.START_ROW}`,
          'FORMATTED_VALUE',
          'ROWS'
      )
      const u = response.values[0]
      return new User(u[0], u[1], u[2], u[3], u[4], u[5], u[6], u[7], u[8], u[9], u[10], u[11], u[12], u[13])
    } else {
      throw new NotFoundError(`${Config.SHEETS.SPREADSHEET.NAME} sheet search returned no results! username=${username}`)
    }
  }

  async addSheetUser (username) {
    console.info(`MorFacade::addSheetUser (${username})`) // TODO: replace
    const [user, sheetUsers] = await Promise.all([this.getOsuUser(username), this.getSheetUsers()])
    if (sheetUsers.map(u => u.userId).includes(user.userId)) throw new AlreadyExistsError(`${Config.SHEETS.SPREADSHEET.NAME} sheet already contains that user! username=${username}`)
    const ppVals = sheetUsers.map(u => u.pp)
    ppVals.push(user.pp)
    ppVals.sort((a, b) => { return parseInt(b) - parseInt(a) })
    const userIndex = ppVals.indexOf(user.pp)
    // Append instead of assert if user is to be added to the end of sheet
    if (user.pp === '0' || userIndex + 1 === ppVals.length) {
      await this.#SHEETS.appendRange([user.toArray()], Config.SHEETS.USERS.NAME, 'RAW', 'INSERT_ROWS')
    } else {
      await this.#SHEETS.insertDimension(Config.SHEETS.USERS.ID, 'ROWS', userIndex + 1, userIndex + 2)
      await this.#SHEETS.updateRange([user.toArray()], Config.SHEETS.USERS.NAME, `${User.columnLetter('userId')}${userIndex + 2}`, `${User.columnLetter('pfpLink')}${userIndex + 2}`, 'RAW')
    }
    return user
  }

  async deleteSheetUser (username) {
    console.info(`MorFacade::deleteSheetUser (${username})`) // TODO: replace
    const users = await this.getSheetUsers()
    const userIndex = users.map(u => { return u.username.toLowerCase() }).indexOf(username.toLowerCase())
    if (userIndex === -1) throw new NotFoundError(`${Config.SHEETS.SPREADSHEET.NAME} sheet returned no results! username=${username}`)
    await this.#SHEETS.deleteDimension(Config.SHEETS.USERS.ID, 'ROWS', userIndex + 1, userIndex + 2)
    return users[userIndex]
  }

  async getSheetScores (mods) {
    console.info(`MorFacade::getSheetScores (${mods})`) // TODO: replace
    if (!Mods.isValidModString(mods)) {
      throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
      `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
    }
    const response = await this.#SHEETS.getRange(
      Config.SHEETS[mods].NAME,
      Score.columnLetter('scoreId'),
      Score.columnLetter('beatmapImgLink'),
      'FORMATTED_VALUE',
      'ROWS'
    )
    const ret = []
    response.values.slice(1).forEach(a => {
      const s = new Score(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9])
      ret.push(s)
    })
    return ret
  }

  async getOsuScore (scoreId) {
    console.info(`MorFacade::getOsuScore (${scoreId})`) // TODO: replace
    const data = await this.#OSU.getScore(scoreId)
    return new Score(
      data.id.toString(),
      data.user.id.toString(),
      data.user.username,
      `${data.beatmapset.artist} - ${data.beatmapset.title} [${data.beatmap.version}]`,
      Mods.parseModKey(data.mods),
      (data.accuracy * 100).toFixed(2),
      data.pp === null ? '0' : data.pp.toFixed(3),
      data.beatmap.difficulty_rating.toFixed(2),
      data.created_at.replace('Z', '+00:00'),
      data.beatmapset.covers['list@2x']
    )
  }

  async addSubmittedScore (scoreId) {
    console.info(`MorFacade::addSubmittedScore (${scoreId})`) // TODO: replace
    const submittedScores = await this.getSheetScores(Mods.SS)
    const ssIndex = submittedScores.map(ss => { return ss.scoreId }).indexOf(scoreId)
    if (ssIndex !== -1) throw new AlreadyExistsError(`${Config.SHEETS.SS.NAME} sheet already contains that score! scoreId=${scoreId}`)
    const score = await this.getOsuScore(scoreId)
    await this.#SHEETS.appendRange(
      [score.toArray()],
      Config.SHEETS.SS.NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return score
  }

  async deleteSubmittedScore (scoreId) {
    console.info(`MorFacade::deleteScore (${scoreId})`) // TODO: replace
    if (!Utils.isPositiveNumericString(scoreId)) throw new TypeError(`scoreId must be a positive number string! Val=${scoreId}`)
    const submittedScores = await this.getSheetScores(Mods.SS)
    const ssIndex = submittedScores.map(ss => { return ss.scoreId }).indexOf(scoreId)
    if (ssIndex === -1) throw new NotFoundError(`${Config.SHEETS.SPREADSHEET.NAME} sheet returned no results! scoreId=${scoreId}`)
    const mods = Mods.parseModKey(submittedScores[ssIndex].mods)
    const modScores = await this.getSheetScores(mods)
    const msIndex = modScores.map(ms => { return ms.scoreId }).indexOf(scoreId)
    let ret = {}
    // Score is in both sheets
    if (msIndex !== -1 && ssIndex !== -1) {
      await this.#SHEETS.deleteMultipleDimensions(
        [Config.SHEETS.SS.ID, Config.SHEETS[mods].ID],
        ['ROWS', 'ROWS'],
        [ssIndex + 1, msIndex + 1],
        [ssIndex + 2, msIndex + 2]
      )
      ret = submittedScores[ssIndex]
    // Score is in modsheet
    } else if (msIndex !== -1) {
      await this.#SHEETS.deleteDimension(Config.SHEETS[mods].ID, 'ROWS', msIndex + 1, msIndex + 2)
      ret = modScores[msIndex]
    // Score is in submitted scores sheet
    } else if (ssIndex !== -1) {
      await this.#SHEETS.deleteDimension(Config.SHEETS.SS.ID, 'ROWS', ssIndex + 1, ssIndex + 2)
      ret = submittedScores[ssIndex]
    } else {
      throw new NotFoundError(`${Config.SHEETS.SPREADSHEET.NAME} sheet returned no results! scoreId=${scoreId}`)
    }
    return ret
  }

  async replaceSheetScores (mods, scores) {
    console.info(`MorFacade::replaceSheetScores (${mods}, array of ${scores.length} scores)`) // TODO: replace
    if (!Mods.isValidModString(mods)) {
      throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
      `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
    }
    if (!Utils.isScoreArray(scores)) throw new TypeError(`scores must be a valid Score array! Val=${scores}`)
    const ret = await this.#SHEETS.deleteDimension(Config.SHEETS[mods].ID, 'ROWS', 1, -1)
    await this.#SHEETS.appendRange(
      scores.map(s => s.toArray()),
      Config.SHEETS[mods].NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return ret
  }

  async replaceUsers (users) {
    console.info(`MorFacade::replaceUsers (array of ${users.length} users)`) // TODO: replace
    if (!Utils.isUserArray(users)) throw new TypeError(`users must be a valid User array! Val=${users}`)
    const ret = await this.#SHEETS.deleteDimension(Config.SHEETS.USERS.ID, 'ROWS', 1, -1)
    await this.#SHEETS.appendRange(
      users.map(u => u.toArray()),
      Config.SHEETS.USERS.NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return ret
  }

  async wipeSheet (mods) {
    console.info(`MorFacade::wipeSheet (${mods})`) // TODO: replace
    const ret = await this.#SHEETS.deleteDimension(Config.SHEETS[mods].ID, 'ROWS', 1)
    await this.#SHEETS.appendRange([['']], Config.SHEETS[mods].NAME, 'RAW', 'INSERT_ROWS')
    return ret
  }

  async copyFile (fileId, name) {
    console.info(`MorFacade::copyFile (${fileId}, ${name})`)
    const ret = await this.#DRIVE.copyFile(fileId, name)
    return ret
  }
}
