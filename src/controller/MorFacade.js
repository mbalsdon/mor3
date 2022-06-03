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

  addUser (userId) {
    console.info(`MorFacade::addUser( ${userId} )`)
    return new Promise((resolve, reject) => {
      this.sheets.fetchUserIds()
        .then((response) => {
          // Check if user ID is already in the sheet
          if (response.includes(userId)) {
            reject(new Error(`User ID ${userId} has already been added`))
          } else {
            // Get username, then put user ID & username in the sheet
            this.osu.fetchUsername(userId)
              .then((username) => {
                this.sheets.putUser(userId, username)
                  .then((response) => resolve(response))
                  .catch((error) => reject(error))
              })
              .catch((error) => reject(error))
          }
        })
        .catch((error) => reject(error))
    })
  }

  fetchMetadata () {
    console.info('MorFacade::fetchMetadata()')
    return new Promise((resolve, reject) => {
      this.sheets.fetchMetadata()
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  }

  fetchUserIds () {
    console.info('MorFacade::fetchUserIds()')
    return new Promise((resolve, reject) => {
      this.sheets.fetchUserIds()
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  }
}
