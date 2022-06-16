import { google } from 'googleapis'
import 'dotenv/config'

export default class DriveWrapper {
  static #AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_API_KEYFILE,
    scopes: 'https://www.googleapis.com/auth/drive'
  })

  #driveClient

  constructor (driveClient) {
    if (typeof driveClient === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.#driveClient = driveClient
  }

  static async build () {
    console.info('DriveFacade::build()')
    const authClient = DriveWrapper.#AUTH.getClient()
    const driveClient = google.drive({ version: 'v3', auth: authClient })
    return new DriveWrapper(driveClient)
  }

  async copyFile (fileId, name) {
    console.info('DriveWrapper::copyFile()')
    const response = await this.#driveClient.files.copy({
      auth: DriveWrapper.#AUTH,
      fileId,
      resource: {
        name,
        parents: [process.env.FOLDER_ID]
      }
    })
    return response.data
  }
}
