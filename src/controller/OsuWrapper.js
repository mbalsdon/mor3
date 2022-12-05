import Mods from './Mods.js'
import MorConfig from './MorConfig.js'
import { NotFoundError, ConstructorError, InvalidModsError } from './MorErrors.js'
import MorUtils from './MorUtils.js'

import 'dotenv/config'
import fetch from 'node-fetch'

/**
 * Wrapper class for osu!API v2
 * @see {@link https://osu.ppy.sh/docs/}
 */
export default class OsuWrapper {
  static #API_URL = 'https://osu.ppy.sh/api/v2'
  static #TOKEN_URL = 'https://osu.ppy.sh/oauth/token'

  #TOKEN

  /**
   * @return standard osu!API v2 headers object
   */
  #buildHeaders () {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#TOKEN}`
    }
  }

  /**
   * Constructs the wrapper.
   * Not meant to be called directly - use OsuWrapper.build() instead!
   * @see {@link build}
   * @param {*} token OAuth token
   * @throws {@link ConstructorError} if token doesn't exist or is structured improperly
   */
  constructor (token) {
    if (typeof token === 'undefined') throw new ConstructorError('token is undefined! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(token, 'token_type')) throw new ConstructorError('token does not have property token_type! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(token, 'expires_in')) throw new ConstructorError('token does not have property expires_in! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(token, 'access_token')) throw new ConstructorError('token does not have property access_token! NOTE: Constructor cannot be called directly.')

    this.#TOKEN = token.access_token
  }

  /**
   * Retrieves osu!API v2 OAuth token then constructs OsuWrapper object
   * @return {Promise<OsuWrapper>} OsuWrapper object
   * @example
   *  const osu = await OsuWrapper.build()
   */
  static async build () {
    console.info('OsuWrapper::build ()') // TODO: replace

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    const data = {
      client_id: process.env.OSU_API_CLIENT_ID,
      client_secret: process.env.OSU_API_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'public'
    }

    const response = await fetch(OsuWrapper.#TOKEN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })

    const token = await response.json()

    return new OsuWrapper(token)
  }

  /**
   * Retrieves osu! user data from osu!API v2
   * @see {@link https://osu.ppy.sh/docs/index.html#user} (osu!API v2 User object)
   * @param {string} user user's name if searchParam is 'username', user's ID if searchParam is 'id'
   * @param {('username'|'id')} searchParam whether to query the API by username or user ID
   * @param {number} osuApiCooldown minimum time osu!API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @throws {@link NotFoundError} if user could not be found
   * @return {Promise<*>} osu!API v2 User object
   * @example
   *  const osu = await OsuWrapper.build()
   *  const user = await osu.getUser('peppy', 'username')
   *  console.log(user.statistics.pp)
   */
  async getUser (user, searchParam = 'username', osuApiCooldown = MorConfig.OSU_API_COOLDOWN_MS) {
    console.info(`OsuWrapper::getUser (${user}, ${searchParam}, ${osuApiCooldown})`) // TODO: replace
    if (!MorUtils.isString(user)) throw new TypeError(`user must be a string! Val=${user}`)
    if (searchParam !== 'username' && searchParam !== 'id') throw new TypeError(`searchParam must be one of 'id' or 'username'! Val=${searchParam}`)
    if (!MorUtils.isNonNegativeNumber(osuApiCooldown)) throw new TypeError(`osuApiCooldown must be a positive number! Val=${osuApiCooldown}`)

    const url = new URL(`${OsuWrapper.#API_URL}/users/${user}/osu`)
    const params = { key: searchParam }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))

    const headers = this.#buildHeaders()

    const [response] = await Promise.all([fetch(url, { method: 'GET', headers }), MorUtils.sleep(osuApiCooldown)])
    if (response.status === 404) throw new NotFoundError(`osu!API user search returned no results! user=${user}, searchParam=${searchParam}`)
    const data = await response.json()

    return data
  }

  /**
   * Retrieves osu! score data from osu!API v2
   * @see {@link https://osu.ppy.sh/docs/index.html#score} (osu!API v2 Score object)
   * @param {string} scoreId
   * @param {number} osuApiCooldown minimum time osu!API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @throws {@link NotFoundError} if score could not be found
   * @return {Promise<*>} osu!API v2 Score object
   * @example
   *  const osu = await OsuWrapper.build()
   *  const score = await osu.getScore('4083979228')
   *  console.log(score.beatmapset.artist)
   */
  async getScore (scoreId, osuApiCooldown = MorConfig.OSU_API_COOLDOWN_MS) {
    console.info(`OsuWrapper::getScore (${scoreId}, ${osuApiCooldown})`) // TODO: replace
    if (!MorUtils.isPositiveNumericString(scoreId)) throw new TypeError(`scoreId must be a positive number string! Val=${scoreId}`)
    if (!MorUtils.isNonNegativeNumber(osuApiCooldown)) throw new TypeError(`osuApiCooldown must be a positive number! Val=${osuApiCooldown}`)

    const url = new URL(`${OsuWrapper.#API_URL}/scores/osu/${scoreId}`)
    const params = { key: 'id' }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))

    const headers = this.#buildHeaders()

    const [response] = await Promise.all([fetch(url, { method: 'GET', headers }), MorUtils.sleep(osuApiCooldown)])
    if (response.status === 404) throw new NotFoundError(`osu!API score search returned no results! scoreId=${scoreId}`)
    const data = await response.json()

    return data
  }

  /**
   * Retrieves osu! user's top plays/firsts from osu!API v2
   * @see {@link https://osu.ppy.sh/docs/index.html#score} (osu!API v2 Score object)
   * @param {string} userId user's ID
   * @param {('best'|'firsts'|'recent')} type whether to fetch the user's top plays, firsts, or recents
   * @param {number} osuApiCooldown minimum time osu!API calls should take
   * @throws {@link TypeError} if parameters are invalid
   * @throws {@link NotFoundError} if user could not be found
   * @return {Promise<*[]>} Array of osu!API v2 Score objects
   * @example
   *  const osu = await OsuWrapper.build()
   *  const tops = await osu.getUserPlays('6385683', 'best')
   *  console.log(tops[3].beatmap.version)
   */
  async getUserPlays (userId, type = 'best', osuApiCooldown = MorConfig.OSU_API_COOLDOWN_MS) {
    console.info(`OsuWrapper::getUserPlays (${userId}, ${type}, ${osuApiCooldown})`) // TODO: replace
    if (!MorUtils.isPositiveNumericString(userId)) throw new TypeError(`userId must be a positive number string! Val=${userId}`)
    if (type !== 'best' && type !== 'firsts' && type !== 'recent') throw new TypeError(`type must be one of 'best' or 'firsts'! Val=${type}`)
    if (!MorUtils.isNonNegativeNumber(osuApiCooldown)) throw new TypeError(`osuApiCooldown must be a positive number! Val=${osuApiCooldown}`)

    const url = new URL(`${OsuWrapper.#API_URL}/users/${userId}/scores/${type}`)
    const params = {
      mode: 'osu',
      limit: 100
    }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))

    const headers = this.#buildHeaders()

    const [response] = await Promise.all([fetch(url, { method: 'GET', headers }), MorUtils.sleep(osuApiCooldown)])
    if (response.status === 404) throw new NotFoundError(`osu!API search returned no results! userId=${userId}, type=${type}`)
    const data = await response.json()

    return data
  }

  /**
   * Retrieves osu! beatmap's difficulty attributes from osu!API v2
   * @see {@link https://osu.ppy.sh/docs/index.html#beatmapdifficultyattributes} (osu!API v2 BeatmapDifficultyAttributes object)
   * @throws {@link TypeError} if parameters are invalid
   * @throws {@link InvalidModsError} if mods are invalid
   * @throws {@link NotFoundError} if beatmap could not be found
   * @param {string} beatmapId beatmap's ID
   * @param {string[]} modArray array of valid MOR mod strings
   * @param {number} osuApiCooldown minimum time osu!API calls should take
   * @return {Promise<*>} Array of osu!API v2 BeatmapDifficultyAttributes objects
   * @example
   *  const osu = await OsuWrapper.build()
   *  const difficultyAttributes = await osu.getDifficultyAttributes('986233', ['HD', 'HR'])
   *  console.log(difficultyAttributes.attributes.aim_difficulty)
   */
  async getDifficultyAttributes (beatmapId, modArray, osuApiCooldown = MorConfig.OSU_API_COOLDOWN_MS) {
    console.info(`OsuWrapper::getDifficultyAttributes (${beatmapId}, [${modArray}], ${osuApiCooldown})`) // TODO: replace
    if (!MorUtils.isPositiveNumericString(beatmapId)) throw new TypeError(`beatmapId must be a positive number string! Val=${beatmapId}`)
    if (!Mods.isValidModArray(modArray)) throw new InvalidModsError(`modArray must be a valid mod array! Val=[${modArray}]`)
    if (!MorUtils.isNonNegativeNumber(osuApiCooldown)) throw new TypeError(`osuApiCooldown must be a positive number! Val=${osuApiCooldown}`)

    const url = new URL(`${OsuWrapper.#API_URL}/beatmaps/${beatmapId}/attributes`)
    const headers = this.#buildHeaders()
    const body = { mods: modArray, ruleset: 'osu' }

    const [response] = await Promise.all([fetch(url, { method: 'POST', headers, body: JSON.stringify(body) }), MorUtils.sleep(osuApiCooldown)])
    if (response.status === 404) throw new NotFoundError(`osu!API search returned no results! beatmapId=${beatmapId}, modArray=[${modArray}]`)
    const data = response.json()

    return data
  }
}
