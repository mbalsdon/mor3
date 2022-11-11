import { google } from 'googleapis'
import 'dotenv/config'
import { ConstructorError } from './Errors.js'
import Utils from './Utils.js'

/**
 * Wrapper class for Google Drive API v3
 * @see {@link https://developers.google.com/drive/api}
 */
export default class DriveWrapper {
  #DRIVE_CLIENT

  static #AUTH = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: 'https://www.googleapis.com/auth/drive'
  })

  /**
   * Constructs the wrapper.
   * Not meant to be called directly - use DriveWrapper.build() instead!
   * @see {@link build}
   * @param {*} driveClient authorized Google Drive client
   * @throws {@link ConstructorError} if driveClient doesn't exist or is structured improperly
   */
  constructor (driveClient) {
    if (typeof driveClient === 'undefined') throw new ConstructorError('driveClient is undefined! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(driveClient, 'context')) throw new ConstructorError('driveClient does not have property context! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(driveClient, 'drives')) throw new ConstructorError('driveClient does not have property drives! NOTE: Constructor cannot be called directly.')
    this.#DRIVE_CLIENT = driveClient
  }

  /**
   * Retrieves Google Drive API v3 client then constructs DriveWrapper object
   * @return {Promise<DriveWrapper>}
   * @example
   *  const drive = await DriveWrapper.build()
   */
  static async build () {
    console.info('DriveWrapper::build ()') // TODO: replace
    const authClient = await DriveWrapper.#AUTH.getClient()
    const driveClient = google.drive({ version: 'v3', auth: authClient })
    return new DriveWrapper(driveClient)
  }

  /**
   * Copies a Google Drive file into specified Google Drive folder
   * @see {@link https://developers.google.com/drive/api/v3/reference/files#resource} (Google Drive API v3 Files object)
   * @param {string} fileId the ID of the file to copy
   * @param {string} name the name of the new copied file
   * @param {string} folderId the ID of the folder to copy into
   * @throws {@link TypeError} if parameters are invalid
   * @return {Promise<*>} Google Drive API v3 Files object
   * @example
   *  const drive = await DriveWrapper.build()
   *  await drive.copyFile('1K3AwhYhTViLFT6PTLzprTykzcLAa1CoumWL7-hSmBQM', 'My Copied File', '1OUK20m4bHM-d_a91YzMnJ71r6uJe6WXi')
   */
  async copyFile (fileId, name, folderId) {
    console.info(`DriveWrapper::copyFile (${fileId}, ${name}, ${folderId})`) // TODO: replace
    if (!Utils.isString(fileId)) throw new TypeError(`fileId must be a string! Val=${fileId}`)
    if (!Utils.isString(name)) throw new TypeError(`name must be a string! Val=${name}`)
    if (!Utils.isString(folderId)) throw new TypeError(`folderId must be a string! Val=${folderId}`)
    const response = await this.#DRIVE_CLIENT.files.copy({
      auth: DriveWrapper.#AUTH,
      fileId,
      resource: {
        name,
        parents: [folderId]
      }
    })
    return response.data
  }
}
