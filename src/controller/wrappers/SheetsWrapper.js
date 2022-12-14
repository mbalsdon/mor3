import MorConfig from '../utils/MorConfig.js'
import { ConstructorError } from '../utils/MorErrors.js'
import MorUtils from '../utils/MorUtils.js'

import { google } from 'googleapis'

/**
 * Wrapper class for Google Sheets API v4
 * @see {@link https://developers.google.com/sheets/api}
 */
export default class SheetsWrapper {
  #SHEETS_CLIENT

  static #AUTH = new google.auth.GoogleAuth({
    keyFile: MorConfig.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
  })

  /**
   * Constructs the wrapper.
   * Not meant to be called directly - use SheetsWrapper.build() instead!
   * @see {@link build}
   * @param {*} sheetsClient authorized Google Sheets client
   * @throws {@link ConstructorError} if sheetsClient doesn't exist or is structured improperly
   */
  constructor (sheetsClient) {
    if (typeof sheetsClient === 'undefined') throw new ConstructorError('sheetsClient is undefined! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(sheetsClient, 'context')) throw new ConstructorError('sheetsClient does not have property context! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(sheetsClient, 'spreadsheets')) throw new ConstructorError('sheetsClient does not have property spreadsheets! NOTE: Constructor cannot be called directly.')

    this.#SHEETS_CLIENT = sheetsClient
  }

  /**
   * Retrieves Google Sheets API v4 client then constructs SheetsWrapper object
   * @return {Promise<SheetsWrapper>}
   * @example
   *  const sheets = await SheetsWrapper.build()
   */
  static async build () {
    const authClient = await SheetsWrapper.#AUTH.getClient()
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient })

    return new SheetsWrapper(sheetsClient)
  }

  /**
   * Retrieves spreadsheet metadata
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets} (Google Sheets API v4 Spreadsheets object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 Spreadsheets object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  const metadata = await sheets.getMetadata('1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM')
   *  console.log(metadata.sheets[0])
   */
  async getMetadata (spreadsheetId, googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.get({ auth: SheetsWrapper.#AUTH, spreadsheetId }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }

  /**
   * Returns spreadsheet values from a given range
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#ValueRange} (Google Sheets API v4 ValueRange object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {string} sheetName name of the sheet containing the range to update
   * @param {string} startCell first cell of the range to update
   * @param {string} endCell last cell of the range to update
   * @param {('UNFORMATTED_VALUE'|'FORMATTED_VALUE'|'FORMULA')} valueRenderOption How values should be represented in the output
   * @param {('ROWS'|'COLUMNS')} majorDimension Whether to return a row-dominant array or column-dominant array
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 ValueRange object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  const response = await sheets.getRange(
   *    '1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM',
   *    'Sheet5',
   *    'A1',
   *    'C2',
   *    'UNFORMATTED_VALUE',
   *    'ROWS'
   *  )
   *  console.log(response.values[0][1])
   */
  async getRange (spreadsheetId, sheetName, startCell, endCell, valueRenderOption = 'FORMATTED_VALUE', majorDimension = 'ROWS', googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.isString(sheetName)) throw new TypeError(`sheetName must be a string! Val=${sheetName}`)
    if (!MorUtils.isValidCell(startCell)) throw new TypeError(`startCell must be a valid cell! Val=${startCell}`)
    if (!MorUtils.isValidCell(endCell)) throw new TypeError(`endCell must be a valid cell! Val=${endCell}`)
    if (valueRenderOption !== 'UNFORMATTED_VALUE' && valueRenderOption !== 'FORMATTED_VALUE' && valueRenderOption !== 'FORMULA') throw new TypeError(`valueRenderOption must be one of 'UNFORMATTED_VALUE', 'FORMATTED_VALUE', or 'FORMULA'! Val=${valueRenderOption}`)
    if (majorDimension !== 'ROWS' && majorDimension !== 'COLUMNS') throw new TypeError(`majorDimension must be one of 'ROWS' or 'COLUMNS'! Val=${majorDimension}`)
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.values.get({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId,
      range: `${sheetName}!${startCell}:${endCell}`,
      majorDimension,
      valueRenderOption
    }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }

  /**
   * Appends given values to sheet
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values#ValueRange} (Google Sheets API v4 ValueRange object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {string[][]} values 2D array of values to append the sheet with
   * @param {string} sheetName name of the sheet to append to
   * @param {('RAW'|'USER_ENTERED')} valueInputOption whether to paste values raw or as if a user manually entered them (thus formatting the values)
   * @param {('OVERWRITE'|'INSERT_ROWS')} insertDataOption how the input data should be inserted
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 ValueRange object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  const response = await sheets.appendRange(
   *    '1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM',
   *    [['hello', 'world', ''], ['1', '2', '3']],
   *    'Sheet4',
   *    'USER_ENTERED',
   *    'OVERWRITE'
   *  )
   */
  async appendRange (spreadsheetId, values, sheetName, valueInputOption = 'RAW', insertDataOption = 'INSERT_ROWS', googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.is2DArray(values)) throw new TypeError(`values must be a 2D array! Val=${values}`)
    if (!MorUtils.isString(sheetName)) throw new TypeError(`sheetName must be a string! Val=${sheetName}`)
    if (valueInputOption !== 'RAW' && valueInputOption !== 'USER_ENTERED') throw new TypeError(`valueInputOption must be one of 'RAW' or 'USER_ENTERED'! Val=${valueInputOption}`)
    if (insertDataOption !== 'OVERWRITE' && insertDataOption !== 'INSERT_ROWS') throw new TypeError(`insertDataOption must be one of 'OVERWRITE' or 'INSERT_ROWS'! Val=${insertDataOption}`)
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.values.append({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId,
      range: sheetName,
      valueInputOption,
      insertDataOption,
      resource: {
        values
      }
    }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }

  /**
   * Updates spreadsheet values in a given range
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/UpdateValuesResponse} (Google Sheets API v4 UpdateValuesResponse object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {string[][]} values 2D array of values to update the range with
   * @param {string} sheetName name of the sheet containing the range to update
   * @param {string} startCell first cell of the range to update
   * @param {string} endCell last cell of the range to update
   * @param {('RAW'|'USER_ENTERED')} valueInputOption whether to paste values raw or as if a user manually entered them (thus formatting the values)
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 UpdateValuesResponse object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  const reponse = await sheets.updateRange(
   *    '1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM',
   *    [['hello', 'world', ''], ['1', '2', '3']],
   *    'Sheet5',
   *    'A1',
   *    'C2',
   *    'RAW'
   *  )
   */
  async updateRange (spreadsheetId, values, sheetName, startCell, endCell, valueInputOption = 'RAW', googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.is2DArray(values)) throw new TypeError(`values must be a 2D array! Val=${values}`)
    if (!MorUtils.isString(sheetName)) throw new TypeError(`sheetName must be a string! Val=${sheetName}`)
    if (!MorUtils.isValidCell(startCell)) throw new TypeError(`startCell must be a valid cell! Val=${startCell}`)
    if (!MorUtils.isValidCell(endCell)) throw new TypeError(`endCell must be a valid cell! Val=${endCell}`)
    if (valueInputOption !== 'RAW' && valueInputOption !== 'USER_ENTERED') throw new TypeError(`valueInputOption must be one of 'RAW' or 'USER_ENTERED'! Val=${valueInputOption}`)
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.values.update({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId,
      range: `${sheetName}!${startCell}:${endCell}`,
      valueInputOption,
      resource: {
        values
      }
    }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }

  /**
   * Inserts range of empty rows/column into sheet
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate} (Google Sheets API v4 batchUpdate Response object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {string} sheetId the ID of the sheet
   * @param {('ROWS'|'COLUMNS')} dimension whether to insert rows or columns into the sheet
   * @param {number} startIndex index of the first row/column to insert at
   * @param {number} endIndex index of the last row/column to insert at
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 batchUpdate Response object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  await sheets.insertDimension(
   *    '1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM',
   *    '521109209',
   *    'COLUMNS',
   *    7,
   *    8
   *  )
   */
  async insertDimension (spreadsheetId, sheetId, dimension, startIndex, endIndex, googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.isString(sheetId)) throw new TypeError(`sheetId must be a string! Val=${sheetId}`)
    if (dimension !== 'ROWS' && dimension !== 'COLUMNS') throw new TypeError(`dimension must be one of 'ROWS' or 'COLUMNS'! Val=${dimension}`)
    if (!MorUtils.isNumber(startIndex)) throw new TypeError(`startIndex must be a number! Val=${startIndex}`)
    if (!MorUtils.isNumber(endIndex)) throw new TypeError(`endIndex must be a number! Val=${endIndex}`)
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const resource = {
      requests: [{
        insertDimension: {
          range: { sheetId, dimension, startIndex, endIndex }
        }
      }]
    }

    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId,
      resource
    }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }

  /**
   * Deletes specified range of rows/columns from given sheet
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate} (Google Sheets API v4 batchUpdate Response object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {string} sheetId the ID of the sheet
   * @param {('ROWS'|'COLUMNS')} dimension whether to delete rows or columns from the sheet
   * @param {number} startIndex index of the first row/column to delete
   * @param {number} endIndex index of the last row/column to delete
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 batchUpdate Response object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  await sheets.deleteDimension(
   *    '1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM',
   *    '287611481',
   *    'ROWS',
   *    1,
   *    17
   *  )
   */
  async deleteDimension (spreadsheetId, sheetId, dimension, startIndex, endIndex = -1, googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.isString(sheetId)) throw new TypeError(`sheetId must be a string! Val=${sheetId}`)
    if (dimension !== 'ROWS' && dimension !== 'COLUMNS') throw new TypeError(`dimension must be one of 'ROWS' or 'COLUMNS'! Val=${dimension}`)
    if (!MorUtils.isNumber(startIndex)) throw new TypeError(`startIndex must be a number! Val=${startIndex}`)
    if (!MorUtils.isNumber(endIndex)) throw new TypeError(`endIndex must be a number! Val=${endIndex}`)
    if (dimension === 'COLUMNS' && startIndex === -1) startIndex = MorUtils.SHEETS_MAX_COLS
    if (dimension === 'ROWS' && endIndex === -1) endIndex = MorUtils.SHEETS_MAX_ROWS
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const resource = {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension, startIndex, endIndex }
        }
      }]
    }

    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId,
      resource
    }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }

  /**
   * Deletes specified ranges of rows/columns from given sheets
   * @see {@link https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/batchUpdate} (Google Sheets API v4 batchUpdate Response object)
   * @param {string} spreadsheetId the ID of the spreadsheet
   * @param {string[]} sheetIds the IDs of the sheets to delete from
   * @param {('ROWS'|'COLUMNS')[]} dimensions whether to delete rows or columns from the sheet (list)
   * @param {number[]} startIndices indices of the first rows/columns to delete
   * @param {number[]} endIndices indices of the last rows/columns to delete
   * @param {number} googleApiCooldown minimum time Google API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Sheets API v4 batchUpdate Response object
   * @example
   *  const sheets = await SheetsWrapper.build()
   *  await sheets.deleteMultipleDimensions(
   *    '1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM',
   *    ['1045203346', '1150213908'],
   *    ['ROWS', 'ROWS'],
   *    [1, 3],
   *    [5, 37]
   *  )
   */
  async deleteMultipleDimensions (spreadsheetId, sheetIds, dimensions, startIndices, endIndices, googleApiCooldown = MorConfig.GOOGLE_API_COOLDOWN_MS) {
    if (!MorUtils.isString(spreadsheetId)) throw new TypeError(`spreadsheetId must be a string! Val=${spreadsheetId}`)
    if (!MorUtils.isStringArray(sheetIds)) throw new TypeError(`sheetIds must be an array of strings! Val=${sheetIds}`)
    if (!dimensions.every(d => d === 'ROWS' || d === 'COLUMNS')) throw new TypeError(`dimensions must be an array of 'ROWS' or 'COLUMNS'! Val=${dimensions}`)
    if (!MorUtils.isNumberArray(startIndices)) throw new TypeError(`startIndices must be an array of numbers! Val=${startIndices}`)
    if (!MorUtils.isNumberArray(endIndices)) throw new TypeError(`endIndices must be an array of numbers! Val=${endIndices}`)
    if (dimensions.length !== sheetIds.length || startIndices.length !== sheetIds.length || endIndices.length !== sheetIds.length) throw new RangeError(`Input arrays must be of the same length! Lengths=${sheetIds.length},${dimensions.length},${startIndices.length},${endIndices.length}`)
    if (!MorUtils.isNonNegativeNumber(googleApiCooldown)) throw new TypeError(`googleApiCooldown must be a non-negative number! Val=${googleApiCooldown}`)

    const requests = []
    for (let i = 0; i < sheetIds.length; i++) {
      requests.push({
        deleteDimension: {
          range: { sheetId: sheetIds[i], dimension: dimensions[i], startIndex: startIndices[i], endIndex: endIndices[i] }
        }
      })
    }

    const resource = { requests }
    const [response] = await Promise.all([this.#SHEETS_CLIENT.spreadsheets.batchUpdate({
      auth: SheetsWrapper.#AUTH,
      spreadsheetId,
      resource
    }), MorUtils.sleep(googleApiCooldown)])

    return response.data
  }
}
