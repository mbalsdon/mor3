import * as fs from 'fs'

/**
 * Wrapper class for MOR configuration settings -
 * Provides access to mor_config.json without having to read and parse the JSON in each file
 * @example
 *  // Without using the MorConfig class
 *  import * as fs from 'fs'
 *  const configRaw = fs.readFileSync('./mor_config.json')
 *  const config = JSON.parse(configRaw)
 *  const nmSheetId = config.SHEETS.NM.ID
 *
 *  // Using the MorConfig class
 *  import MorConfig from './MorConfig.js'
 *  const nmSheetId = MorConfig.SHEETS.NM.ID
 */
export default class MorConfig {
  static #cfg = JSON.parse(fs.readFileSync('./mor_config.json'))
  static LAST_UPDATE_CELL = this.#cfg.LAST_UPDATE_CELL
  static BOT_EMBED_COLOR = this.#cfg.BOT_EMBED_COLOR
  static SHEETS = this.#cfg.SHEETS
  static DRIVE = this.#cfg.DRIVE
  static JOBS_CACHE = './src/jobs/cache'
  static UPDATE_SCORES_CACHE = `${this.JOBS_CACHE}/updateScores.json`
}
