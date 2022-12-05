import MorScore from './MorScore.js'
import MorUser from './MorUser.js'

/** Provides some useful functions for MOR (and general JavaScript) */
export default class MorUtils {
  /** Maximum number of rows allowed in Google Sheets */
  static SHEETS_MAX_ROWS = 10000000

  /** Maximum number of columns allowed in Google Sheets */
  static SHEETS_MAX_COLS = 18278

  /** Discord bot error tag string */
  static DISCORD_BOT_ERROR_STR = 'DM spreadnuts#1566 on Discord or open an issue at https://github.com/mbalsdon/mor3/issues if you believe that this is a bug.'

  /** Returns true if input is an empty object
   * @param {*} v
   * @return {boolean}
   */
  static isEmptyObject (v) {
    return ((v) && (Object.keys(v).length === 0) && (Object.getPrototypeOf(v) === Object.prototype))
  }

  /**
   * Returns true if input is a function
   * @param {*} v 
   * @return {boolean}
   */
  static isFunction (v) {
    return (typeof v === 'function')
  }

  /**
   * Returns true if input is a number
   * @param {*} v
   * @return {boolean}
   */
  static isNumber (v) {
    return ((typeof v === 'number') && (!Number.isNaN(v)))
  }

  /**
   * Returns true if input is a non-negative number
   * @param {*} v
   * @return {boolean}
   */
  static isNonNegativeNumber (v) {
    return ((this.isNumber(v)) && (v >= 0))
  }

  /**
   * Returns true if input is a string
   * @param {*} v
   * @return {boolean}
   */
  static isString (v) {
    return (typeof v === 'string')
  }

  /**
   * Returns true if input is a numeric string
   * @param {*} v
   * @return {boolean}
   */
  static isNumericString (v) {
    return (this.isString(v) && typeof parseInt(v) === 'number' && !isNaN(parseInt(v)))
  }

  /**
   * Returns true if input is a positive numeric string
   * @param {*} v
   * @return {boolean}
   */
  static isPositiveNumericString (v) {
    return ((this.isNumericString(v)) && (parseInt(v) > 0))
  }

  /**
   * Returns true if input is a non-negative numeric string
   * @param {*} v
   * @return {boolean}
   */
  static isNonNegativeNumericString (v) {
    return ((this.isNumericString(v)) && ((parseInt(v) >= 0)))
  }

  /**
   * Returns true if input is either 'TRUE' or 'FALSE'
   * @param {*} v
   * @return {boolean}
   */
  static isBooleanString (v) {
    return ((this.isString(v)) && ((v === 'TRUE') || (v === 'FALSE')))
  }

  /**
   * Returns true if input is a valid HTTP URL
   * @param {*} v
   * @return {boolean}
   */
  static isValidHttpUrl (v) {
    if (!this.isString(v)) return false
    let url
    try { url = new URL(v) } catch (_) { return false }
    return ((url.protocol === 'http:') || (url.protocol === 'https:'))
  }

  /**
   * Returns true if input is a valid osu! user rank
   * @param {*} v
   * @return {boolean}
   */
  static isValidRank (v) {
    return ((this.isPositiveNumericString(v)) || (v === 'null'))
  }

  /**
   * Returns true if input is a valid osu! score accuracy
   * @param {*} v
   * @return {boolean}
   */
  static isValidAccuracyString (v) {
    return ((this.isNumericString(v)) && (parseInt(v) >= 0) && (parseInt(v) <= 100))
  }

  /**
   * Returns true if input is a valid MOR beatmap string
   * @param {*} v
   * @return {boolean}
   * @example
   *  // Returns true
   *  Utils.isValidBeatmapString('Demetori - Wind God Girl [Extra]')
   *
   *  // Returns true
   *  Utils.isValidBeatmapString('cookiezie - blue zenith [omg]')
   *
   *  // Returns false
   *  Utils.isValidBeatmapString('cookiezie- blue zenith [omg]')
   *
   *  // Returns false
   *  Utils.isValidBeatmapString('cookiezie - blue zenith[omg]')
   */
  static isValidBeatmapString (v) {
    if (!this.isString(v)) return false

    // Looks for ' - ' and '[]'
    const regex = /.* - .* \[.*\]/
    return regex.test(v)
  }

  /**
   * Returns true if input is a valid country code (two capital letters)
   * @param {*} v
   * @return {boolean}
   */
  static isValidCountryCode (v) {
    if (!this.isString(v)) return false

    const regex = /[A-Z]{2}/
    return regex.test(v)
  }

