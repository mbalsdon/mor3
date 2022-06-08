const { google } = require('googleapis')
const Mods = require('./Mods')

require('dotenv').config()

module.exports = class SheetsWrapper {
  static #SPREADSHEET_ID = '1hduRLLIFjVwLGjXyt7ph3301xfXS6qjSnYCm18YP4iA'
  static #USERS_SHEET_ID = 253307812
  static #AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_API_KEYFILE,
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
  })

  #sheetsClient

  constructor (sheetsClient) {
    if (typeof sheetsClient === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.#sheetsClient = sheetsClient
  }

  static async build () {
    const authClient = SheetsWrapper.#AUTH.getClient()
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient })
    return new SheetsWrapper(sheetsClient)
  }

  async fetchMetadata () {
    console.info('SheetsWrapper::fetchMetadata()')
    const response = await this.#sheetsClient.spreadsheets.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: SheetsWrapper.#SPREADSHEET_ID
    })
    return response.data
  }

  async fetchUserIds () {
    console.info('SheetsWrapper::fetchUserIds()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: SheetsWrapper.#SPREADSHEET_ID,
      range: 'Users!A:A',
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  async insertUser (userId, username) {
    console.info(`SheetsWrapper::insertUser( ${userId}, ${username} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number')
    } else if (typeof username !== 'string') {
      throw new Error('Username must be a string')
    }

    const response = await this.#sheetsClient.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: SheetsWrapper.#SPREADSHEET_ID,
      range: 'Users',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[userId, username]]
      }
    })
    return response.data
  }

  async removeUser (userId) {
    console.info(`SheetsWrapper::removeUser( ${userId} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number')
    }

    const userIds = await this.fetchUserIds()
    const idIndex = userIds.indexOf(userId)
    if (idIndex === -1) {
      throw new Error(`User with ID ${userId} could not be found`)
    } else {
      const batchUpdateRequest = {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: SheetsWrapper.#USERS_SHEET_ID,
                dimension: 'ROWS',
                startIndex: idIndex + 1,
                endIndex: idIndex + 2
              }
            }
          }
        ]
      }
      const response = await this.#sheetsClient.spreadsheets.batchUpdate({
        auth: SheetsWrapper.#AUTH,
        spreadsheetId: SheetsWrapper.#SPREADSHEET_ID,
        resource: batchUpdateRequest
      })
      return response.data
    }
  }

  async fetchModScores (mods) {
    console.info(`SheetsWrapper::fetchModScores( ${mods} )`)
    if (!Object.keys(Mods).includes(mods)) {
      throw new Error(`${mods} is not a valid mod combination`)
    }

    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: SheetsWrapper.#SPREADSHEET_ID,
      range: `${mods}!A:G`,
      majorDimension: 'ROWS'
    })
    return response.data.values.slice(1)
  }

  async fetchScore (mods, rowNum) {
    console.info(`SheetsWrapper::fetchScore( ${mods}, ${rowNum} )`)
    if (!Object.keys(Mods).includes(mods)) {
      throw new Error(`${mods} is not a valid mod combination`)
    } else if (isNaN(parseInt(rowNum)) || parseInt(rowNum) < 0) {
      throw new Error('Row number cannot be negative')
    }
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: SheetsWrapper.#SPREADSHEET_ID,
      range: `${mods}!A${rowNum + 2}:G${rowNum + 2}`,
      majorDimension: 'ROWS',
      valueRenderOption: 'FORMULA'
    })
    return response.data.values[0]
  }

  async insertScore (mods, score) {
    console.info(`SheetsWrapper::putScore( ${mods}, ${score} )`)
    if (!Object.keys(Mods).includes(mods)) {
      throw new Error(`${mods} is not a valid mod combination`)
    } // TODO: else if {check the score structure}

    const response = await this.#sheetsClient.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: SheetsWrapper.#SPREADSHEET_ID,
      range: `${mods}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [score]
      }
    })
    return response.data
  }
}
