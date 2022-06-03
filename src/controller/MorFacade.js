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
    // TODO: 1 check if user is in sheets 2 if not, add it and resolve / else reject (sheetswrapper throws the error)
    return new Promise((resolve, reject) => {
      this.osu.fetchUsername(userId)
        .then((response) => {
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  fetchMetadata () {
    console.info('MorFacade::fetchMetadata()')
    return new Promise((resolve, reject) => {
      this.sheets.fetchMetadata()
        .then((response) => {
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}
