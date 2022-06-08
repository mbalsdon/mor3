const MorFacade = require('../controller/MorFacade')

module.exports = class ServerRoutes {
  #facade

  constructor () {
    MorFacade.build()
      .then((facade) => {
        this.#facade = facade
      })
    this.getUserIds = this.getUserIds.bind(this)
    this.putUser = this.putUser.bind(this)
    this.deleteUser = this.deleteUser.bind(this)
    this.getMetadata = this.getMetadata.bind(this)
  }

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

  putUser (req, res) {
    console.info(`Server::putUser() - params: ${JSON.stringify(req.params)}`)
    this.#facade.putUser(req.params.id)
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }

  getUserIds (req, res) {
    console.info('Server::getUserIds()')
    this.#facade.getUserIds()
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }

  deleteUser (req, res) {
    console.info(`Server::deleteUser() - params: ${JSON.stringify(req.params)}`)
    this.#facade.deleteUser(req.params.id)
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }

  getMetadata (req, res) {
    console.info('Server::getMetadata()')
    this.#facade.getMetadata()
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }
}
