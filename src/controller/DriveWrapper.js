import { google } from 'googleapis'
import 'dotenv/config'
import { ConstructorError } from './Errors.js'
import Config from './Config.js'

/**
 * Wrapper class for Google Drive API v3
 * @see {@link https://developers.google.com/sheets/api}
 */
export default class DriveWrapper {
  static #AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/drive'
  })

  #DRIVE_CLIENT

  /**
   * Constructs the wrapper.
   * Not meant to be called directly - use DriveWrapper.build() instead!
   * @see {@link build}
   * @param {*} driveClient authorized Google Drive client
   * @throws {ConstructorError} if driveClient doesn't exist or is structured improperly
   */
  constructor (driveClient) {
    if (typeof driveClient === 'undefined') throw new ConstructorError('sheetsClient is undefined! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(driveClient, 'context')) throw new ConstructorError('driveClient does not have property context! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(driveClient, 'drives')) throw new ConstructorError('driveClient does not have property drives! NOTE: Constructor cannot be called directly.')
    this.#DRIVE_CLIENT = driveClient
  }

  /**
   * Retrieves Google Drive API v3 client then constructs DriveWrapper object.
   * @return {DriveWrapper}
   */
  static async build () {
    console.info('DriveWrapper::build ()') // TODO: replace
    const authClient = await DriveWrapper.#AUTH.getClient()
    const driveClient = google.drive({ version: 'v3', auth: authClient })
    return new DriveWrapper(driveClient)
  }

  async copyFile (fileId, name) {
    console.info(`DriveWrapper::copyFile (${fileId}, ${name})`)
    const response = await this.#DRIVE_CLIENT.files.copy({
      auth: DriveWrapper.#AUTH,
      fileId,
      resource: {
        name,
        parents: [Config.DRIVE.BACKUP_FOLDER_ID]
      }
    })
    return response.data
  }
}
