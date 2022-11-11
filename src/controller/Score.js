import Utils from './Utils.js'

/**
 * MOR Score object - Contains data from an osu! score used in MOR sheets
 */
export default class Score {
  /**
   * First row of MOR sheet containing score data
   */
  static START_ROW = 2

  scoreId
  userId
  username
  beatmap
  mods
  accuracy
  pp
  starRating
  date
  beatmapImgLink

  /**
   * Constructs a MOR Score object
   * @param {string} scoreId ID of the score
   * @param {string} userId ID of the user who set the score
   * @param {string} username username of the user who set the score
   * @param {string} beatmap beatmap of the score
   * @param {string} mods mods of the score
   * @param {string} accuracy accuracy of the score
   * @param {string} pp pp of the score
   * @param {string} starRating star rating of the score's map
   * @param {string} date date the score was set on
   * @param {string} beatmapImgLink beatmap image URL of the score
   * @example
   *  const myScore = new Score(
   *    '2283307549',
   *    '124493',
   *    'Cookiezi',
   *    'xi - Blue Zenith [FOUR DIMENSIONS]',
   *    'HDHR',
   *    '99.09',
   *    '727',
   *    '7.26',
   *    '2022-07-27T07:27:27+00:00',
   *    'https://assets.ppy.sh/beatmaps/292301/covers/list@2x.jpg?1650630372'
   *  )
   */
  constructor (scoreId, userId, username, beatmap, mods, accuracy, pp, starRating, date, beatmapImgLink) {
    if (!Utils.isPositiveNumericString(scoreId)) throw new TypeError(`scoreId must be a positive number string! Val=${scoreId}`)
    else if (!Utils.isPositiveNumericString(userId)) throw new TypeError(`userId must be a positive number string! Val= ${userId}`)
    else if (!Utils.isString(username)) throw new TypeError(`username must be a string! Val=${username}`)
    else if (!Utils.isValidBeatmapString(beatmap)) throw new TypeError(`beatmap must be a valid beatmap string! Val=${beatmap}`)
    else if (!Utils.isString(mods)) throw new TypeError(`mods must be a string! Val=${mods}`)
    else if (!Utils.isValidAccuracyString(accuracy)) throw new TypeError(`accuracy must be a valid accuracy string! Val=${accuracy}`)
    else if (!Utils.isNonNegativeNumericString(pp)) throw new TypeError(`pp must be a a non-negative number string! Val=${pp}`)
    else if (!Utils.isPositiveNumericString(starRating)) throw new TypeError(`starRating must be a positive number string! Val=${starRating}`)
    else if (!Utils.isValidDate(date)) throw new TypeError(`date must be a valid date string! Val=${date}`)
    else if (!Utils.isValidHttpUrl(beatmapImgLink)) throw new TypeError(`beatmapImgLink must be a valid HTTP URL string! Val=${beatmapImgLink}`)
    else {
      this.scoreId = scoreId
      this.userId = userId
      this.username = username
      this.beatmap = beatmap
      this.mods = mods
      this.accuracy = accuracy
      this.pp = pp
      this.starRating = starRating
      this.date = date
      this.beatmapImgLink = beatmapImgLink
    }
  }

  /**
   * Converts Score fields to array
   * @return {string[]}
   */
  toArray () {
    return Object.values(this)
  }

  /**
   * Given the field name of a Score object, returns associated MOR sheet column
   * @param {string} columnName Score object field name
   * @throws {@link TypeError} if parameters are invalid
   * @return {string} associated MOR sheet column
   */
  static columnLetter (columnName) {
    if (columnName === 'scoreId') return 'A'
    else if (columnName === 'userId') return 'B'
    else if (columnName === 'username') return 'C'
    else if (columnName === 'beatmap') return 'D'
    else if (columnName === 'mods') return 'E'
    else if (columnName === 'accuracy') return 'F'
    else if (columnName === 'pp') return 'G'
    else if (columnName === 'starRating') return 'H'
    else if (columnName === 'date') return 'I'
    else if (columnName === 'beatmapImgLink') return 'J'
    else throw new TypeError(`columnName is not valid! Val=${columnName}`)
  }
}
