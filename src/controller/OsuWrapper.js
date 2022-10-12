// TODO: how to register new OAuth apps short guide (in readme)

import fetch from 'node-fetch'
import 'dotenv/config'

export default class OsuWrapper {
  static #API_URL = 'https://osu.ppy.sh/api/v2'
  static #TOKEN_URL = 'https://osu.ppy.sh/oauth/token'

  #token

  constructor (token) {
    if (typeof token === 'undefined') {
      throw new Error('Cannot be called directly')
    }
    this.#token = token
  }

  static async build () {
    console.info('OsuWrapper::build()')
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
    return new OsuWrapper(token.access_token)
  }

  async fetchUser (userId) {
    console.info(`OsuWrapper::fetchUser( ${userId} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number')
    }

    const url = new URL(`${OsuWrapper.#API_URL}/users/${userId}/osu`)
    const params = {
      key: 'id'
    }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#token}`
    }
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) {
      throw new Error(`User ID ${userId} not found`)
    }
    const data = await response.json()
    return data
  }

  async fetchScore (id) {
    console.info(`OsuWrapper::fetchScore( ${id} )`)
    if (isNaN(parseInt(id)) || parseInt(id) < 1) {
      throw new Error('Score ID must be a positive number')
    }

    const url = new URL(`${OsuWrapper.#API_URL}/scores/osu/${id}`)
    const params = {
      key: 'id'
    }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#token}`
    }
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) {
      throw new Error(`Score ID ${id} not found`)
    }
    const data = await response.json()
    return data
  }

  async fetchUserTopPlays (userId) {
    console.info(`OsuWrapper::fetchUserTopPlays( ${userId} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number')
    }

    const url = new URL(`${OsuWrapper.#API_URL}/users/${userId}/scores/best`)
    const params = {
      mode: 'osu',
      limit: 100
    }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) {
      throw new Error(`User ID ${userId} not found`)
    }
    const data = await response.json()
    return data
  }

  async fetchUserFirstPlacePlays (userId) {
    console.info(`OsuWrapper::fetchUserFirstPlacePlays( ${userId} )`)
    if (isNaN(parseInt(userId)) || parseInt(userId) < 1) {
      throw new Error('User ID must be a positive number')
    }

    const url = new URL(`${OsuWrapper.#API_URL}/users/${userId}/scores/firsts`)
    const params = {
      mode: 'osu',
      limit: 100
    }
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.#token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    if (response.status === 404) {
      throw new Error(`User ID ${userId} not found`)
    }
    const data = await response.json()
    return data
  }

  // Doesn't check if score IDs exist
  async fetchScores (scoreIds) {
    console.info(`OsuWrapper::fetchScores( ${scoreIds} )`)
    if (!Array.isArray(scoreIds)) {
      throw new Error('scoreIds must be an array')
    }

    const ret = []
    for (const id of scoreIds) {
      if (isNaN(parseInt(id)) || parseInt(id) < 1) {
        throw new Error('Score IDs must be positive numbers')
      }
      ret.push(await this.fetchScore(id))
      sleep(1000)
    }
    return ret
  }
}

// TODO: duplicate code
function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
