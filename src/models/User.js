const mongoose = require('mongoose')

const User = new mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('User', User)
