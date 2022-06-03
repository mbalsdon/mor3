const MorFacade = require('../controller/MorFacade')

module.exports = class ServerRoutes {
  facade

  constructor () {
    MorFacade.build()
      .then((facade) => {
        this.facade = facade
      })
    this.addUser = this.addUser.bind(this)
    this.fetchMetadata = this.fetchMetadata.bind(this)
    this.fetchUserIds = this.fetchUserIds.bind(this)
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

  addUser (req, res) {
    console.info(`Server::addUser() - params: ${JSON.stringify(req.params)}`)
    this.facade.addUser(req.params.id)
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }

  fetchMetadata (req, res) {
    console.info('Server::fetchMetadata()')
    this.facade.fetchMetadata()
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }

  fetchUserIds (req, res) {
    console.info('Server::fetchUserIds()')
    this.facade.fetchUserIds()
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }
}
