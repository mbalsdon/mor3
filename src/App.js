require('dotenv').config()
const Server = require('./api/Server')

class App {
  initServer (port) {
    console.info(`App:initServer( ${port} ) - start`)

    const server = new Server(port)
    return server.start().then(() => {
      console.info('App::initServer() - started')
    }).catch((err) => {
      console.error(`App::initServer() - ERROR: ${err.message}`)
    })
  }
}

console.info('App - starting')
const app = new App()
app.initServer(process.env.PORT)
