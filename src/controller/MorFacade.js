const OsuWrapper = require('./OsuWrapper')
const SheetsWrapper = require('./SheetsWrapper')

module.exports = class MorFacade {
  osu
  sheets

  constructor (osuWrapper, sheetsWrapper) {
    if (typeof sheetsWrapper === 'undefined' || typeof osuWrapper === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.osu = osuWrapper
    this.sheets = sheetsWrapper
  }

  static build () {
    return OsuWrapper.build()
      .then((osuWrapper) => {
        return SheetsWrapper.build()
          .then((sheetsWrapper) => {
            return new MorFacade(osuWrapper, sheetsWrapper)
          })
      })
  }

  getUserIds () {
    console.info('MorFacade::getUserIds()')
    return new Promise((resolve, reject) => {
      this.sheets.fetchUserIds()
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  }

  putUser (userId) {
    console.info(`MorFacade::putUser( ${userId} )`)
    return new Promise((resolve, reject) => {
      this.sheets.fetchUserIds()
        .then((userIds) => {
          // Check if user ID is already in the sheet
          if (userIds.includes(userId)) {
            reject(new Error(`User ID ${userId} has already been added`))
          } else {
            // Get username, then put user ID & username in the sheet
            this.osu.fetchUsername(userId)
              .then((username) => {
                this.sheets.insertUser(userId, username)
                  .then((response) => resolve(response))
                  .catch((error) => reject(error))
              })
              .catch((error) => reject(error))
          }
        })
        .catch((error) => reject(error))
    })
  }

  deleteUser (userId) {
    console.info(`MorFacade::deleteUser( ${userId} )`)
    return new Promise((resolve, reject) => {
      this.sheets.removeUser(userId)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  }

  getMetadata () {
    console.info('MorFacade::getMetadata()')
    return new Promise((resolve, reject) => {
      this.sheets.fetchMetadata()
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  }

  scrapeUserTopPlays () {
    console.info('MorFacade::scrapeUserTopPlays()')
    this.sheets.fetchUserIds()
      .then((userIds) => {
        for (const id of userIds) {
          this.osu.fetchUserTopPlays(id)
            .then((scores) => {
              console.log(scores.map((s) => [s.user.username, s.beatmapset.title]))
              // helper function parse relevant data
              // put into dict (key=modcombo, val=sorted list by pp)
              // remember to remove nf,so,sd,pf,etc.
            })
        }
      })
    // { ... }
  }
}
