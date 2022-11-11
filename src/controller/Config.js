import * as fs from 'fs'

/**
 * Wrapper class for MOR configuration settings -
 * Provides access to config.json without having to read and parse the JSON in each file
 * @example
 *  // Without using the Config class
 *  import * as fs from 'fs'
 *  const configRaw = fs.readFileSync('./config.json')
 *  const config = JSON.parse(configRaw)
 *  const nmSheetId = config.SHEETS.NM.ID
 *
 *  // Using the Config class
 *  import Config from './Config.js'
 *  const nmSheetId = Config.SHEETS.NM.ID
 */
export default class Config {
  static #cfg = JSON.parse(fs.readFileSync('./config.json'))
  static LAST_UPDATE_CELL = this.#cfg.LAST_UPDATE_CELL
  static BOT_EMBED_COLOR = this.#cfg.BOT_EMBED_COLOR
  static SHEETS = this.#cfg.SHEETS
  static DRIVE = this.#cfg.DRIVE
  static JOBS_CACHE = './src/jobs/cache'
  static UPDATE_SCORES_CACHE = `${this.JOBS_CACHE}/updateScores.json`
}