  /**
   * Returns true if input is a valid Google Sheets cell (up to 3 letters for columns, up to 5,000,000 cells)
   * @param {*} v
   * @return {boolean}
   */
  static isValidCell (v) {
    if (!this.isString(v)) return false

    const regex = /[A-Z]{1,3}\d{0,7}/
    return regex.test(v)
  }

  /**
   * Returns true if input is a valid ISO-8601 date (YYYY-MM-DDTNN:NN:NN+00:00)
   * @param {*} v
   * @return {boolean}
   */
  static isValidDate (v) {
    if (!this.isString(v)) return false

    const regex = /\d{4}[-](0[1-9]|1[0-2])[-](0[1-9]|[12][0-9]|3[01])[T](0[0-9]|1[0-9]|2[0-3])[:](0[0-9]|[1-5][0-9])[:](0[0-9]|[1-5][0-9])\+00:00/
    return regex.test(v)
  }

  /**
   * Returns true if input is an array
   * @param {*} v 
   * @return {boolean}
   */
  static isArray (v) {
    return Array.isArray(v)
  }

  /**
   * Returns true if input is an array of numbers
   * @param {*} v
   * @return {boolean}
   */
  static isNumberArray (v) {
    if (!this.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(x => this.isNumber(x))) return false
    return true
  }

  /**
   * Returns true if input is an array of strings
   * @param {*} v
   * @return {boolean}
   */
  static isStringArray (v) {
    if (!this.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(x => this.isString(x))) return false
    return true
  }

  /**
   * Returns true if input is an array of MorScore objects
   * @see {@link MorScore}
   * @param {*} v
   * @return {boolean}
   */
  static isMorScoreArray (v) {
    if (!this.isArray(v)) return false
    if (v.length === 0) return false
    if (!(v.every(a => a instanceof MorScore))) return false
    return true
  }

  /**
   * Returns true if input is an array of MorUser objects
   * @see {@link MorUser}
   * @param {*} v
   * @return {boolean}
   */
  static isMorUserArray (v) {
    if (!this.isArray(v)) return false
    if (v.length === 0) return false
    if (!(v.every(a => a instanceof MorUser))) return false
    return true
  }

  /**
   * Returns true if input is a two-dimensional array
   * @param {*} v
   * @return {boolean}
   */
  static is2DArray (v) {
    if (!this.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(a => this.isArray(a))) return false
    return true
  }

  /**
   * Turns an ISO-8601 date into a readable format
   * @param {string} dateString ISO-8601 date string
   * @throws {@link TypeError} if parameters are invalid
   * @return {string}
   */
  static prettifyDate (dateString) {
    if (!MorUtils.isValidDate(dateString)) throw new TypeError(`dateString is not a valid date! Val=${dateString}`)

    const d = new Date(dateString)

    const date = ('0' + (d.getDate() + 1)).slice(-2)
    let month = ''
    switch (d.getMonth() + 1) {
      case 1:
        month = 'January'
        break
      case 2:
        month = 'February'
        break
      case 3:
        month = 'March'
        break
      case 4:
        month = 'April'
        break
      case 5:
        month = 'May'
        break
      case 6:
        month = 'June'
        break
      case 7:
        month = 'July'
        break
      case 8:
        month = 'August'
        break
      case 9:
        month = 'September'
        break
      case 10:
        month = 'October'
        break
      case 11:
        month = 'November'
        break
      case 12:
        month = 'December'
    }
    const year = d.getFullYear()
    const hours = ('0' + (d.getUTCHours() + 1)).slice(-2)
    const minutes = ('0' + (d.getUTCMinutes() + 1)).slice(-2)

    const pwetty = `${date} ${month} ${year} at ${hours}:${minutes}`
    return pwetty
  }

  /**
   * Returns Discord emoji based on some arbitrary ranking
   * @param {number} rank
   * @return {string}
   */
  static medalEmoji (rank) {
    let medalEmoji = ':skull:'
    if (rank <= 24) medalEmoji = ':small_orange_diamond:'
    if (rank <= 9) medalEmoji = ':military_medal:'
    if (rank <= 4) medalEmoji = ':medal:'
    if (rank === 2) medalEmoji = ':third_place:'
    if (rank === 1) medalEmoji = ':second_place:'
    if (rank === 0) medalEmoji = ':first_place:'

    return medalEmoji
  }

  /**
   * Pauses thread execution for given amount of time
   * @param {number} ms milliseconds
   * @return {Promise<void>}
   * @example
   *  // Pauses code from executing for 1 second
   *  await Utils.sleep(1000)
   */
  static async sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
