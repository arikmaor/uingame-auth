const express = require('express')
const bodyParser = require('body-parser')
const querystring = require('query-string')
const randtoken = require('rand-token')
const passport = require('passport')
const cors = require('cors')
//! temporary
const rp = require('request-promise')
const { parse: parseSamlMetadata } = require('idp-metadata-parser')

const createSamlStartegy = require('./samlAuthenticationStrategy')
const redis = require('./redis')
const config = require('./config');


init().catch(err => {
  console.error('FATAL ERROR!')
  console.error(err)
})

async function init() {
  const app = express()
  app.use(bodyParser.urlencoded({ extended: true }))

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
  const samlStrategy = await createSamlStartegy()
  passport.use(samlStrategy)
  app.use(passport.initialize())

  app.get('/login',
  (req, res, next) => {
    const referer = req.get('Referer');
    passport.authenticate('saml', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.redirect('/login/fail');

      // Store the referer in a way that can be accessed in the callback route
      req.tempReferer = referer;
      res.tempReferer = referer;

      // Continue with the authentication process
      req.logIn(user, function(err) {
        if (err) return next(err);
        // Redirect to the callback URL, you might append a unique identifier if needed
        return res.redirect('/login/callback');
      });
    })(req, res, next);
  });

  app.post('/login/callback',
    passport.authenticate('saml', { failureRedirect: '/login/fail' }),
    async (req, res, next) => {
      const referer = req.tempReferer;
      console.log('Referer:', referer);
      if (req.isAuthenticated()) {
        console.log(req.isAuthenticated());
        const token = randtoken.generate(16);
        const keyName = `TOKEN:${token}`
        try {
          await redis.set(keyName, JSON.stringify(req.user))
          await redis.expire(keyName, config.tokenExpiration)
          res.redirect(`${config.successRedirect}?${querystring.stringify({ token })}`)
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
      const { token } = req.query
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
      } catch (err) {
        next(err)
      }
    }
  )

  if (config.acmeChallengeValue && config.acmeChallengeToken) {
    app.get(`/.well-known/acme-challenge/${config.acmeChallengeToken}`, (req, res, next) => {
      res.send(config.acmeChallengeValue)
    })
    app.get(`/.well-known/pki-validation/${config.acmeChallengeToken}`, (req, res, next) => {
      res.send(config.acmeChallengeValue)
    })
  }

  //! temporary
  app.get('/idp-public-key-certificate-proof', async (req, res, next) => {
    try {
      const rawMetadata = await rp({ uri: config.idpMetadataUrl, rejectUnauthorized: false })
      const metadata = await parseSamlMetadata(rawMetadata)
      console.log('IdP Public Key: ', metadata.idpCert)
      res.status(200).send('IdP Public Key logged successfully.')
    } catch (err) {
      console.error(`Error while getting IdP metadata: ${err}`)
      res.status(500).send('Internal Server Error')
    }
  })

  //general error handler
  app.use(function (err, req, res, next) {
    console.log("Fatal error: " + JSON.stringify(err))
    next(err)
  })

  app.listen(config.port, () => {
    console.log(`Auth server listening on port ${config.port}...`)
  })

}
