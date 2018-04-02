module.exports = {
  // Common Settings
  port: process.env.PORT || 8080,

  // Session settings
  enableSession: false,
  sessionSecret: process.env.SESSION_SECRET || 'secret',

  // SAML Settings
  successRedirect: process.env.SUCCESS_REDIRECT || 'https://www.uingame.co.il/scratch-students',
  callbackUrl: process.env.CALLBACK_URL || 'http://0f0c4b78.ngrok.io/login/callback',
  entryPointUrl: process.env.ENTRY_POINT_URL || 'https://arik-test.auth0.com/samlp/yAEEHo1IC1xz0rQkyKfLQMQZoNsbuf6q',
  issuer: process.env.ISSUER || 'urn:arik-test.auth0.com',
  privateKey: process.env.PRIVATE_KEY || 'certs/key.pem',
  certificate: process.env.CERTIFICATE || 'certs/cert.pem',
  idpCert: process.env.IDP_CERT || 'certs/auth0.pem'
}
