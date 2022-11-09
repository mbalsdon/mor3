import { google } from 'googleapis'
import 'dotenv/config'
import Utils from './Utils.js'
import { ConstructorError } from './Errors.js'
import Config from './Config.js'

/**
 * Wrapper class for Google Sheets API v4
 * @see {@link https://developers.google.com/sheets/api}
 */
export default class SheetsWrapper {
  static #AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
  })

  #SHEETS_CLIENT

  /**
   * Constructs the wrapper.
   * Not meant to be called directly - use SheetsWrapper.build() instead!
   * @see {@link build}
   * @param {*} sheetsClient authorized Google Sheets client
   * @throws {ConstructorError} if sheetsClient doesn't exist or is structured improperly
   */
  constructor (sheetsClient) {
    if (typeof sheetsClient === 'undefined') throw new ConstructorError('sheetsClient is undefined! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(sheetsClient, 'context')) throw new ConstructorError('sheetsClient does not have property context! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(sheetsClient, 'spreadsheets')) throw new ConstructorError('sheetsClient does not have property spreadsheets! NOTE: Constructor cannot be called directly.')
    this.#SHEETS_CLIENT = sheetsClient
  }

  /**
   * Retrieves Google Sheets API v4 client then constructs SheetsWrapper object.
   * @return {SheetsWrapper}
   */
  static async build () {
    console.info('SheetsWrapper::build ()') // TODO: replace
    const authClient = await SheetsWrapper.#AUTH.getClient()
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient })
    return new SheetsWrapper(sheetsClient)
  }

  async getMetadata () {
    console.info('SheetsWrapper::getMetadata ()') // TODO: replace
    const response = await this.#SHEETS_CLIENT.spreadsheets.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID
    })
    return response.data
  }

  async updateRange (values, sheetName, startCell, endCell, valueInputOption = 'RAW') {
    console.info(`SheetsWrapper::updateCells (${values}, ${sheetName}, ${startCell}, ${endCell})`) // TODO: replace
    if (!Utils.is2DArray(values)) throw new TypeError(`values must be a 2D array! Val=${values}`)
    if (!Utils.isString(sheetName)) throw new TypeError(`sheetName must be a string! Val=${sheetName}`)
    if (!Utils.isValidCell(startCell)) throw new TypeError(`startCell must be a valid cell! Val=${startCell}`)
    if (!Utils.isValidCell(endCell)) throw new TypeError(`endCell must be a valid cell! Val=${endCell}`)
    if (valueInputOption !== 'RAW' && valueInputOption !== 'USER_ENTERED') throw new TypeError(`valueInputOption must be one of 'RAW' or 'USER_ENTERED'! Val=${valueInputOption}`)
    const response = await this.#SHEETS_CLIENT.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID,
      range: `${sheetName}!${startCell}:${endCell}`,
      valueInputOption,
      resource: {
        values
      }
    })
    return response.data
  }

  async getRange (sheetName, startCell, endCell, valueRenderOption = 'FORMATTED_VALUE', majorDimension = 'ROWS') {
    console.info(`SheetsWrapper::getRange (${sheetName}, ${startCell}, ${endCell}, ${valueRenderOption}, ${majorDimension})`) // TODO: replace
    if (!Utils.isString(sheetName)) throw new TypeError(`sheetName must be a string! Val=${sheetName}`)
    if (!Utils.isValidCell(startCell)) throw new TypeError(`startCell must be a valid cell! Val=${startCell}`)
    if (!Utils.isValidCell(endCell)) throw new TypeError(`endCell must be a valid cell! Val=${endCell}`)
    if (valueRenderOption !== 'UNFORMATTED_VALUE' && valueRenderOption !== 'FORMATTED_VALUE' && valueRenderOption !== 'FORMULA') throw new TypeError(`valueRenderOption must be one of 'UNFORMATTED_VALUE', 'FORMATTED_VALUE', or 'FORMULA'! Val=${valueRenderOption}`)
    if (majorDimension !== 'ROWS' && majorDimension !== 'COLUMNS') throw new TypeError(`majorDimension must be one of 'ROWS' or 'COLUMNS'! Val=${majorDimension}`)
    const response = await this.#SHEETS_CLIENT.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID,
      range: `${sheetName}!${startCell}:${endCell}`,
      majorDimension,
      valueRenderOption
    })
    return response.data
  }

  async appendRange (values, sheetName, valueInputOption = 'RAW', insertDataOption = 'INSERT_ROWS') {
    console.info(`SheetsWrapper::appendRange (array of ${values.length} values, ${sheetName}, ${valueInputOption}, ${insertDataOption})`) // TODO: replace
    if (!Utils.is2DArray(values)) throw new TypeError(`values must be a 2D array! Val=${values}`)
    if (!Utils.isString(sheetName)) throw new TypeError(`sheetName must be a string! Val=${sheetName}`)
    if (valueInputOption !== 'RAW' && valueInputOption !== 'USER_ENTERED') throw new TypeError(`valueInputOption must be one of 'RAW' or 'USER_ENTERED'! Val=${valueInputOption}`)
    if (insertDataOption !== 'OVERWRITE' && insertDataOption !== 'INSERT_ROWS') throw new TypeError(`insertDataOption must be one of 'OVERWRITE' or 'INSERT_ROWS'! Val=${insertDataOption}`)
    const response = await this.#SHEETS_CLIENT.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID,
      range: sheetName,
      valueInputOption,
      insertDataOption,
      resource: {
        values
      }
    })
    return response.data
  }

  async deleteDimension (sheetId, dimension, startIndex, endIndex = -1) {
    console.info(`SheetsWrapper::deleteDimension (${sheetId}, ${dimension}, ${startIndex}, ${endIndex})`) // TODO: replace
    if (!Utils.isString(sheetId)) throw new TypeError(`sheetId must be a string! Val=${sheetId}`)
    if (dimension !== 'ROWS' && dimension !== 'COLUMNS') throw new TypeError(`dimension must be one of 'ROWS' or 'COLUMNS'! Val=${dimension}`)
    if (!Utils.isNumber(startIndex)) throw new TypeError(`startIndex must be a number! Val=${startIndex}`)
    if (!Utils.isNumber(endIndex)) throw new TypeError(`endIndex must be a number! Val=${endIndex}`)
    if (dimension === 'ROWS' && endIndex === -1) endIndex = Utils.SHEETS_MAX_ROWS
    if (dimension === 'COLUMNS' && startIndex === -1) startIndex = Utils.SHEETS_MAX_COLS
    const resource = {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension, startIndex, endIndex }
        }
      }]
    }
    const response = await this.#SHEETS_CLIENT.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID,
      resource
    })
    return response.data
  }

  async deleteMultipleDimensions (sheetIds, dimensions, startIndices, endIndices) {
    console.info(`SheetsWrapper::deleteMultipleDimensions (${sheetIds}, ${dimensions}, ${startIndices}, ${endIndices})`) // TODO: replace
    if (!Utils.isStringArray(sheetIds)) throw new TypeError(`sheetIds must be an array of strings! Val=${sheetIds}`)
    if (!dimensions.every(d => d === 'ROWS' || d === 'COLUMNS')) throw new TypeError(`dimensions must be an array of 'ROWS' or 'COLUMNS'! Val=${dimensions}`)
    if (!Utils.isNumberArray(startIndices)) throw new TypeError(`startIndices must be an array of numbers! Val=${startIndices}`)
    if (!Utils.isNumberArray(endIndices)) throw new TypeError(`endIndices must be an array of numbers! Val=${endIndices}`)
    if (dimensions.length !== sheetIds.length || startIndices.length !== sheetIds.length || endIndices.length !== sheetIds.length) throw new RangeError(`Input arrays must be of the same length! Lengths=${sheetIds.length},${dimensions.length},${startIndices.length},${endIndices.length}`)
    const requests = []
    for (let i = 0; i < sheetIds.length; i++) {
      requests.push({
        deleteDimension: {
          range: { sheetId: sheetIds[i], dimension: dimensions[i], startIndex: startIndices[i], endIndex: endIndices[i] }
        }
      })
    }
    const resource = { requests }
    const response = await this.#SHEETS_CLIENT.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID,
      resource
    })
    return response.data
  }

  async insertDimension (sheetId, dimension, startIndex, endIndex) {
    console.info(`SheetsWrapper::insertDimension (${sheetId}, ${dimension}, ${startIndex}, ${endIndex})`) // TODO: replace
    if (!Utils.isString(sheetId)) throw new TypeError(`sheetId must be a string! Val=${sheetId}`)
    if (dimension !== 'ROWS' && dimension !== 'COLUMNS') throw new TypeError(`dimension must be one of 'ROWS' or 'COLUMNS'! Val=${dimension}`)
    if (!Utils.isNumber(startIndex)) throw new TypeError(`startIndex must be a number! Val=${startIndex}`)
    if (!Utils.isNumber(endIndex)) throw new TypeError(`endIndex must be a number! Val=${endIndex}`)
    const resource = {
      requests: [{
        insertDimension: {
          range: { sheetId, dimension, startIndex, endIndex }
        }
      }]
    }
    const response = await this.#SHEETS_CLIENT.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId: Config.SHEETS.SPREADSHEET.ID,
      resource
    })
    return response.data
  }
}
