export default class Utils {
  //
  static isString (v) { return (typeof v === 'string' || v instanceof String) }

  //
  static isNumber (v) { return (typeof v === 'number' || !Number.isNaN(v)) }

  //
  static isPositiveNumber (v) { return this.isNumber(v) && (v > 0) }

  //
  static isValidAccuracy (v) { return this.isNumber(v) && (v >= 0) && (v <= 100) }

  //
  static isValidHttpUrl (v) {
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
    const regex = /.* - .* \[.*\]/
    return regex.test(v)
  }

  // Checks for ISO-8601 format (YYYY-MM-DDTNN:NN:NN+00:00)
  static isValidDate (v) {
    const regex = /\d{4}[-]\d{2}[-]\d{2}[T]\d{2}[:]\d{2}[:]\d{2}\+00:00/
    return regex.test(v)
  }
}
