import MorConfig from '../controller/MorConfig.js'
import MorFacade from '../controller/MorFacade.js'
import MorUtils from '../controller/MorUtils.js'

export default async function createBackup () {
  console.time('::createBackup () >> Time elapsed') // TODO: replace
  console.info('::createBackup () >> Creating a backup file for the sheet...') // TODO: replace
  const mor = await MorFacade.build()
  const metadata = await mor.getSheetMetadata()
  const dateString = new Date(Date.now()).toISOString()
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  await mor.backupFile(MorConfig.SHEETS.SPREADSHEET.ID, `${metadata.properties.title} ${dateString}`, MorConfig.DRIVE.BACKUP_FOLDER_ID)
  await MorUtils.sleep(MorConfig.API_COOLDOWN_MS * 3)
  console.info(`::createBackup () >> Job completed at ${dateString}`) // TODO: replace
  console.timeEnd('::createBackup () >> Time elapsed') // TODO: replace
}
