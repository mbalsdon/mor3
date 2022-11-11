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

/**
 * MOR3 client - Wraps osu!API v2 client, Google Sheets API v4 client, and Google Drive API v3 client
 * @see {@link OsuWrapper}
 * @see {@link SheetsWrapper}
 * @see {@link DriveWrapper}
 */
export default class MorFacade {
  #OSU
  #SHEETS
  #DRIVE

  /**
   * Constructs the client.
   * Not meant to be called directly - use MorFacade.build() instead!
   * @see {@link build}
   * @param {OsuWrapper} osuWrapper
   * @param {SheetsWrapper} sheetsWrapper
   * @param {DriveWrapper} driveWrapper
   * @throws {@link ConstructorError} if wrapper doesn't exist
   */
  constructor (osuWrapper, sheetsWrapper, driveWrapper) {
    if (typeof osuWrapper === 'undefined') throw new ConstructorError('osuWrapper is undefined! NOTE: Constructor cannot be called directly.')
    if (typeof sheetsWrapper === 'undefined') throw new ConstructorError('sheetsWrapper is undefined! NOTE: Constructor cannot be called directly.')
    if (typeof driveWrapper === 'undefined') throw new ConstructorError('driveWrapper is undefined! NOTE: Constructor cannot be called directly.')
    this.#OSU = osuWrapper
    this.#SHEETS = sheetsWrapper
    this.#DRIVE = driveWrapper
  }

  /**
   * Initializes OsuWrapper, SheetsWrapper, and DriveWrapper, then constructs MorFacade object
   * @return {Promise<MorFacade>}
   * @example
   *  const mor = await MorFacade.build()
   */
  static async build () {
    console.info('MorFacade::build ()') // TODO: replace
    const [osuWrapper, sheetsWrapper, driveWrapper] = await Promise.all([OsuWrapper.build(), SheetsWrapper.build(), DriveWrapper.build()])
    return new MorFacade(osuWrapper, sheetsWrapper, driveWrapper)
  }

  /**
   * Retrieves mor3 spreadsheet metadata; makes up to 1 Google API request
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets} (Google Sheets API v4 Spreadsheets object)
   * @return {Promise<*>} Google Sheets API v4 Spreadsheets object
   * @example
   *  const mor = await MorFacade.build()
   *  const metadata = await mor.getSheetMetadata()
   *  console.log(metadata.sheets[0])
   */
  async getSheetMetadata () {
    console.info('MorFacade::getSheetMetadata ()') // TODO: replace
    const response = await this.#SHEETS.getMetadata(Config.SHEETS.SPREADSHEET.ID)
    return response
  }

  /**
   * Retrieves Last Updated tag from mor3 spreadsheet; makes up to 1 Google API request
   * @return {Promise<string>} mor3 spreadsheet Last Updated tag (ISO-8601)
   * @example
   *  const mor = await MorFacade.build()
   *  const lastUpdated = await mor.getSheetLastUpdated()
   *  console.log(lastUpdated)
   */
  async getSheetLastUpdated () {
    console.info('MorFacade::getSheetLastUpdated ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS.MAIN.NAME,
      Config.LAST_UPDATE_CELL,
      Config.LAST_UPDATE_CELL,
      'FORMATTED_VALUE',
      'ROWS')
    return response.values[0][0]
  }

