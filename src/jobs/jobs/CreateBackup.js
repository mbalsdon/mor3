import MorConfig from '../../controller/utils/MorConfig.js'

import MorFacade from '../../controller/MorFacade.js'

import '../../Loggers.js'
import * as winston from 'winston'
const logger = winston.loggers.get('jobs')

/**
 * Creates a backup file for the MOR spreadsheet in Google Drive.
 */
export default async function createBackup () {
  const startTimeMs = new Date(Date.now()).getTime()
  logger.info(`createBackup initiated; creating a backup file for the ${MorConfig.SHEETS.SPREADSHEET.NAME} sheet...`)

  const mor = await MorFacade.build()

  const metadata = await mor.getSheetMetadata()
  const fileName = `${metadata.properties.title} ${new Date(Date.now()).toISOString()}`
  await mor.backupFile(MorConfig.SHEETS.SPREADSHEET.ID, fileName, MorConfig.DRIVE.BACKUP_FOLDER_ID)

  const endTimeMs = new Date(Date.now()).getTime()
  const durationMin = (endTimeMs - startTimeMs) / 60000
  logger.info(`createBackup job completed! Duration=${durationMin.toFixed(2)}min`)
}
