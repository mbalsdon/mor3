import MorUtils from './MorUtils.js'

/** Contains data from an osu! user used in MOR sheets */
export default class MorUser {
  /** First row of MOR sheet containing score data */
  static START_ROW = 2

  userId
  username
  playstyle
  countryCode
  globalRank
  countryRank
  pp
  accuracy
  playtime
  top1s
  top2s
  top3s
  top5s
  top10s
  top25s
  pfpLink
  autotrack

  /**
   * Constructs a MOR User object
   * @param {string[]} values Array of strings containing the following values:

   *    values[0] - userId (string): ID of the user
   *
   *    values[1] - username (string): username of the user
   *
   *    values[2] - playstyle (string): profile playstyle of the user
   * 
   *    values[3] - countryCode (string): country code of the user's country
   *
   *    values[4] - globalRank (string): global rank of the user
   *
   *    values[5] - countryRank (string): country rank of the user
   *
   *    values[6] - pp (string): profile pp of the user
   *
   *    values[7] - accuracy (string): profile accuracy of the user
   *
   *    values[8] - playtime (string): profile playtime of the user
   *
   *    values[9] - top1s (string): number of user's MOR sheet top 1s
   *
   *    values[10] - top2s (string): number of user's MOR sheet top 2s
   *
   *    values[11] - top3s (string): number of user's MOR sheet top 3s
   *
   *    values[12] - top5s (string): number of user's MOR sheet top 5s
   *
   *    values[13] - top10s (string): number of user's MOR sheet top 10s
   *
   *    values[14] - top25s (string): number of user's MOR sheet top 25s
   *
   *    values[15] - pfpLink (string): profile picture URL of the user
   *
   *    values[16] - autotrack (string): TRUE if user's plays are being tracked, FALSE if not
   *
   * @example
   *  const myUser = new MorUser([
   *    '6385683',
   *    'spreadnuts',
   *    'mouse',
   *    'CA',
   *    '1446',
   *    '76'
   *    '10756.8',
   *    '98.95',
   *    '1470',
   *    '1', '2', '1', '1', '5', '13',
   *    'https://a.ppy.sh/6385683?1660441648.jpeg',
   *    'TRUE'
   *  ])
   */
  constructor (values) {
    if (!MorUtils.isPositiveNumericString(values[0])) throw new TypeError(`userId must be a positive number string! Val=${values[0]}`)
    else if (!MorUtils.isString(values[1])) throw new TypeError(`username must be a string! Val=${values[1]}`)
    else if (!MorUtils.isString(values[2])) throw new TypeError(`playstyle must be a string! Val=${values[2]}`)
    else if (!MorUtils.isValidCountryCode(values[3])) throw new TypeError(`countryCode must be a valid country code string! Val=${values[3]}`)
    else if (!MorUtils.isValidRank(values[4])) throw new TypeError(`globalRank must be a valid rank string! Val=${values[4]}`)
    else if (!MorUtils.isValidRank(values[5])) throw new TypeError(`countryRank must be a valid rank string! Val=${values[5]}`)
    else if (!MorUtils.isNonNegativeNumericString(values[6])) throw new TypeError(`pp must be a a non-negative number string! Val=${values[6]}`)
    else if (!MorUtils.isValidAccuracyString(values[7])) throw new TypeError(`accuracy must be a valid accuracy string! Val=${values[7]}`)
    else if (!MorUtils.isPositiveNumericString(values[8])) throw new TypeError(`playtime must be a positive number string! Val=${values[8]}`)
    else if (!MorUtils.isNumericString(values[9])) throw new TypeError(`top1s must be a number string! Val=${values[9]}`)
    else if (!MorUtils.isNumericString(values[10])) throw new TypeError(`top2s must be a number string! Val=${values[10]}`)
    else if (!MorUtils.isNumericString(values[11])) throw new TypeError(`top3s must be a number string! Val=${values[11]}`)
    else if (!MorUtils.isNumericString(values[12])) throw new TypeError(`top5s must be a number string! Val=${values[12]}`)
    else if (!MorUtils.isNumericString(values[13])) throw new TypeError(`top10s must be a number string! Val=${values[13]}`)
    else if (!MorUtils.isNumericString(values[14])) throw new TypeError(`top25s must be a number string! Val=${values[14]}`)
    else if (!MorUtils.isValidHttpUrl(values[15])) throw new TypeError(`pfpLink must be a valid HTTP URL string! Val=${values[15]}`)
    else if (!MorUtils.isBooleanString(values[16])) throw new TypeError(`autotrack must either be TRUE or FALSE! Val=${values[16]}`)
    else {
      this.userId = values[0]
      this.username = values[1]
      this.playstyle = values[2]
      this.countryCode = values[3]
      this.globalRank = values[4]
      this.countryRank = values[5]
      this.pp = values[6]
      this.accuracy = values[7]
      this.playtime = values[8]
      this.top1s = values[9]
      this.top2s = values[10]
      this.top3s = values[11]
      this.top5s = values[12]
      this.top10s = values[13]
      this.top25s = values[14]
      this.pfpLink = values[15]
      this.autotrack = values[16]
    }
  }

  /**
   * Given the field name of a MorUser object, returns associated MOR sheet column
   * @param {string} columnName MorUser object field name
   * @throws {@link TypeError} if parameters are invalid
   * @return {string} associated MOR sheet column
   */
  static columnLetter (columnName) {
    if (columnName === 'userId') return 'A'
    else if (columnName === 'username') return 'B'
    else if (columnName === 'playstyle') return 'C'
    else if (columnName === 'countryCode') return 'D'
    else if (columnName === 'globalRank') return 'E'
    else if (columnName === 'countryRank') return 'F'
    else if (columnName === 'pp') return 'G'
    else if (columnName === 'accuracy') return 'H'
    else if (columnName === 'playtime') return 'I'
    else if (columnName === 'top1s') return 'J'
    else if (columnName === 'top2s') return 'K'
    else if (columnName === 'top3s') return 'L'
    else if (columnName === 'top5s') return 'M'
    else if (columnName === 'top10s') return 'N'
    else if (columnName === 'top25s') return 'O'
    else if (columnName === 'pfpLink') return 'P'
    else if (columnName === 'autotrack') return 'Q'
    else throw new TypeError(`columnName is not valid! Val=${columnName}`)
  }

  /**
   * Converts MorUser fields to array
   * @return {string[]}
   */
  toArray () {
    return Object.values(this)
  }
}
