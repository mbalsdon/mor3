import MorConfig from './MorConfig.js'
import DriveWrapper from './DriveWrapper.js'
import { AlreadyExistsError, ConstructorError, InvalidModsError, NotFoundError } from './MorErrors.js'
import Mods from './Mods.js'
import OsuWrapper from './OsuWrapper.js'
import MorScore from './MorScore.js'
import SheetsWrapper from './SheetsWrapper.js'
import MorUser from './MorUser.js'
import MorUtils from './MorUtils.js'

import 'dotenv/config'

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
   * Retrieves osu! user data from osu!API v2; makes up to 1 osu!API request
   * @param {string} user user's name if searchParam is 'username', user's ID if searchParam is 'id'
   * @param {('username'|'id')} searchParam whether to query the API by username or user ID
   * @return {Promise<MorUser>} MorUser object
   * @example
   *  const mor = await MorFacade.build()
   *  const user = await mor.getOsuUser('6385683', 'id')
   *  console.log(user.pp)
   */
  async getOsuUser (username, searchParam = 'username') {
    console.info(`MorFacade::getOsuUser (${username})`) // TODO: replace
    const response = await this.#OSU.getUser(username, searchParam)
    return new MorUser([
      response.id.toString(),
      response.username,
      response.playstyle === null ? 'null' : response.playstyle.map(p => { return p[0].toUpperCase() + p.substring(1) }).join(', '),
      response.country.code,
      String(response.statistics.global_rank),
      String(response.statistics.country_rank),
      response.statistics.pp === null ? '0' : response.statistics.pp.toFixed(3),
      response.statistics.hit_accuracy.toFixed(2),
      Math.round(response.statistics.play_time / 3600).toString(),
      '-1', '-1', '-1', '-1', '-1', '-1',
      response.avatar_url,
      'FALSE'
    ])
  }

  /**
   * Retrieves osu! score; makes up to 1 osu!API request
   * @param {string} scoreId ID of the score
   * @return {Promise<MorScore>} MorScore object
   * @example
   *  const mor = await MorFacade.build()
   *  const score = await osu.getScore('4083979228')
   *  console.log(score.mods)
   */
  async getOsuScore (scoreId) {
    console.info(`MorFacade::getOsuScore (${scoreId})`) // TODO: replace
    const data = await this.#OSU.getScore(scoreId)
    return new MorScore([
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
    ])
  }

  /**
   * Retrieves osu! user's top plays/firsts from osu!API v2; makes up to 1 osu!API request
   * @param {string} userId user's ID
   * @param {('best'|'firsts')} type whether to fetch the user's top plays or firsts
   * @return {Promise<MorScore[]>} array of MorScore objects
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
      ret.push(new MorScore([
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
      ]))
    }
    return ret
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
    const response = await this.#SHEETS.getMetadata(MorConfig.SHEETS.SPREADSHEET.ID)
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
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS.MAIN.NAME,
      MorConfig.LAST_UPDATE_CELL,
      MorConfig.LAST_UPDATE_CELL,
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
    if (!MorUtils.isValidDate(date)) throw new TypeError(`date must be a valid date string! Val=${date}`)
    const response = await this.#SHEETS.updateRange(
      MorConfig.SHEETS.SPREADSHEET.ID,
      [[date]],
      MorConfig.SHEETS.MAIN.NAME,
      MorConfig.LAST_UPDATE_CELL,
      MorConfig.LAST_UPDATE_CELL,
      'RAW'
    )
    return response
  }

  /**
   * Retrieves a user from the mor3 sheet; makes up to 2 Google API requests
   * @param {string} username username of the user
   * @throws {@link NotFoundError} if user could not be found
   * @return {Promise<MorUser>} MorUser object
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
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS.USERS.NAME,
        `${MorUser.columnLetter('userId')}${index + MorUser.START_ROW}`,
        `${MorUser.columnLetter('autotrack')}${index + MorUser.START_ROW}`,
        'FORMATTED_VALUE',
        'ROWS'
      )
      const userArray = response.values[0]
      return new MorUser(userArray)
    } else {
      throw new NotFoundError(`${MorConfig.SHEETS.SPREADSHEET.NAME} sheet search returned no results! username=${username}`)
    }
  }

  /**
   * Retrieves user's sheet rank from the mor3 sheet; makes up to 1 Google API request
   * @param {string} username username of the user
   * @throws {@link NotFoundError} if user could not be found
   * @return {Promise<number>} sheet rank of the user
   * @example
   *  const mor = await MorFacade.build()
   *  const rank = await mor.getSheetUserRank('spreadnuts')
   *  console.log(rank)
   */
  async getSheetUserRank (username) {
    console.info(`MorFacade::getSheetUserRank (${username})`) // TODO: replace
    const usernames = await this.getSheetUsernames()
    const index = usernames.map(u => u.toLowerCase()).indexOf(username.toLowerCase())
    if (index === -1) throw new NotFoundError(`${MorConfig.SHEETS.SPREADSHEET.NAME} sheet search returned no results! username=${username}`)
    else return index + 1
  }

  /**
   * Retrieves list of users from mor3 sheet; makes up to 1 Google API request
   * @return {Promise<MorUser[]>} array of MorUser objects
   * @example
   *  const mor = await MorFacade.build()
   *  const users = await mor.getSheetUsers()
   *  console.log(users[0].userId)
   */
  async getSheetUsers () {
    console.info('MorFacade::getSheetUsers ()') // TODO: replace
    const response = await this.#SHEETS.getRange(
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS.USERS.NAME,
      MorUser.columnLetter('userId'),
      MorUser.columnLetter('autotrack'),
      'FORMATTED_VALUE',
      'ROWS'
    )
    const ret = []
    response.values.slice(1).forEach(v => {
      const user = new MorUser(v)
      ret.push(user)
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
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS.USERS.NAME,
      MorUser.columnLetter('userId'),
      MorUser.columnLetter('userId'),
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
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS.USERS.NAME,
      MorUser.columnLetter('username'),
      MorUser.columnLetter('username'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  /**
   * Retrieves scores from the mor3 sheet; makes up to 1 Google API request
   * @param {string} mods mod string
   * @throws {@link InvalidModsError} if mod string is invalid
   * @return {Promise<MorScore[]>} array of MorScore objects
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
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS[mods].NAME,
      MorScore.columnLetter('scoreId'),
      MorScore.columnLetter('beatmapImgLink'),
      'FORMATTED_VALUE',
      'ROWS'
    )
    const ret = []
    response.values.slice(1).forEach(a => {
      const s = new MorScore(a)
      ret.push(s)
    })
    return ret
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
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS[mods].NAME,
      MorScore.columnLetter('scoreId'),
      MorScore.columnLetter('scoreId'),
      'FORMATTED_VALUE',
      'COLUMNS'
    )
    return response.values[0].slice(1)
  }

  /**
   * Inserts user into the mor3 sheet (sorted by pp); makes up to 1 osu!API request and up to 3 Google API requests
   * @param {string} username username of the user
   * @param {bool} autotrack whether or not the user's tops/firsts will be automatically tracked
   * @throws {@link TypeError} if parameters are invalid
   * @throws {@link AlreadyExistsError} if user was already added
   * @return {Promise<MorUser>} MorUser object for the added user
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
  async addSheetUser (username, autotrack) {
    console.info(`MorFacade::addSheetUser (${username}, ${autotrack})`) // TODO: replace
    if (!MorUtils.isBooleanString(autotrack)) throw new TypeError(`autotrack must either be TRUE or FALSE! Val=${autotrack}`)
    const [user, sheetUsers] = await Promise.all([this.getOsuUser(username), this.getSheetUsers()])
    user.autotrack = autotrack
    if (sheetUsers.map(u => u.userId).includes(user.userId)) throw new AlreadyExistsError(`${MorConfig.SHEETS.SPREADSHEET.NAME} sheet already contains that user! username=${username}`)
    const ppVals = sheetUsers.map(u => u.pp)
    ppVals.push(user.pp)
    ppVals.sort((a, b) => { return parseInt(b) - parseInt(a) })
    const userIndex = ppVals.indexOf(user.pp)
    // Append instead of assert if user is to be added to the end of sheet
    if (user.pp === '0' || userIndex + 1 === ppVals.length || user.autotrack === 'FALSE') {
      await this.#SHEETS.appendRange(
        MorConfig.SHEETS.SPREADSHEET.ID,
        [user.toArray()],
        MorConfig.SHEETS.USERS.NAME,
        'RAW',
        'INSERT_ROWS'
      )
    } else {
      await this.#SHEETS.insertDimension(
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS.USERS.ID,
        'ROWS',
        userIndex + 1,
        userIndex + 2
      )
      await this.#SHEETS.updateRange(
        MorConfig.SHEETS.SPREADSHEET.ID,
        [user.toArray()],
        MorConfig.SHEETS.USERS.NAME,
        `${MorUser.columnLetter('userId')}${userIndex + 2}`,
        `${MorUser.columnLetter('autotrack')}${userIndex + 2}`, 'RAW'
      )
    }
    return user
  }

  /**
   * Deletes user from the mor3 sheet; makes up to 2 Google API requests
   * @param {string} username username of the user
   * @throws {@link NotFoundError} if user was not found
   * @return {Promise<MorUser>} MorUser object for the deleted user
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
    if (userIndex === -1) throw new NotFoundError(`${MorConfig.SHEETS.SPREADSHEET.NAME} sheet returned no results! username=${username}`)
    await this.#SHEETS.deleteDimension(
      MorConfig.SHEETS.SPREADSHEET.ID,
      MorConfig.SHEETS.USERS.ID,
      'ROWS',
      userIndex + 1,
      userIndex + 2
    )
    return users[userIndex]
  }

  /**
   * Adds an osu! score to the mor3 sheet; makes up to 1 Google API request
   * @param {string} scoreId ID of the score
   * @throws {@link AlreadyExistsError} if score already exists in the sheet
   * @return {Promise<MorScore>} MorScore object for the added score
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
    if (ssIndex !== -1) throw new AlreadyExistsError(`${MorConfig.SHEETS.SS.NAME} sheet already contains that score! scoreId=${scoreId}`)
    const score = await this.getOsuScore(scoreId)
    await this.getSheetUserRank(score.username)
    await this.#SHEETS.appendRange(
      MorConfig.SHEETS.SPREADSHEET.ID,
      [score.toArray()],
      MorConfig.SHEETS.SS.NAME,
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
   * @return {Promise<MorScore>} MorScore object of the deleted score
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
    if (!MorUtils.isPositiveNumericString(scoreId)) throw new TypeError(`scoreId must be a positive number string! Val=${scoreId}`)
    const submittedScores = await this.getSheetScores(Mods.SS)
    const ssIndex = submittedScores.map(ss => { return ss.scoreId }).indexOf(scoreId)
    if (ssIndex === -1) throw new NotFoundError(`${MorConfig.SHEETS.SPREADSHEET.NAME} sheet returned no results! scoreId=${scoreId}`)
    const mods = Mods.parseModKey(submittedScores[ssIndex].mods)
    const modScores = await this.getSheetScores(mods)
    const msIndex = modScores.map(ms => { return ms.scoreId }).indexOf(scoreId)
    let ret = {}
    // Score is in both sheets
    if (msIndex !== -1 && ssIndex !== -1) {
      await this.#SHEETS.deleteMultipleDimensions(
        MorConfig.SHEETS.SPREADSHEET.ID,
        [MorConfig.SHEETS.SS.ID, MorConfig.SHEETS[mods].ID],
        ['ROWS', 'ROWS'],
        [ssIndex + 1, msIndex + 1],
        [ssIndex + 2, msIndex + 2]
      )
      ret = submittedScores[ssIndex]
    // Score is in modsheet
    } else if (msIndex !== -1) {
      await this.#SHEETS.deleteDimension(
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS[mods].ID,
        'ROWS',
        msIndex + 1,
        msIndex + 2
      )
      ret = modScores[msIndex]
    // Score is in submitted scores sheet
    } else if (ssIndex !== -1) {
      await this.#SHEETS.deleteDimension(
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS.SS.ID,
        'ROWS',
        ssIndex + 1,
        ssIndex + 2
      )
      ret = submittedScores[ssIndex]
    } else {
      throw new NotFoundError(`${MorConfig.SHEETS.SPREADSHEET.NAME} sheet returned no results! scoreId=${scoreId}`)
    }
    return ret
  }

  /**
   * Replaces all users in a mor3 sheet with new ones; makes up to 2 Google API requests
   * @param {MorUser[]} users users to be added to the sheet
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<MorUser[]>} newly added users (array of MorUser objects)
   * @example
   *  const mor = await MorFacade.build()
   *  const users = await Promise.all([mor.getOsuUser('spreadnuts', 'username'), mor.getOsuUser('2', 'id')])
   *  await mor.replaceSheetUsers(users)
   */
  async replaceSheetUsers (users) {
    console.info(`MorFacade::replaceSheetUsers (array of ${users.length} users)`) // TODO: replace
    if (!MorUtils.isMorUserArray(users)) throw new TypeError(`users must be a valid MorUser array! Val=${users}`)
    let hasOneRow = false
    const metadata = await this.getSheetMetadata()
    for (const sheet of metadata.sheets) {
      if (sheet.properties.title === MorConfig.SHEETS.USERS.NAME && sheet.properties.gridProperties.rowCount === 1) {
        hasOneRow = true
        break
      }
    }
    if (!hasOneRow) {
      await this.#SHEETS.deleteDimension(
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS.USERS.ID,
        'ROWS',
        1,
        -1
      )
    }
    await this.#SHEETS.appendRange(
      MorConfig.SHEETS.SPREADSHEET.ID,
      users.map(u => u.toArray()),
      MorConfig.SHEETS.USERS.NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return users
  }

  /**
   * Replaces all scores in a mor3 sheet with new ones; makes up to 2 Google API requests
   * @param {string} mods mod string
   * @param {MorScore[]} scores scores to be added to the sheet
   * @throws {@link InvalidModsError} if mod string is invalid
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<MorScore[]>} newly added scores (array of MorScore objects)
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
    if (!MorUtils.isMorScoreArray(scores)) throw new TypeError(`scores must be a valid MorScore array! Val=${scores}`)
    let hasOneRow = false
    const metadata = await this.getSheetMetadata()
    for (const sheet of metadata.sheets) {
      if (sheet.properties.title === MorConfig.SHEETS[mods].NAME && sheet.properties.gridProperties.rowCount === 1) {
        hasOneRow = true
        break
      }
    }
    if (!hasOneRow) {
      await this.#SHEETS.deleteDimension(
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS[mods].ID,
        'ROWS',
        1,
        -1
      )
    }
    await this.#SHEETS.appendRange(
      MorConfig.SHEETS.SPREADSHEET.ID,
      scores.map(s => s.toArray()),
      MorConfig.SHEETS[mods].NAME,
      'RAW',
      'INSERT_ROWS'
    )
    return scores
  }

  /**
   * Deletes all scores in a mor3 sheet; makes up to 3 Google API requests
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate} (Google Sheets API v4 batchUpdate Response object)
   * @param {string} mods mod string
   * @throws {@link InvalidModsError} if mod string is invalid
   * @return {Promise<void>} Google Sheets API v4 batchUpdate Response object
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
    let hasOneRow = false
    const metadata = await this.getSheetMetadata()
    for (const sheet of metadata.sheets) {
      if (sheet.properties.title === MorConfig.SHEETS[mods].NAME && sheet.properties.gridProperties.rowCount === 1) {
        hasOneRow = true
        break
      }
    }
    if (!hasOneRow) {
      await this.#SHEETS.deleteDimension(
        MorConfig.SHEETS.SPREADSHEET.ID,
        MorConfig.SHEETS[mods].ID,
        'ROWS',
        1,
        -1
      )
    }
    await this.#SHEETS.appendRange(
      MorConfig.SHEETS.SPREADSHEET.ID,
      [['']],
      MorConfig.SHEETS[mods].NAME,
      'RAW',
      'INSERT_ROWS'
    )
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
    const ret = await this.#DRIVE.copyFile(fileId, name, MorConfig.DRIVE.BACKUP_FOLDER_ID)
    return ret
  }
}
