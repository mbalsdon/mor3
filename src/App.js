import 'dotenv/config'
import Server from './api/Server.js'

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
let port = process.env.PORT
if (port === null || port === '') {
  port = process.env.LOCAL_PORT
}
app.initServer(port)
