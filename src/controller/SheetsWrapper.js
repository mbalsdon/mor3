import { google } from 'googleapis'
import Mods from './Mods.js'
import * as fs from 'fs'
import 'dotenv/config'

const configRaw = fs.readFileSync('./src/config.json')
const config = JSON.parse(configRaw)

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
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID
    })
    return response.data
  }

  async fetchUser (username) {
    console.info(`SheetsWrapper::fetchUser( ${username} )`)
    const usernames = await this.fetchUsernames()
    const usernameIndex = usernames.indexOf(username)
    if (usernameIndex !== -1) {
      const response = await this.#sheetsClient.spreadsheets.values.get({
        auth: SheetsWrapper.#AUTH,
        spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
        range: `Users!A${usernameIndex + 2}:M${usernameIndex + 2}`, // magic numbr
        majorDimension: 'ROWS',
        valueRenderOption: 'FORMATTED_VALUE'
      })
      return response.data.values[0]
    } else {
      throw new Error(`User ${username} could not be found.`)
    }
  }

  // TODO: dupecode galore
  async fetchUserIds () {
    console.info('SheetsWrapper::fetchUserIds()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Users!A:A', // TODO: magic numbers weee
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  // TODO: dupecode galore
  async fetchUsernames () {
    console.info('SheetsWrapper::fetchUsernames()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Users!B:B', // TODO: magic numbers weee
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  async fetchUserPps () {
    console.info('SheetsWrapper::fetchUserPps()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Users!D:D',
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  async fetchUsers () {
    console.info('SheetsWrapper::fetchUsers()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Users!A:M',
      majorDimension: 'ROWS'
    })
    return response.data.values.slice(1)
  }

  async insertUser (userId, username, rank, pp, acc, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink) {
    console.info(`SheetsWrapper::insertUser( ${userId}, ${username}, ${rank}, ${pp}, ${acc}, ${playtime}, ${top1s}, ${top2s}, ${top3s}, ${top5s}, ${top10s}, ${top25s}, ${pfpLink} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number!')
    } else if (typeof username !== 'string') {
      throw new Error('Username must be a string!')
    }

    let response
    // 0pp => append instead of insert
    if (pp === 0) {
      response = await this.#sheetsClient.spreadsheets.values.append({
        auth: SheetsWrapper.#AUTH,
        spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
        range: 'Users',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [[userId, username, rank, pp, acc, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink]]
        }
      })
    } else {
      // Could do binary search for the index since it's already sorted but I'm not a NERD!! 🤣
      const userPps = await this.fetchUserPps()
      userPps.push(pp)
      userPps.sort((a, b) => {
        return parseInt(b) - parseInt(a)
      })
      const userIndex = userPps.indexOf(pp)
      // Inserting at end => append instead
      if (userIndex + 1 === userPps.length || userPps.length === 0) {
        response = await this.#sheetsClient.spreadsheets.values.append({ // TODO: terrible code (dupe+weird logic) lol
          auth: SheetsWrapper.#AUTH,
          spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
          range: 'Users',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [[userId, username, rank, pp, acc, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink]]
          }
        })
      } else {
        const batchUpdateRequest = {
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId: config.SPREADSHEETS.USERS_ID,
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
          spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
          resource: batchUpdateRequest
        })
        response = await this.#sheetsClient.spreadsheets.values.update({
          auth: SheetsWrapper.#AUTH,
          spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
          range: `Users!A${userIndex + 2}:M${userIndex + 2}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[userId, username, rank, pp, acc, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink]]
          }
        })
      }
    }
    return response.data
  }

  async removeUser (username) {
    console.info(`SheetsWrapper::removeUser( ${username} )`)

    const users = await this.fetchUsers()
    const usernames = users.map(u => { return u[1] }).flat(1)
    const userIndex = usernames.map(u => { return u.toLowerCase() }).indexOf(username.toLowerCase())
    if (userIndex === -1) {
      throw new Error(`User ${username} could not be found.`)
    }
    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: config.SPREADSHEETS.USERS_ID,
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
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    return users[userIndex]
  }

  async fetchModScores (mods, valueRenderOption) {
    console.info(`SheetsWrapper::fetchModScores( ${mods}, ${valueRenderOption} )`)
    if (!Mods.modStrings.includes(mods)) { // TODO: duplicate error
      throw new Error(`${mods} is not a valid mod combination.`)
    } else if (valueRenderOption !== 'FORMATTED_VALUE' && valueRenderOption !== 'UNFORMATTED_VALUE' && valueRenderOption !== 'FORMULA') {
      throw new Error('valueRenderOption must be one of FORMATTED_VALUE, UNFORMATTED_VALUE, or FORMULA.')
    }

    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: `${mods}!A:J`,
      majorDimension: 'ROWS',
      valueRenderOption
    })
    return response.data.values.slice(1)
  }

  async fetchModScoreIds (mods, valueRenderOption) {
    console.info(`SheetsWrapper::fetchModScoreIds( ${mods}, ${valueRenderOption} )`)
    if (!Mods.modStrings.includes(mods)) { // TODO: duplicate error
      throw new Error(`${mods} is not a valid mod combination.`)
    } else if (valueRenderOption !== 'FORMATTED_VALUE' && valueRenderOption !== 'UNFORMATTED_VALUE' && valueRenderOption !== 'FORMULA') {
      throw new Error('valueRenderOption must be one of FORMATTED_VALUE, UNFORMATTED_VALUE, or FORMULA.')
    }

    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: `${mods}!A:A`,
      majorDimension: 'COLUMNS',
      valueRenderOption
    })
    return response.data.values[0].slice(1)
  }

  async fetchScore (mods, rowNum) {
    console.info(`SheetsWrapper::fetchScore( ${mods}, ${rowNum} )`)
    if (!Mods.modStrings.includes(mods)) { // TODO: duplicate error
      throw new Error(`${mods} is not a valid mod combination!`)
    } else if (isNaN(parseInt(rowNum)) || parseInt(rowNum) < 0) {
      throw new Error('Row number cannot be negative!')
    }
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: `${mods}!A${rowNum + 2}:J${rowNum + 2}`,
      majorDimension: 'ROWS',
      valueRenderOption: 'FORMATTED_VALUE'
    })
    return response.data.values[0]
  }

  async removeScore (mods, id) {
    console.info(`SheetsWrapper::removeScore( ${mods}, ${id} )`)
    if (!Mods.modStrings.includes(mods)) { // TODO: duplicate error
      throw new Error(`${mods} is not a valid mod combination!`)
    } else if (isNaN(parseInt(id)) || parseInt(id) < 1) {
      throw new Error('Score ID must be a positive number!')
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
                sheetId: config.SPREADSHEETS.SUBMITTED_SCORES_ID,
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
                sheetId: config.SPREADSHEETS.SUBMITTED_SCORES_ID,
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
      throw new Error(`Score with ID ${id} could not be found.`)
    }
    response = await this.#sheetsClient.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    return response.data
  }

  // Doesn't check if scores already in sheet, or if scores are valid
  async replaceScores (mods, scores) {
    console.info(`SheetsWrapper::replaceScores( ${mods}, array of ${scores.length} scores )`)
    if (!Mods.modStrings.includes(mods)) throw new Error(`${mods} is not a valid mod combination!`) // TODO: duplicate error

    // Wipe sheet
    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: Mods.toSheetId(mods),
              dimension: 'ROWS',
              startIndex: 1
            }
          }
        }
      ]
    }
    await this.#sheetsClient.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    // Append scores
    const response = await this.#sheetsClient.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: `${mods}`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: scores
      }
    })
    return response.data
  }

  // Doesn't check if users already in sheet, or if users are valid
  async replaceUsers (users) {
    console.info(`SheetsWrapper::replaceUsers( array of ${users.length} users )`)

    // Wipe sheet
    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: config.SPREADSHEETS.USERS_ID,
              dimension: 'ROWS',
              startIndex: 1
            }
          }
        }
      ]
    }
    await this.#sheetsClient.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      resource: batchUpdateRequest
    })
    // Append users
    const response = await this.#sheetsClient.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Users',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
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
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Submitted Scores!A:A',
      majorDimension: 'COLUMNS'
    })
    return response.data.values[0].slice(1)
  }

  async fetchSubmittedScoresFull () {
    console.info('SheetsWrapper::fetchSubmittedScoresFull()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Submitted Scores!A:J',
      majorDimension: 'COLUMNS'
    })
    return response.data.values.map(e => e.slice(1))
  }

  // Doesn't check if scores already in sheet
  async submitScore (ps) {
    console.info(`SheetsWrapper::submitScore( ${ps} )`)

    const response = await this.#sheetsClient.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Submitted Scores',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [[ps[0], ps[1], ps[2], ps[3], ps[4], ps[5], ps[6], ps[7], ps[8], ps[9]]]
      }
    })
    return response.data
  }

  async insertLastUpdated (date) {
    console.info(`SheetsWrapper::lastUpdated( ${date} )`)

    const response = await this.#sheetsClient.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Main!A1:A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[date]]
      }
    })
    return response.data
  }

  async fetchLastUpdated () {
    console.info('SheetsWrapper::fetchLastUpdated()')
    const response = await this.#sheetsClient.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: config.SPREADSHEETS.SPREADSHEET_ID,
      range: 'Main!A1:A1'
    })
    return response.data.values[0]
  }
}
