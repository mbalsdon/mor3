import Utils from './Utils.js'

export default class Score {
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

  toArray () {
    return Object.values(this)
  }

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
