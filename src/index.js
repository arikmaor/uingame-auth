const fs = require('fs')
const path = require('path')
const passport = require('passport')
const samlStrategy = require('./samlAuthenticationStrategy')
const app = require('./express')
const config = require('./config')

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(samlStrategy)
app.use(passport.initialize())
if (config.enableSession) {
  app.use(passport.session())
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.connection.remoteAddress}] - ${req.method} ${req.protocol}://${req.hostname}${req.path}`)
  next()
})

app.get('/login',
  passport.authenticate('saml', { successRedirect: config.successRedirect, failureRedirect: '/login/fail', failureFlash: true })
)

app.post('/login/callback',
  passport.authenticate('saml', { successRedirect: config.successRedirect, failureRedirect: '/login/fail', failureFlash: true })
)

app.get('/login/fail',
  (req, res) => {
    res.status(401).send('Login failed')
  }
)

app.get('/saml/metadata',
  (req, res, next) => {
    fs.readFile(path.resolve(process.cwd(), config.certificate), 'utf8', (err, cert) => {
      if (err) {
        next(err)
      } else {
        res.type('application/xml')
        res.status(200).send(samlStrategy.generateServiceProviderMetadata(cert))
      }
    })
  }
)

//general error handler
app.use(function(err, req, res, next) {
  console.log("Fatal error: " + JSON.stringify(err))
  next(err)
})

app.listen(config.port, () => {
  console.log(`Auth server listening on port ${config.port}...`)
})
