const { google } = require('googleapis')

require('dotenv').config()

module.exports = class SheetsWrapper {
  static SPREADSHEET_ID = '1hduRLLIFjVwLGjXyt7ph3301xfXS6qjSnYCm18YP4iA'
  static AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_API_KEYFILE,
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
  })

  sheets

  constructor (sheets) {
    if (typeof sheets === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.sheets = sheets
  }

  static build () {
    return SheetsWrapper.AUTH.getClient()
      .then((authClient) => {
        const sheets = google.sheets({ version: 'v4', auth: authClient })
        return new SheetsWrapper(sheets)
      })
  }

  fetchMetadata () {
    console.info('SheetsWrapper::fetchMetadata()')
    return this.sheets.spreadsheets.get({
      auth: SheetsWrapper.AUTH,
      spreadsheetId: SheetsWrapper.SPREADSHEET_ID
    })
      .then((response) => {
        return response.data
      })
  }
}
