const fs = require('fs')
const SamlStrategy = require('passport-saml').Strategy
const config = require('./config')

module.exports = new SamlStrategy({
  path: '/login/callback',
  entryPoint: config.entryPointUrl,
  issuer: config.issuer,
  cert: fs.readFileSync(config.idpCert, 'utf8')
}, (profile, done) => {
  return done(null, profile)
})
