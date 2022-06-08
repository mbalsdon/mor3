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
    this.putScore = this.putScore.bind(this)
    // DEL /scores/:mods/:id
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

  putScore (req, res) {
    console.info(`Server::getScore() - params: ${JSON.stringify(req.params)}`)
    this.#facade.putScore(req.params.mods, req.params.id)
      .then((response) => res.status(200).json({ result: response }))
      .catch((err) => res.status(400).json({ error: err.message }))
  }
  // PUT /scores/:mods/:id
  // DEL /scores/:mods/:id
}
