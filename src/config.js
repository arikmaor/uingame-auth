module.exports = {
  // Common Settings
  port: process.env.PORT || 8080,
  redisUrl: process.env.REDISCLOUD_URL || 'redis://p82ac107755c622e093015c4022e6e47305e381829c4de983bc7261246d79ab4f@ec2-54-217-208-106.eu-west-1.compute.amazonaws.com:18180',
  tokenExpiration: process.env.TOKEN_EXPIRATION || 300, // 5 minutes
  corsOrigin: process.env.CORS_ORIGIN || 'https://www.uingame.co.il',

  // Auth Redirection
  successRedirect: process.env.SUCCESS_REDIRECT || 'https://www.uingame.co.il/createsession',
  logoutRedirectUrl: process.env.LOGOUT_REDIRECT || 'https://www.uingame.co.il',

  // SAML Settings
  host: 'auth.uingame.co.il',
  idpMetadataUrl: process.env.IDP_METADATA_URL || 'https://lgn.edu.gov.il/nidp/saml2/metadata',
  logoutUrl: process.env.LOGOUT_URL || 'https://lgn.edu.gov.il/nidp/jsp/logoutSuccess.jsp',
  issuer: 'http://auth.uingame.co.il',
  privateKey: process.env.SAML_PRIVATE_KEY,
  certificate: process.env.SAML_CERT,

  // For Getting an SSL Certificate
  acmeChallengeToken: process.env.ACME_CHALLENGE_TOKEN,
  acmeChallengeValue: process.env.ACME_CHALLENGE_VALUE
}
