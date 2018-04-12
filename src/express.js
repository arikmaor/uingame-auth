const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const config = require('./config')

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

if (config.enableSession) {
  const session = require('express-session')
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
  }))
}

module.exports = app
