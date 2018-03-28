const fs = require('fs')
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
app.use(passport.session())

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next()
  else
    return res.redirect('/login')
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.hostname}${req.path}`)
  next()
})

app.get('/',
  ensureAuthenticated,
  (req, res) => {
    res.send('Authenticated')
  }
)

app.get('/login',
  passport.authenticate('saml', { successRedirect: '/', failureRedirect: '/login/fail', failureFlash: true })
)

app.post('/login/callback',
  passport.authenticate('saml', { successRedirect: '/', failureRedirect: '/login/fail', failureFlash: true })
)

app.get('/login/fail',
  (req, res) => {
    res.status(401).send('Login failed')
  }
)

app.get('/saml/metadata',
  (req, res) => {
    res.type('application/xml')
    res.status(200).send(samlStrategy.generateServiceProviderMetadata(fs.readFileSync(__dirname + '/cert/cert.pem', 'utf8')))
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
