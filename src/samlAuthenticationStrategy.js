const fs = require('fs')
const path = require('path')
const rp = require('request-promise')
const SamlStrategy = require('passport-saml').Strategy
const {parse: parseSamlMetadata} = require('idp-metadata-parser')
const config = require('./config')

async function createSamlStartegy() {
  console.log('Getting Identity Provider metadata...')
  const rawMetadata = await rp({uri: config.idpMetadataUrl, rejectUnauthorized: false})
  const metadata = await parseSamlMetadata(rawMetadata)
  console.log('Identity Provider metadata parsed sucessfully')
  return new SamlStrategy({
    path: '/login/callback',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    protocol: 'https://',
    host: config.host,
    entryPoint: metadata.idpSsoTargetUrl,
    issuer: config.issuer,
    decryptionPvk: config.privateKey,
    privateCert: config.privateKey,
    cert: metadata.idpCert,
    validateInResponseTo: false,
    disableRequestedAuthnContext: true,
    passReqToCallback: true,
  }, (req, profile, done,) => {
    const user = {
      displayName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/displayname'],
      id: profile['http://schemas.education.gov.il/ws/2015/01/identity/claims/zehut'],
      mosad: profile['http://schemas.education.gov.il/ws/2015/01/identity/claims/orgrolesyeshuyot'],
      mosad_2: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/shibutznosaf'],
      isStudent: profile['http://schemas.education.gov.il/ws/2015/01/identity/claims/isstudent'] === 'Yes',
      kita: profile['http://schemas.education.gov.il/ws/2015/01/identity/claims/studentkita']
    }
    console.log(`Logged in 2: ${JSON.stringify(user, ' ', 2)}`)


    return done(null, user)
  })
}

module.exports = createSamlStartegy
