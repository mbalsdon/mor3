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

  /**
   * Returns true if input is a number
   * @param {*} v
   * @return {boolean}
   */
  static isNumber (v) {
    return (typeof v === 'number' && !Number.isNaN(v))
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
    return (this.isNumericString(v) && parseInt(v) > 0)
  }

  /**
   * Returns true if input is a non-negative numeric string
   * @param {*} v
   * @return {boolean}
   */
  static isNonNegativeNumericString (v) {
    return (this.isNumericString(v) && (parseInt(v) >= 0))
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
    return url.protocol === 'http:' || url.protocol === 'https:'
  }

  /**
   * Returns true if input is a valid osu! user rank
   * @param {*} v
   * @return {boolean}
   */
  static isValidRank (v) {
    return (this.isPositiveNumericString(v) || v === 'null')
  }

  /**
   * Returns true if input is a valid osu! score accuracy
   * @param {*} v
   * @return {boolean}
   */
  static isValidAccuracyString (v) {
    return (this.isNumericString(v) && parseInt(v) >= 0 && parseInt(v) <= 100)
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
   * Returns true if input is a valid Google Sheets cell
   * @param {*} v
   * @return {boolean}
   */
  static isValidCell (v) {
    if (!this.isString(v)) return false
    // Up to 3 letters for columns, up to 5,000,000 cells
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
    const regex = /\d{4}[-]\d{2}[-]\d{2}[T]\d{2}[:]\d{2}[:]\d{2}\+00:00/
    return regex.test(v)
  }

  /**
   * Returns true if input is an array of numbers
   * @param {*} v
   * @return {boolean}
   */
  static isNumberArray (v) {
    if (!Array.isArray(v)) return false
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
    if (!Array.isArray(v)) return false
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
    if (!Array.isArray(v)) return false
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
    if (!Array.isArray(v)) return false
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
    if (!Array.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(a => Array.isArray(a))) return false
    return true
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
