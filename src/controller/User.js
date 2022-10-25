import Utils from './Utils.js'

export default class User {
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

  constructor (userId, username, globalRank, pp, accuracy, playtime, top1s, top2s, top3s, top5s, top10s, top25s, pfpLink) {
    if (!Utils.isPositiveNumber(userId)) throw new TypeError(`userId must be a positive number! userId = ${userId}`)
    else if (!Utils.isString(username)) throw new TypeError(`username must be a string! username = ${username}`)
    else if (!Utils.isPositiveNumber(globalRank)) throw new TypeError(`globalRank must be a positive number! globalRank = ${globalRank}`)
    else if (!Utils.isPositiveNumber(pp)) throw new TypeError(`pp must be a positive number! pp = ${pp}`)
    else if (!Utils.isValidAccuracy(accuracy)) throw new TypeError(`accuracy must be a valid accuracy! accuracy = ${accuracy}`)
    else if (!Utils.isPositiveNumber(playtime)) throw new TypeError(`playtime must be a positive number! playtime = ${playtime}`)
    else if (!Utils.isPositiveNumber(top1s)) throw new TypeError(`top1s must be a positive number! top1s = ${top1s}`)
    else if (!Utils.isPositiveNumber(top2s)) throw new TypeError(`top2s must be a positive number! top2s = ${top2s}`)
    else if (!Utils.isPositiveNumber(top3s)) throw new TypeError(`top3s must be a positive number! top3s = ${top3s}`)
    else if (!Utils.isPositiveNumber(top5s)) throw new TypeError(`top5s must be a positive number! top5s = ${top5s}`)
    else if (!Utils.isPositiveNumber(top10s)) throw new TypeError(`top10s must be a positive number! top10s = ${top10s}`)
    else if (!Utils.isPositiveNumber(top25s)) throw new TypeError(`top25s must be a positive number! top25s = ${top25s}`)
    else if (!Utils.isValidHttpUrl(pfpLink)) throw new TypeError(`pfpLink must be a valid HTTP URL! pfpLink = ${pfpLink}`)
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

  toRow () {
    return Object.values(this)
  }

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
    else throw new TypeError(`columnName is not valid! Val: ${columnName}`)
  }
}
