const fs = require('fs')
const path = require('path')
const SamlStrategy = require('passport-saml').Strategy
const config = require('./config')

const privateKey = fs.readFileSync(path.resolve(process.cwd(), config.privateKey), 'utf8')
const idpCert = fs.readFileSync(path.resolve(process.cwd(), config.idpCert), 'utf8')

module.exports = new SamlStrategy({
  path: '/login/callback',
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  protocol: config.useSSL && 'https://',
  host: config.host,
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
