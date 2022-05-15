require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/User')

// -

app.use(express.json())
app.use(cors())

app.get('/echo/:message', (req, res) => {
  console.log(`GET /echo/${req.params.message}`)
  try {
    res.status(200).send(req.params.message)
  } catch (err) {
    res.status(400).json({ error: err })
  }
})

app.get('/users', (req, res) => {
  console.log('GET /users')
  try {
    User.find({})
      .then(users => {
        const formattedUsers = users.map(u => ({ userid: u.userid, username: u.username }))
        res.status(200).json({ users: formattedUsers })
      })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/users/:userid', (req, res) => {
  console.log(`POST /users/${req.body.userid}`)
  try {
    const newUser = new User(req.body)
    newUser.save()
      .then(savedDoc => {
        res.status(200).json({ username: savedDoc.username })
      })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

mongoose.connect(process.env.DB_CONNECTION_STRING,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (req, res) => {
    console.log('Connected to the database')
  }
)

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
