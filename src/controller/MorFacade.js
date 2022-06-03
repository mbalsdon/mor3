const OsuWrapper = require('./OsuWrapper')

module.exports = class MorFacade {
  osu

  constructor (osuWrapper) {
    if (typeof osuWrapper === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.osu = osuWrapper
  }

  static build () {
    return OsuWrapper.build()
      .then((osuWrapper) => {
        return new MorFacade(osuWrapper)
      })
  }

  addUser (userId) {
    console.log(`MorFacade::addUser( ${userId} )`)
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
}
