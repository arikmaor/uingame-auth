const express = require('express')
const bodyParser = require('body-parser')
const querystring = require('query-string')
const randtoken = require('rand-token')
const passport = require('passport')
const cors = require('cors')

const createSamlStartegy = require('./samlAuthenticationStrategy')
const redis = require('./redis')
const config = require('./config')


init().catch(err => {
  console.error('FATAL ERROR!')
  console.error(err)
})

async function init() {
  const app = express()
  app.use(bodyParser.urlencoded({extended: true}))

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  const samlStrategy = await createSamlStartegy()
  passport.use(samlStrategy)
  app.use(passport.initialize())

  app.get('/login', passport.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }))

  app.post('/login/callback',
    passport.authenticate('saml', { failureRedirect: '/login/fail', failureFlash: true }),
    async (req, res, next) => {
      if (req.isAuthenticated()) {
        const token = randtoken.generate(16);
        const keyName = `TOKEN:${token}`
        try {
          await redis.set(keyName, JSON.stringify(req.user))
          await redis.expire(keyName, config.tokenExpiration)
          res.redirect(`${config.successRedirect}?${querystring.stringify({token})}`)
        } catch (err) {
          console.error(`Error while saving in redis: ${err}`)
          res.redirect('/login/fail')
        }
      } else {
        res.redirect('/login/fail')
      }
    }
  )

  app.get('/login/verify',
    cors({
      origin: config.corsOrigin
    }),
    async (req, res, next) => {
      const {token} = req.query
      if (!token) {
        return res.status(400).send('Bad Request')
      }
      const keyName = `TOKEN:${token}`
      try {
        const user = JSON.parse(await redis.get(keyName))
        if (!user) {
          return res.status(404).send('Not Found')
        } else {
          res.send(user);
        }
      } catch (err) {
        console.error(`Error while getting from redis: ${err}`)
        res.status(500).send('Internal Server Error')
      }
    }
  )

  app.get('/login/fail',
    (req, res) => {
      res.status(401).send('Login failed')
    }
  )

  app.get('/logout',
    (req, res) => {
      res.redirect(`${config.logoutUrl}?logoutURL=${config.logoutRedirectUrl}`)
    }
  )

  app.get('/saml/metadata',
    (req, res, next) => {
      try {
        res.type('application/xml')
        res.status(200).send(samlStrategy.generateServiceProviderMetadata(config.certificate))
      } catch(err) {
        next(err)
      }
    }
  )

  if (config.sslCertificateAcmeChallengeString && config.sslCertificateAcmeChallengeUrl) {
    app.get(`/${config.sslCertificateAcmeChallengeUrl}`, (req, res, next) => {
      res.send(config.sslCertificateAcmeChallengeString)
    })
  }

  //general error handler
  app.use(function(err, req, res, next) {
    console.log("Fatal error: " + JSON.stringify(err))
    next(err)
  })

  app.listen(config.port, () => {
    console.log(`Auth server listening on port ${config.port}...`)
  })
}
