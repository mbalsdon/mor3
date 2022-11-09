import 'dotenv/config'
import fetch from 'node-fetch'
import { NotFoundError, ConstructorError } from './Errors.js'
import Utils from './Utils.js'

/**
 * Wrapper class for osu!API v2
 * @see {@link https://osu.ppy.sh/docs/index.html}
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
   * @throws {ConstructorError} if token doesn't exist or is structured improperly
   */
  constructor (token) {
    if (typeof token === 'undefined') throw new ConstructorError('token is undefined! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(token, 'token_type')) throw new ConstructorError('token does not have property token_type! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(token, 'expires_in')) throw new ConstructorError('token does not have property expires_in! NOTE: Constructor cannot be called directly.')
    if (!Object.prototype.hasOwnProperty.call(token, 'access_token')) throw new ConstructorError('token does not have property access_token! NOTE: Constructor cannot be called directly.')
    this.#TOKEN = token.access_token
  }

  /**
   * Retrieves osu!API v2 OAuth token then constructs OsuWrapper object.
   * @return {OsuWrapper}
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

  async getUser (user, searchParam = 'username') {
    console.info(`OsuWrapper::getUser (${user}, ${searchParam})`) // TODO: replace
    if (!Utils.isString(user)) throw new TypeError(`user must be a string! Val=${user}`)
    if (searchParam !== 'username' && searchParam !== 'id') throw new TypeError(`searchParam must be one of 'id' or 'username'! Val=${searchParam}`)
    const url = new URL(`${OsuWrapper.#API_URL}/users/${user}/osu`)
    const params = { key: searchParam }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = this.#buildHeaders()
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) throw new NotFoundError(`osu!API user search returned no results! user=${user}, searchParam=${searchParam}`)
    const data = await response.json()
    return data
  }

  async getScore (scoreId) {
    console.info(`OsuWrapper::getScore (${scoreId})`) // TODO: replace
    if (!Utils.isPositiveNumericString(scoreId)) throw new TypeError(`scoreId must be a positive number string! Val=${scoreId}`)
    const url = new URL(`${OsuWrapper.#API_URL}/scores/osu/${scoreId}`)
    const params = { key: 'id' }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = this.#buildHeaders()
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) throw new NotFoundError(`osu!API score search returned no results! scoreId=${scoreId}`)
    const data = await response.json()
    return data
  }

  async getUserPlays (userId, type = 'best') {
    console.info(`OsuWrapper::getUserPlays (${userId}, ${type})`) // TODO: replace
    if (!Utils.isPositiveNumericString(userId)) throw new TypeError(`userId must be a positive number string! Val=${userId}`)
    if (type !== 'best' && type !== 'firsts') throw new TypeError(`type must be one of 'best' or 'firsts'! Val=${type}`)
    const url = new URL(`${OsuWrapper.#API_URL}/users/${userId}/scores/${type}`)
    const params = {
      mode: 'osu',
      limit: 100
    }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = this.#buildHeaders()
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) throw new NotFoundError(`osu!API search returned no results! userId=${userId}, type=${type}`)
    const data = await response.json()
    return data
  }
}
