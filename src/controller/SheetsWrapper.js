import { google } from 'googleapis'
import Mods from './Mods.js'

import 'dotenv/config'

export default class SheetsWrapper {
  static #AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
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
    console.info('SheetsWrapper::build()')
    const authClient = SheetsWrapper.#AUTH.getClient()
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient })
    return new SheetsWrapper(sheetsClient)
  }

  async fetchMetadata () {
    console.info('SheetsWrapper::fetchMetadata()')
    const response = await this.#sheetsClient.spreadsheets.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID
    })
    return response.data
  }

  async fetchUserIds () {
    console.info('SheetsWrapper::fetchUserIds()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Users!A:A',
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  async fetchUserPps () {
    console.info('SheetsWrapper::fetchUserPps()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Users!D:D',
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  async insertUser (userId, username, rank, pp) {
    console.info(`SheetsWrapper::insertUser( ${userId}, ${username}, ${rank}, ${pp} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number')
    } else if (typeof username !== 'string') {
      throw new Error('Username must be a string')
    }

    // Could do binary search for the index since it's already sorted but I'm not a NERD!! 🤣
    const userPps = await this.fetchUserPps()
    userPps.push(pp)
    userPps.sort((a, b) => {
      return parseInt(b) - parseInt(a)
    })
    const userIndex = userPps.indexOf(pp)
    const batchUpdateRequest = {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: process.env.USERS,
              dimension: 'ROWS',
              startIndex: userIndex + 1,
              endIndex: userIndex + 2
            }
          }
        }
      ]
    }
    await this.#sheetsClient.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    const response = await this.#sheetsClient.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Users!A${userIndex + 2}:D${userIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[userId, username, rank, pp]]
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
    }
    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: process.env.USERS,
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
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    return response.data
  }

  async fetchModScores (mods, valueRenderOption) {
    console.info(`SheetsWrapper::fetchModScores( ${mods}, ${valueRenderOption} )`)
    if (Mods.toSheetId(mods) === -1) {
      throw new Error(`${mods} is not a valid mod combination`)
    } else if (valueRenderOption !== 'FORMATTED_VALUE' && valueRenderOption !== 'UNFORMATTED_VALUE' && valueRenderOption !== 'FORMULA') {
      throw new Error('valueRenderOption must be one of FORMATTED_VALUE, UNFORMATTED_VALUE, or FORMULA')
    }

    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${mods}!A:G`,
      majorDimension: 'ROWS',
      valueRenderOption
    })
    return response.data.values.slice(1)
  }

  async fetchScore (mods, rowNum) {
    console.info(`SheetsWrapper::fetchScore( ${mods}, ${rowNum} )`)
    if (Mods.toSheetId(mods) === -1) {
      throw new Error(`${mods} is not a valid mod combination`)
    } else if (isNaN(parseInt(rowNum)) || parseInt(rowNum) < 0) {
      throw new Error('Row number cannot be negative')
    }
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${mods}!A${rowNum + 2}:G${rowNum + 2}`,
      majorDimension: 'ROWS',
      valueRenderOption: 'FORMATTED_VALUE'
    })
    return response.data.values[0]
  }

  async removeScore (mods, id) {
    console.info(`SheetsWrapper::removeScore( ${mods}, ${id} )`)
    if (Mods.toSheetId(mods) === -1) {
      throw new Error(`${mods} is not a valid mod combination`)
    } else if (isNaN(parseInt(id)) || parseInt(id) < 1) {
      throw new Error('Score ID must be a positive number')
    }

    const sScores = await this.fetchSubmittedScores()
    const sScoreIndex = sScores.indexOf(id)
    const mScores = await this.fetchModScores(mods, 'FORMATTED_VALUE')
    const mScoreIndex = mScores.map((s) => s[0]).indexOf(id)

    let batchUpdateRequest = {}
    let response = {}

    // Score is in both sheets
    if (mScoreIndex !== -1 && sScoreIndex !== -1) {
      batchUpdateRequest = {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: Mods.toSheetId(mods),
                dimension: 'ROWS',
                startIndex: mScoreIndex + 1,
                endIndex: mScoreIndex + 2
              }
            }
          },
          {
            deleteDimension: {
              range: {
                sheetId: process.env.SUBMITTED_SCORES,
                dimension: 'ROWS',
                startIndex: sScoreIndex + 1,
                endIndex: sScoreIndex + 2
              }
            }
          }
        ]
      }
    // Score is in mod scores sheet
    } else if (mScoreIndex !== -1) {
      batchUpdateRequest = {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: Mods.toSheetId(mods),
                dimension: 'ROWS',
                startIndex: mScoreIndex + 1,
                endIndex: mScoreIndex + 2
              }
            }
          }
        ]
      }
    // Score is in submitted scores sheet
    } else if (sScoreIndex !== -1) {
      batchUpdateRequest = {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: process.env.SUBMITTED_SCORES,
                dimension: 'ROWS',
                startIndex: sScoreIndex + 1,
                endIndex: sScoreIndex + 2
              }
            }
          }
        ]
      }
    // Score is in neither sheet
    } else {
      throw new Error(`Score with ID ${id} could not be found`)
    }
    response = await this.#sheetsClient.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    return response.data
  }

  // Doesn't check if scores already in sheet, or if scores are valid
  async replaceScores (mods, scores) {
    console.info(`SheetsWrapper::replaceScores( ${mods}, array of ${scores.length} scores )`)
    if (Mods.toSheetId(mods) === -1) throw new Error(`${mods} is not a valid mod combination`)

    const response = await this.#sheetsClient.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${mods}!A2:G${scores.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: scores
      }
    })
    return response.data
  }

  // Doesn't check if users already in sheet, or if users are valid
  async replaceUsers (users) {
    console.info(`SheetsWrapper::replaceUsers( array of ${users.length} users )`)

    const response = await this.#sheetsClient.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `Users!A2:D${users.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: users
      }
    })
    return response.data
  }

  async fetchSubmittedScores () {
    console.info('SheetsWrapper::fetchSubmittedScores()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Submitted Scores!A:A',
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  // Doesn't check if scores already in sheet
  async submitScore (id) {
    console.info(`SheetsWrapper::submitScore( ${id} )`)
    if (isNaN(parseInt(id)) || parseInt(id) < 1) {
      throw new Error('Score ID must be a positive number')
    }

    const response = await this.#sheetsClient.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Submitted Scores',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[id]]
      }
    })
    return response.data
  }

  async lastUpdated (date) {
    console.info(`SheetsWrapper::lastUpdated( ${date} )`)
    
    const response = await this.#sheetsClient.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Main!A1:A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[date]]
      }
    })
    return response.data
  }

  /* --- --- --- --- --- ---
     --- PRIVATE METHODS ---
     --- --- --- --- --- --- */

}
