const fs = require('fs')
const path = require('path')
const querystring = require('query-string')
const randtoken = require('rand-token')
const passport = require('passport')
const cors = require('cors')
const createSamlStartegy = require('./samlAuthenticationStrategy')
const app = require('./express')
const redis = require('./redis')
const config = require('./config')

init().catch(err => {
  console.error('FATAL ERROR!')
  console.error(err)
})

async function init() {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  const samlStrategy = await createSamlStartegy()
  passport.use(samlStrategy)
  app.use(passport.initialize())
  if (config.enableSession) {
    app.use(passport.session())
  }

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.connection.remoteAddress}] - ${req.method} ${req.protocol}://${req.hostname}${req.path}`)
    next()
  })

  app.get('/test',
    (req, res, next) => {
      if (req.isAuthenticated()) {
        res.send(req.user)
      } else {
        res.send("Not Authenticated")
      }
    }
  )

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
      if (req.isAuthenticated()) {
        console.log(`Logged out: ${JSON.stringify(req.user, ' ', 2)}`)
        req.logout()
      } else {
        console.log('Not Authenticated')
      }
      res.redirect(`${config.logoutUrl}?logoutURL=${config.logoutRedirectUrl}`)
    }
  )

  app.get('/saml/metadata',
    (req, res, next) => {
      if (config.certificate) {
        res.type('application/xml')
        res.status(200).send(samlStrategy.generateServiceProviderMetadata(config.certificate))
      } else {
        fs.readFile(path.resolve(process.cwd(), config.certificateFile), 'utf8', (err, cert) => {
          if (err) {
            next(err)
          } else {
            res.type('application/xml')
            res.status(200).send(samlStrategy.generateServiceProviderMetadata(cert))
          }
        })
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
