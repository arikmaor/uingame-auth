const fs = require('fs')
const SamlStrategy = require('passport-saml').Strategy
const config = require('./config')

const privateKey = fs.readFileSync(config.privateKey, 'utf8')
const idpCert = fs.readFileSync(config.idpCert, 'utf8')

module.exports = new SamlStrategy({
  path: '/login/callback',
  entryPoint: config.entryPointUrl,
  issuer: config.issuer,
  decryptionPvk: privateKey,
  privateCert: privateKey,
  cert: idpCert,
  validateInResponseTo: false,
  disableRequestedAuthnContext: true
}, (profile, done) => {
  return done(null, profile)
})
