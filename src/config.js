module.exports = {
  // Common Settings
  port: process.env.PORT || 8080,

  // Session settings
  enableSession: false,
  sessionSecret: process.env.SESSION_SECRET || 'secret',

  // SAML Settings
  host: 'auth.uingame.co.il',
  successRedirect: process.env.SUCCESS_REDIRECT || 'https://www.uingame.co.il/scratch-students',
  callbackUrl: process.env.CALLBACK_URL || 'http://auth.uingame.co.il/login/callback',
  entryPointUrl: process.env.ENTRY_POINT_URL || 'https://is.remote.education.gov.il/nidp/saml2/sso',
  issuer: process.env.ISSUER || 'http://auth.uingame.co.il',
  privateKey: process.env.PRIVATE_KEY || 'certs/key.pem',
  certificate: process.env.CERTIFICATE || 'certs/cert.pem',
  idpCert: process.env.IDP_CERT || 'certs/idp.pem'
}
