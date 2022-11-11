import Utils from './Utils.js'

/**
 * MOR User object - Contains data from an osu! user used in MOR sheets
 */
export default class User {
  /**
   * First row of MOR sheet containing score data
   */
  static START_ROW = 2

  userId
  username
  globalRank
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

  /**
   * Constructs a MOR User object
   * @param {string} userId ID of the user
   * @param {string} username username of the user
   * @param {string} globalRank global rank of the user
   * @param {string} pp profile pp of the user
   * @param {string} accuracy profile accuracy of the user
   * @param {string} playtime profile playtime of the user
   * @param {string} top1s number of user's MOR sheet top 1s
   * @param {string} top2s number of user's MOR sheet top 2s
   * @param {string} top3s number of user's MOR sheet top 3s
   * @param {string} top5s number of user's MOR sheet top 5s
   * @param {string} top10s number of user's MOR sheet top 10s
   * @param {string} top25s number of user's MOR sheet top 25s
   * @param {string} pfpLink profile picture URL of the user
   * @example
   *  const myUser = new User(
   *    '6385683',
   *    'spreadnuts',
   *    '1446',
   *    '10756.8',
   *    '98.95',
   *    '1470',
   *    '1',
   *    '2',
   *    '1',
   *    '1',
   *    '5',
   *    '13',
   *    'https://a.ppy.sh/6385683?1660441648.jpeg'
   *  )
   */
  constructor (userId, username, globalRank, pp, accuracy, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink) {
    if (!Utils.isPositiveNumericString(userId)) throw new TypeError(`userId must be a positive number string! Val=${userId}`)
    else if (!Utils.isString(username)) throw new TypeError(`username must be a string! Val=${username}`)
    else if (!Utils.isValidRank(globalRank)) throw new TypeError(`globalRank must be a valid rank string! Val=${globalRank}`)
    else if (!Utils.isNonNegativeNumericString(pp)) throw new TypeError(`pp must be a a non-negative number string! Val=${pp}`)
    else if (!Utils.isValidAccuracyString(accuracy)) throw new TypeError(`accuracy must be a valid accuracy string! Val=${accuracy}`)
    else if (!Utils.isPositiveNumericString(playtime)) throw new TypeError(`playtime must be a positive number string! Val=${playtime}`)
    else if (!Utils.isNumericString(top1s)) throw new TypeError(`top1s must be a number string! Val=${top1s}`)
    else if (!Utils.isNumericString(top2s)) throw new TypeError(`top2s must be a number string! Val=${top2s}`)
    else if (!Utils.isNumericString(top3s)) throw new TypeError(`top3s must be a number string! Val=${top3s}`)
    else if (!Utils.isNumericString(top5s)) throw new TypeError(`top5s must be a number string! Val=${top5s}`)
    else if (!Utils.isNumericString(top10s)) throw new TypeError(`top10s must be a number string! Val=${top10s}`)
    else if (!Utils.isNumericString(top25s)) throw new TypeError(`top25s must be a number string! Val=${top25s}`)
    else if (!Utils.isValidHttpUrl(pfpLink)) throw new TypeError(`pfpLink must be a valid HTTP URL string! Val=${pfpLink}`)
    else {
      this.userId = userId
      this.username = username
      this.globalRank = globalRank
      this.pp = pp
      this.accuracy = accuracy
      this.playtime = playtime
      this.top1s = top1s
      this.top2s = top2s
      this.top3s = top3s
      this.top5s = top5s
      this.top10s = top10s
      this.top25s = top25s
      this.pfpLink = pfpLink
    }
  }

  /**
   * Converts User fields to array
   * @return {string[]}
   */
  toArray () {
    return Object.values(this)
  }

  /**
   * Given the field name of a User object, returns associated MOR sheet column
   * @param {string} columnName User object field name
   * @throws {@link TypeError} if parameters are invalid
   * @return {string} associated MOR sheet column
   */
  static columnLetter (columnName) {
    if (columnName === 'userId') return 'A'
    else if (columnName === 'username') return 'B'
    else if (columnName === 'globalRank') return 'C'
    else if (columnName === 'pp') return 'D'
    else if (columnName === 'accuracy') return 'E'
    else if (columnName === 'playtime') return 'F'
    else if (columnName === 'top1s') return 'G'
    else if (columnName === 'top2s') return 'H'
    else if (columnName === 'top3s') return 'I'
    else if (columnName === 'top5s') return 'J'
    else if (columnName === 'top10s') return 'K'
    else if (columnName === 'top25s') return 'L'
    else if (columnName === 'pfpLink') return 'M'
    else throw new TypeError(`columnName is not valid! Val=${columnName}`)
  }
}
