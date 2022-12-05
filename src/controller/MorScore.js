import MorUtils from './MorUtils.js'

/** Contains data from an osu! score used in MOR sheets */
export default class MorScore {
  /** First row of MOR sheet containing score data */
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
   * @param {string[]} values Array of strings containing the following values:
   *
   *    values[0] - scoreId (string): ID of the score
   *
   *    values[1] - userId (string): ID of the user who set the score
   *
   *    values[2] - username (string): username of the user who set the score
   *
   *    values[3] - beatmap (string): beatmap of the score
   *
   *    values[4] - mods (string): mods of the score
   *
   *    values[5] - accuracy (string): accuracy of the score
   *
   *    values[6] - pp (string): pp of the score
   *
   *    values[7] - starRating (string): star rating of the score's map
   *
   *    values[8] - date (string): date the score was set on
   *
   *    values[9] - beatmapImgLink (string): beatmap image URL of the score
   *
   * @example
   *  const myScore = new Score([
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
   *  ])
   */
  constructor (values) {
    if (!MorUtils.isPositiveNumericString(values[0])) throw new TypeError(`scoreId must be a positive number string! Val=${values[0]}`)
    else if (!MorUtils.isPositiveNumericString(values[1])) throw new TypeError(`userId must be a positive number string! Val= ${values[1]}`)
    else if (!MorUtils.isString(values[2])) throw new TypeError(`username must be a string! Val=${values[2]}`)
    else if (!MorUtils.isValidBeatmapString(values[3])) throw new TypeError(`beatmap must be a valid beatmap string! Val=${values[3]}`)
    else if (!MorUtils.isString(values[4])) throw new TypeError(`mods must be a string! Val=${values[4]}`)
    else if (!MorUtils.isValidAccuracyString(values[5])) throw new TypeError(`accuracy must be a valid accuracy string! Val=${values[5]}`)
    else if (!MorUtils.isNonNegativeNumericString(values[6])) throw new TypeError(`pp must be a a non-negative number string! Val=${values[6]}`)
    else if (!MorUtils.isNumericString(values[7])) throw new TypeError(`starRating must be a number string! Val=${values[7]}`)
    else if (!MorUtils.isValidDate(values[8])) throw new TypeError(`date must be a valid date string! Val=${values[8]}`)
    else if (!MorUtils.isValidHttpUrl(values[9])) throw new TypeError(`beatmapImgLink must be a valid HTTP URL string! Val=${values[9]}`)
    else {
      this.scoreId = values[0]
      this.userId = values[1]
      this.username = values[2]
      this.beatmap = values[3]
      this.mods = values[4]
      this.accuracy = values[5]
      this.pp = values[6]
      this.starRating = values[7]
      this.date = values[8]
      this.beatmapImgLink = values[9]
    }
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

  /**
   * Converts Score fields to array
   * @return {string[]}
   */
  toArray () {
    return Object.values(this)
  }
}
