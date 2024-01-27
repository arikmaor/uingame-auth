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
    async (req, res, next) => {
      let userIP = req.headers['x-forwarded-for'] || req.ip;
      if (userIP.includes(',')) {
        userIP = userIP.split(',')[0].trim();
      }
      let referer = req.get('Referer') != undefined ? req.get('Referer') : (!!req.query.rf != undefined && req.query.rf == 'space') ? 'https://space.uingame.co.il/' : 'https://www.uingame.co.il/' ;
      try {
        await redis.set(userIP, JSON.stringify({referer}));
        await redis.expire(userIP, 100);
      }
      catch (err) {
        console.error(`Error while saving in redis: ${err}`)
        res.redirect('/login/fail')
      }
      req.query.RelayState = req.params.referer = {referer};
      passport.authenticate('saml', {
        failureRedirect: '/login/fail',
        additionalParams: { callbackReferer: referer }
      })(req, res, next);
    }
  );

  app.post('/login/callback',
    passport.authenticate('saml', { failureRedirect: '/login/fail' }),
    async (req, res, next) => {
      let userIP = req.headers['x-forwarded-for'] || req.ip;
      if (userIP.includes(',')) {
        userIP = userIP.split(',')[0].trim();
      }
      const siteInfo = JSON.parse(await redis.get(userIP));
      if (req.isAuthenticated()) {
        console.log(req.isAuthenticated());
        const token = randtoken.generate(16);
        const keyName = `TOKEN:${token}`
        try {
          await redis.set(keyName, JSON.stringify(req.user))
          await redis.expire(keyName, config.tokenExpiration)
          res.redirect(`${siteInfo.referer+'/createsession'}?${querystring.stringify({ token })}`)
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
      origin: [config.corsOrigin,'https://space.uingame.co.il']
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
      let referer = req.get('Referer') != undefined ? req.get('Referer') : (!!req.query.rf != undefined && req.query.rf == 'space') ? 'https://space.uingame.co.il/' : 'https://www.uingame.co.il/' ;
      res.redirect(`${config.logoutUrl}?logoutURL=${referer}`)
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

  //general error handler
  app.use(function (err, req, res, next) {
    console.log("Fatal error: " + JSON.stringify(err))
    next(err)
  })

  app.listen(config.port, () => {
    console.log(`Auth server listening on port ${config.port}...`)
  })

}
