module.exports = {
  // App Settings
  port: process.env.PORT || 8080,
  sessionSecret: process.env.SESSION_SECRET || 'secret',

  // SAML Settings
  callbackUrl: process.env.CALLBACK_URL || 'http://http://0f0c4b78.ngrok.io/login/callback',
  entryPointUrl: process.env.ENTRY_POINT_URL || 'https://arik-test.auth0.com/samlp/yAEEHo1IC1xz0rQkyKfLQMQZoNsbuf6q',
  issuer: process.env.ISSUER || 'urn:arik-test.auth0.com',
  idpCert: process.env.IDP_CERT || 'auth0.pem'
}
