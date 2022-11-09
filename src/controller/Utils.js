import Score from './Score.js'
import User from './User.js'

export default class Utils {
  //
  static SHEETS_MAX_ROWS = 10000000
  static SHEETS_MAX_COLS = 18278

  //
  static isNumber (v) {
    return (typeof v === 'number' && !Number.isNaN(v))
  }

  //
  static isString (v) {
    return (typeof v === 'string')
  }

  //
  static isNumericString (v) {
    return (this.isString(v) && typeof parseInt(v) === 'number' && !isNaN(parseInt(v)))
  }

  //
  static isPositiveNumericString (v) {
    return (this.isNumericString(v) && parseInt(v) > 0)
  }

  //
  static isValidRank (v) {
    return (this.isPositiveNumericString(v) || v === 'null')
  }

  static isNonNegativeNumericString (v) {
    return (this.isNumericString(v) && (parseInt(v) >= 0))
  }

  //
  static isValidAccuracyString (v) {
    return (this.isNumericString(v) && parseInt(v) >= 0 && parseInt(v) <= 100)
  }

  //
  static is2DArray (v) {
    if (!Array.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(a => Array.isArray(a))) return false
    return true
  }

  //
  static isStringArray (v) {
    if (!Array.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(x => this.isString(x))) return false
    return true
  }

  //
  static isNumberArray (v) {
    if (!Array.isArray(v)) return false
    if (v.length === 0) return false
    if (!v.every(x => this.isNumber(x))) return false
    return true
  }

  //
  static isScoreArray (v) {
    if (!Array.isArray(v)) return false
    if (v.length === 0) return false
    if (!(v.every(a => a instanceof Score))) return false
    return true
  }

  //
  static isUserArray (v) {
    if (!Array.isArray(v)) return false
    if (v.length === 0) return false
    if (!(v.every(a => a instanceof User))) return false
    return true
  }

  //
  static isValidHttpUrl (v) {
    if (!this.isString(v)) return false
    let url
    try {
      url = new URL(v)
    } catch (_) {
      return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
  }

  // Checks for hyphen and square brackets, with proper spacing
  static isValidBeatmapString (v) {
    if (!this.isString(v)) return false
    const regex = /.* - .* \[.*\]/
    return regex.test(v)
  }

  // Up to 3 letters for columns, up to 5,000,000 cells
  static isValidCell (v) {
    if (!this.isString(v)) return false
    const regex = /[A-Z]{1,3}\d{0,7}/
    return regex.test(v)
  }

  // Checks for ISO-8601 format (YYYY-MM-DDTNN:NN:NN+00:00)
  static isValidDate (v) {
    if (!this.isString(v)) return false
    const regex = /\d{4}[-]\d{2}[-]\d{2}[T]\d{2}[:]\d{2}[:]\d{2}\+00:00/
    return regex.test(v)
  }

  //
  static async sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }
}
