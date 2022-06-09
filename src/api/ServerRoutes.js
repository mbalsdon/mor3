const MorFacade = require('../controller/MorFacade')

module.exports = class ServerRoutes {
  #facade

  constructor () {
    MorFacade.build()
      .then((facade) => {
        this.#facade = facade
      })
    this.getMetadata = this.getMetadata.bind(this)

    this.getUserIds = this.getUserIds.bind(this)
    this.putUser = this.putUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)

    this.getModScores = this.getModScores.bind(this)
    this.getScore = this.getScore.bind(this)
    this.deleteScore = this.deleteScore.bind(this)

    this.getSubmittedScores = this.getSubmittedScores.bind(this)
    this.putSubmittedScore = this.putSubmittedScore.bind(this)
  }

  // --- ECHO ---

  static echo (req, res) {
    try {
      console.info(`Server::echo(..) - params: ${JSON.stringify(req.params)}`)
      const response = ServerRoutes.performEcho(req.params.msg)
      res.status(200).json({ result: response })
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  }

  static performEcho (msg) {
    if (typeof msg !== 'undefined' && msg !== null) {
      return `${msg}... ${msg}`
    } else {
      return 'Message not provided'
    }
  }

  // --- METADATA ---

  getMetadata (req, res) {
    console.info('Server::getMetadata()')
    this.#facade.getMetadata()
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  // --- USERS ---

  getUserIds (req, res) {
    console.info('Server::getUserIds()')
    this.#facade.getUserIds()
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  putUser (req, res) {
    console.info(`Server::putUser() - params: ${JSON.stringify(req.params)}`)
    this.#facade.putUser(req.params.id)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  deleteUser (req, res) {
    console.info(`Server::deleteUser() - params: ${JSON.stringify(req.params)}`)
    this.#facade.deleteUser(req.params.id)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  // --- SCORES ---

  getModScores (req, res) {
    console.info(`Server::getModScores() - params: ${JSON.stringify(req.params)}`)
    this.#facade.getModScores(req.params.mods)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  getScore (req, res) {
    console.info(`Server::getScore() - params: ${JSON.stringify(req.params)}`)
    this.#facade.getScore(req.params.mods, req.params.id)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  deleteScore (req, res) {
    console.info(`Server::deleteScore() - params: ${JSON.stringify(req.params)}`)
    this.#facade.deleteScore(req.params.mods, req.params.id)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  // --- SUBMITTED SCORES ---

  getSubmittedScores (req, res) {
    console.info('Server::getSubmittedScores()')
    this.#facade.getSubmittedScores()
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }

  putSubmittedScore (req, res) {
    console.info(`Server::putSubmittedScore() - params: ${JSON.stringify(req.params)}`)
    this.#facade.putSubmittedScore(req.params.id)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }
}
