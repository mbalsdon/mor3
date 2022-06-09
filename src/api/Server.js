const express = require('express')
const cors = require('cors')
const ServerRoutes = require('./ServerRoutes')

module.exports = class Server {
  port
  express
  server
  routes

  constructor (port) {
    console.info(`Server::<init>( ${port} )`)
    this.port = port
    this.express = express()
    this.routes = new ServerRoutes()

    this.registerMiddleware()
    this.registerRoutes()
  }

  registerMiddleware () {
    this.express.use(express.json())
    this.express.use(express.raw({ type: 'application/*', limit: '10mb' }))
    this.express.use(cors())
  }

  registerRoutes () {
    this.express.get('/echo/:msg', ServerRoutes.echo)

    this.express.get('/metadata', this.routes.getMetadata)

    this.express.get('/users', this.routes.getUserIds)
    this.express.put('/users/:id', this.routes.putUser)
    this.express.delete('/users/:id', this.routes.deleteUser)

    this.express.get('/scores/:mods', this.routes.getModScores)
    this.express.get('/scores/:mods/:id', this.routes.getScore)
    this.express.delete('/scores/:mods/:id', this.routes.deleteScore)

    this.express.get('/submitted', this.routes.getSubmittedScores)
    this.express.put('/submitted/:id', this.routes.putSubmittedScore)
  }

  start () {
    return new Promise((resolve, reject) => {
      console.info('Server::start() - start')
      if (this.server !== undefined) {
        console.error('Server::start() - server already listening')
        reject(new Error('Server is already listening'))
      } else {
        this.server = this.express.listen(this.port, () => {
          console.info(`Server::start() - server listening on port ${this.port}`)
          resolve()
        }).on('error', (err) => {
          console.error(`Server::start() - ERROR: ${err.message}`)
          reject(err)
        })
      }
    })
  }

  stop () {
    console.info('Server::stop()')
    return new Promise((resolve, reject) => {
      if (this.server === undefined) {
        console.error('Server::stop() - ERROR: server not started')
        reject(new Error('Server not started'))
      } else {
        this.server.close(() => {
          console.info('Server::stop() - server closed')
          resolve()
        })
      }
    })
  }
}