  /**
   * Sets Last Updated tag on mor3 spreadsheet; makes up to 1 Google API request
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse} (Google Sheets API v4 UpdateValuesResponse object)
   * @param {string} date ISO-8601 date string
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 UpdateValuesResponse object
   * @example
   *  const mor = await MorFacade.build()
   *  await mor.setSheetLastUpdated('2022-11-10T06:28:29+00:00')
   */
  async setSheetLastUpdated (date) {
    console.info(`MorFacade::setSheetLastUpdated (${date})`) // TODO: replace
    if (!Utils.isValidDate(date)) throw new TypeError(`date must be a valid date string! Val=${date}`)
    const response = await this.#SHEETS.updateRange(
      Config.SHEETS.SPREADSHEET.ID,
      [[date]],
      Config.SHEETS.MAIN.NAME,
      Config.LAST_UPDATE_CELL,
      Config.LAST_UPDATE_CELL,
      'RAW'
    )
    return response
  }

  /**
   * Retrieves osu! user data from osu!API v2; makes up to 1 osu!API request
   * @param {string} user user's name if searchParam is 'username', user's ID if searchParam is 'id'
   * @param {('username'|'id')} searchParam whether to query the API by username or user ID
   * @return {Promise<User>} User object
   * @example
   *  const mor = await MorFacade.build()
   *  const user = await mor.getOsuUser('6385683', 'id')
   *  console.log(user.pp)
   */
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

  /**
   * Retrieves osu! user's top plays/firsts from osu!API v2; makes up to 1 osu!API request
   * @param {number} userId user's ID
   * @param {('best'|'firsts')} type whether to fetch the user's top plays or firsts
   * @return {Promise<Score[]>} array of Score objects
   * @example
   *  const mor = await MorFacade.build()
   *  const myFirsts = await mor.getOsuUserScores('6385683', 'firsts')
   *  console.log(myFirsts.map(s => s.scoreId))
   */
  async getOsuUserScores (userId, type = 'best') {
    console.info(`MorFacade::getOsuUserScores (${userId}, ${type})`) // TODO: replace
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

  /**
   * Retrieves list of users from mor3 sheet; makes up to 1 Google API request
   * @return {Promise<User[]>} array of User objects
   * @example
   *  const mor = await MorFacade.build()
   *  const users = await mor.getSheetUsers()
   *  console.log(users[0].userId)
   */
  async getSheetUsers () {
    console.info('MorFacade::getSheetUsers ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.SPREADSHEET.ID,
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

  /**
   * Retrieves list of user IDs from mor3 sheet; makes up to 1 Google API request
   * @return {Promise<string[]>} array of user IDs
   * @example
   *  const mor = await MorFacade.build()
   *  const userIDs = await mor.getSheetUserIds()
   *  console.log(userIDs[0])
   */
  async getSheetUserIds () {
    console.info('MorFacade::getSheetUserIds ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS.USERS.NAME,
      User.columnLetter('userId'),
      User.columnLetter('userId'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  /**
   * Retrieves list of score IDs from mor3 sheet; makes up to 1 Google API request
   * @param {string} mods mod string
   * @throws {@link InvalidModsError} if mod string is invalid
   * @return {Promise<string[]>} array of score IDs
   * @example
   *  const mor = await MorFacade.build()
   *  const nmScoreIds = await mor.getSheetScoreIds(Mods.NM)
   *  console.log(nmScoreIds[0])
   */
  async getSheetScoreIds (mods) {
    console.info(`MorFacade::getSheetScoreIds (${mods})`) // TODO: replace
    if (!Mods.isValidModString(mods)) {
      throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
      `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
    }
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS[mods].NAME,
      Score.columnLetter('scoreId'),
      Score.columnLetter('scoreId'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  /**
   * Retrieves list of usernames from mor3 sheet; makes up to 1 Google API request
   * @return {Promise<string[]>} array of usernames
   * @example
   *  const mor = await MorFacade.build()
   *  const usernames = await mor.getSheetUsernames()
   *  console.log(usernames[0])
   */
  async getSheetUsernames () {
    console.info('MorFacade::getSheetUsernames ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS.USERS.NAME,
      User.columnLetter('username'),
      User.columnLetter('username'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  /**
   * Retrieves a user from the mor3 sheet; makes up to 2 Google API requests
   * @param {string} username username of the user
   * @throws {@link NotFoundError} if user could not be found
   * @return {Promise<User>} User object
   * @example
   *  const mor = await MorFacade.build()
   *  const user = await mor.getSheetUser('spreadnuts')
   *  console.log(user.pfpLink)
   */
  async getSheetUser (username) {
    console.info(`MorFacade::getSheetUser (${username})`) // TODO: replace
    const usernames = await this.getSheetUsernames()
    const index = usernames.map(u => u.toLowerCase()).indexOf(username.toLowerCase())
    if (index !== -1) {
      const response = await this.#SHEETS.getRange(
        Config.SHEETS.SPREADSHEET.ID,
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

  /**
   * Inserts user into the mor3 sheet (sorted by pp); makes up to 1 osu!API request and up to 3 Google API requests
   * @param {string} username username of the user
   * @throws {@link AlreadyExistsError} if user was already added
   * @return {Promise<User>} User object for the added user
   * @example
   *  const mor = await MorFacade.build()
   *  try {
   *    const addedUser = await mor.addSheetUser('spreadnuts')
   *    console.log(`Added user ${addedUser.username}!`)
   *  } catch (error) {
   *    if (error instanceof AlreadyExistsError) console.log('User already added!')
   *    else throw error
   *  }
   */
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
      await this.#SHEETS.appendRange(
        Config.SHEETS.SPREADSHEET.ID,
        [user.toArray()],
        Config.SHEETS.USERS.NAME,
        'RAW',
        'INSERT_ROWS'
      )
    } else {
      await this.#SHEETS.insertDimension(
        Config.SHEETS.SPREADSHEET.ID,
        Config.SHEETS.USERS.ID,
        'ROWS',
        userIndex + 1,
        userIndex + 2
      )
      await this.#SHEETS.updateRange(
        Config.SHEETS.SPREADSHEET.ID,
        [user.toArray()],
        Config.SHEETS.USERS.NAME,
        `${User.columnLetter('userId')}${userIndex + 2}`,
        `${User.columnLetter('pfpLink')}${userIndex + 2}`, 'RAW'
      )
    }
    return user
  }

  /**
   * Deletes user from the mor3 sheet; makes up to 2 Google API requests
   * @param {string} username username of the user
   * @throws {@link NotFoundError} if user was not found
   * @return {Promise<User>} User object for the deleted user
   * @example
   *  const mor = await MorFacade.build()
   *  try {
   *    const deletedUser = await mor.deleteSheetUser('spreadnuts')
   *    console.log(`Deleted user ${deletedUser.username}!`)
   *  } catch (error) {
   *    if (error instanceof NotFoundError) console.log('User not in sheet!')
   *    else throw error
   *  }
   */
  async deleteSheetUser (username) {
    console.info(`MorFacade::deleteSheetUser (${username})`) // TODO: replace
    const users = await this.getSheetUsers()
    const userIndex = users.map(u => { return u.username.toLowerCase() }).indexOf(username.toLowerCase())
    if (userIndex === -1) throw new NotFoundError(`${Config.SHEETS.SPREADSHEET.NAME} sheet returned no results! username=${username}`)
    await this.#SHEETS.deleteDimension(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS.USERS.ID,
      'ROWS',
      userIndex + 1,
      userIndex + 2
    )
    return users[userIndex]
  }

  /**
   * Retrieves scores from the mor3 sheet; makes up to 1 Google API request
   * @param {string} mods mod string
   * @throws {@link InvalidModsError} if mod string is invalid
   * @return {Promise<Score[]>} array of Score objects
   * @example
   *  const mor = await MorFacade.build()
   *  const scores = await mor.getSheetScores(Mods.HDHR)
   *  console.log(scores[3].beatmapImgLink)
   */
  async getSheetScores (mods) {
    console.info(`MorFacade::getSheetScores (${mods})`) // TODO: replace
    if (!Mods.isValidModString(mods)) {
      throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
      `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
    }
    const response = await this.#SHEETS.getRange(
      Config.SHEETS.SPREADSHEET.ID,
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

  /**
   * Retrieves osu! score; makes up to 1 osu!API request
   * @param {number} scoreId ID of the score
   * @return {Promise<Score>} Score object
   * @example
   *  const mor = await MorFacade.build()
   *  const score = await osu.getScore('4083979228')
   *  console.log(score.mods)
   */
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

  /**
   * Adds an osu! score to the mor3 sheet; makes up to 1 Google API request
   * @param {string} scoreId ID of the score
   * @throws {@link AlreadyExistsError} if score already exists in the sheet
   * @return {Promise<Score>} Score object for the added score
   * @example
   *  const mor = await MorFacade.build()
   *  try {
   *    const addedScore = await mor.addSubmittedScore('4083979228')
   *    console.log(`Added score: ${addedScore}`)
   *  } catch (error) {
   *    if (error instanceof AlreadyExistsError) console.log('Score already added!')
   *    else throw error
   *  }
   */
  async addSubmittedScore (scoreId) {
    console.info(`MorFacade::addSubmittedScore (${scoreId})`) // TODO: replace
    const submittedScores = await this.getSheetScores(Mods.SS)
    const ssIndex = submittedScores.map(ss => { return ss.scoreId }).indexOf(scoreId)
    if (ssIndex !== -1) throw new AlreadyExistsError(`${Config.SHEETS.SS.NAME} sheet already contains that score! scoreId=${scoreId}`)
    const score = await this.getOsuScore(scoreId)
    await this.#SHEETS.appendRange(
      Config.SHEETS.SPREADSHEET.ID,
      [score.toArray()],
      Config.SHEETS.SS.NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return score
  }

  /**
   * Deletes an osu! score from the mor3 sheet; makes up to 3 Google API requests
   * @param {string} scoreId ID of the score
   * @throws {@link TypeError} if parameters are invalid
   * @throws {@link NotFoundError} if score could not be found in the sheet
   * @return {Promise<Score>} Score object of the deleted score
   * @example
   *  const mor = await MorFacade.build()
   *  try {
   *    const deletedScore = await mor.deleteSubmittedScore('4083979228')
   *    console.log(`Deleted score: ${deletedScore}`)
   *  } catch (error) {
   *    if (error instanceof NotFoundError) console.log('Score not found!')
   *    else throw error
   *  }
   */
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
        Config.SHEETS.SPREADSHEET.ID,
        [Config.SHEETS.SS.ID, Config.SHEETS[mods].ID],
        ['ROWS', 'ROWS'],
        [ssIndex + 1, msIndex + 1],
        [ssIndex + 2, msIndex + 2]
      )
      ret = submittedScores[ssIndex]
    // Score is in modsheet
    } else if (msIndex !== -1) {
      await this.#SHEETS.deleteDimension(
        Config.SHEETS.SPREADSHEET.ID,
        Config.SHEETS[mods].ID,
        'ROWS',
        msIndex + 1,
        msIndex + 2
      )
      ret = modScores[msIndex]
    // Score is in submitted scores sheet
    } else if (ssIndex !== -1) {
      await this.#SHEETS.deleteDimension(
        Config.SHEETS.SPREADSHEET.ID,
        Config.SHEETS.SS.ID,
        'ROWS',
        ssIndex + 1,
        ssIndex + 2
      )
      ret = submittedScores[ssIndex]
    } else {
      throw new NotFoundError(`${Config.SHEETS.SPREADSHEET.NAME} sheet returned no results! scoreId=${scoreId}`)
    }
    return ret
  }

  /**
   * Replaces all scores in a mor3 sheet with new ones; makes up to 2 Google API requests
   * @param {string} mods mod string
   * @param {Score[]} scores scores to be added to the sheet
   * @throws {@link InvalidModsError} if mod string is invalid
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<Score[]>} newly added scores (array of Score objects)
   * @example
   *  const mor = await MorFacade.build()
   *  const myTops = await mor.getOsuUserScores('6385683', 'best')
   *  const myDtTops = myTops.filter(t => t.mods === Mods.DT)
   *  await mor.replaceSheetScores(Mods.DT, myDtTops)
   */
  async replaceSheetScores (mods, scores) {
    console.info(`MorFacade::replaceSheetScores (${mods}, array of ${scores.length} scores)`) // TODO: replace
    if (!Mods.isValidModString(mods)) {
      throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
      `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
    }
    if (!Utils.isScoreArray(scores)) throw new TypeError(`scores must be a valid Score array! Val=${scores}`)
    await this.#SHEETS.deleteDimension(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS[mods].ID,
      'ROWS',
      1,
      -1
    )
    await this.#SHEETS.appendRange(
      Config.SHEETS.SPREADSHEET.ID,
      scores.map(s => s.toArray()),
      Config.SHEETS[mods].NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return scores
  }

  /**
   * Replaces all users in a mor3 sheet with new ones; makes up to 2 Google API requests
   * @param {User[]} users users to be added to the sheet
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<User[]>} newly added users (array of User objects)
   * @example
   *  const mor = await MorFacade.build()
   *  const users = await Promise.all([mor.getOsuUser('spreadnuts', 'username'), mor.getOsuUser('2', 'id')])
   *  await mor.replaceUsers(users)
   */
  async replaceUsers (users) {
    console.info(`MorFacade::replaceUsers (array of ${users.length} users)`) // TODO: replace
    if (!Utils.isUserArray(users)) throw new TypeError(`users must be a valid User array! Val=${users}`)
    await this.#SHEETS.deleteDimension(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS.USERS.ID,
      'ROWS',
      1,
      -1
    )
    await this.#SHEETS.appendRange(
      Config.SHEETS.SPREADSHEET.ID,
      users.map(u => u.toArray()),
      Config.SHEETS.USERS.NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return users
  }

  /**
   * Deletes all scores in a mor3 sheet; makes up to 2 Google API requests
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate} (Google Sheets API v4 batchUpdate Response object)
   * @param {string} mods mod string
   * @throws {@link InvalidModsError} if mod string is invalid
   * @return {Promise<*>} Google Sheets API v4 batchUpdate Response object
   * @example
   *  const mor = await MorFacade.build()
   *  await mor.wipeSheet(Mods.EZHDDTFL)
   */
  async wipeSheet (mods) {
    console.info(`MorFacade::wipeSheet (${mods})`) // TODO: replace
    if (!Mods.isValidModString(mods)) {
      throw new InvalidModsError(`mods must be a valid mod string! Val=${mods}\n` +
      `Valid mod strings: ${Mods.validModStrings().join(' ')}`)
    }
    const ret = await this.#SHEETS.deleteDimension(
      Config.SHEETS.SPREADSHEET.ID,
      Config.SHEETS[mods].ID,
      'ROWS',
      1,
      -1
    )
    await this.#SHEETS.appendRange(
      Config.SHEETS.SPREADSHEET.ID,
      [['']],
      Config.SHEETS[mods].NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return ret
  }

  /**
   * Copies a Google Drive file into the mor3 backup folder; makes up to 1 Google API request
   * @see {@link https://developers.google.com/drive/api/v3/reference/files#resource} (Google Drive API v3 Files object)
   * @param {string} fileId the ID of the file to copy
   * @param {string} name the name of the new copied file
   * @return {Promise<*>} Google Drive API v3 Files object
   * @example
   *  const mor = await MorFacade.build()
   *  await mor.backupFile('1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM', 'My Backup File')
   */
  async backupFile (fileId, name) {
    console.info(`MorFacade::backupFile (${fileId}, ${name})`)
    const ret = await this.#DRIVE.copyFile(fileId, name, Config.DRIVE.BACKUP_FOLDER_ID)
    return ret
  }
}
