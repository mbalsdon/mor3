import { InvalidModsError } from './Errors.js'
import Mods from './Mods.js'
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
    if (!Utils.isPositiveNumber(scoreId)) throw new TypeError(`scoreId must be a positive number! scoreId = ${scoreId}`)
    else if (!Utils.isPositiveNumber(userId)) throw new TypeError(`userId must be a positive number! userId =  ${userId}`)
    else if (!Utils.isString(username)) throw new TypeError(`username must be a string! username = ${username}`)
    else if (!Utils.isValidBeatmapString(beatmap)) throw new TypeError(`beatmap must be a valid beatmap string! beatmap = ${beatmap}`)
    else if (!Mods.isValidModString(mods)) throw new InvalidModsError(`mods must be a valid mod string! mods = ${mods}\nValid mod strings: ${Mods.validModStrings().join(' ')}`)
    else if (!Utils.isPercentage(accuracy)) throw new TypeError(`accuracy must be a percentage! accuracy = ${accuracy}`)
    else if (!Utils.isPositiveNumber(pp)) throw new TypeError(`pp must be a positive number! pp = ${pp}`)
    else if (!Utils.isPositiveNumber(starRating)) throw new TypeError(`starRating must be a positive number! starRating = ${starRating}`)
    else if (!Utils.isValidDate(date)) throw new TypeError(`date must be a valid date! date = ${date}`)
    else if (!Utils.isValidHttpUrl(beatmapImgLink)) throw new TypeError(`beatmapImgLink must be a valid HTTP URL! beatmapImgLink = ${beatmapImgLink}`)
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

  toRow () {
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
    else throw new TypeError(`columnName is not valid! Val: ${columnName}`)
  }
}
