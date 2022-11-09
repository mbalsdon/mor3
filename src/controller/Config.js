import * as fs from 'fs'

export default class Config {
  static #cfg = JSON.parse(fs.readFileSync('./config.json'))
  static LAST_UPDATE_CELL = this.#cfg.LAST_UPDATE_CELL
  static BOT_EMBED_COLOR = this.#cfg.BOT_EMBED_COLOR
  static SHEETS = this.#cfg.SHEETS
  static DRIVE = this.#cfg.DRIVE
  static JOBS_CACHE = './src/jobs/cache'
  static UPDATE_SCORES_CACHE = `${this.JOBS_CACHE}/updateScores.json`
}
