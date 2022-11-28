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
  static BOT_EMBED_COLOR = this.#cfg.BOT_EMBED_COLOR
  static LAST_UPDATE_CELL = this.#cfg.LAST_UPDATE_CELL
  static JOBS_CACHE = this.#cfg.JOBS_CACHE
  static UPDATE_SCORES_CACHE = this.#cfg.UPDATE_SCORES_CACHE
  static API_COOLDOWN_MS = this.#cfg.API_COOLDOWN_MS
  static SERVER_ICON_URL = this.#cfg.SERVER_ICON_URL
  static SHEETS = this.#cfg.SHEETS
  static DRIVE = this.#cfg.DRIVE
}
