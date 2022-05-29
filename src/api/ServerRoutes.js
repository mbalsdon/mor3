const MorFacade = require('../controller/MorFacade')

module.exports = class ServerRoutes {
  facade

  constructor () {
    this.facade = new MorFacade()
    this.addUser = this.addUser.bind(this)
  }

  static echo (req, res) {
    try {
      console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`)
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
    console.log('Server:addUser()')
    this.facade.addUser(42)
      .then((response) => {
        res.status(200).json({ result: response })
      })
      .catch((err) => {
        res.status(400).json({ error: err.message })
      })
  }
}
