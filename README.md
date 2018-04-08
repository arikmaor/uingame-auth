# UINGame Authenication Server

SAML 2.0 Service Provider
Authenticates with [education.gov.ip Identity Provider](https://is.remote.education.gov.il/nidp/saml2/metadata)

## Local Setup
1. Install the following tools:
    1. `git`
    2. `nodejs`
    3. `yarn`
    4. `heroku` (to upload to production)
    5. `nodemon` (for auto-restart during development)
    6. `openssl` (for generating self-signed certificates)
    7. `certbot` (for getting a real certificate from [Let's Encrypt](https://letsencrypt.org/))
2. Clone this repo
3. Run `yarn` to install dependencies
4. Run `yarn start` or `yarn dev` to start the server

## Scripts
1. `yarn start` - Starts the authentication server.
2. `yarn dev` - Starts the authentication server with `nodemon`.
3. `yarn deploy` - Deploys to heroku, including the `certs` folder not included in the repository.

## Generating a self-signed certificate
In order to generate a self-signed certificate (suitable for debugging) run this:
```
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem
```
after answering some questions, the private key will be stored at `key.pem` and the public key (certificate) will be stored at `cert.pem`.

## Uploading to production
1. `heroku login`
2. `heroku git:remote -a uingame-auth`
3. Make sure to add a `certs` folder with the certificates references in `config.js`
4. `yarn deploy`
5. `heroku logs --tails` (verify server started successfully)

## Getting a real certificate
1. Install `certbot`
2. Run `sudo certbot certonly --manual`
3. Type `auth.uingame.co.il` when the prompt asks for a domain name
4. You should have a url and a secret string
Go to [https://dashboard.heroku.com/apps/uingame-auth/settings](here) and add them as environment variables named `ACME_CHALLENGE_URL` and `ACME_CHALLENGE_STRING`
Add the URL **without** the domain name (ex. '.well-known/acme-challenge/')
5. Go to the provided url and make sure the string is returned
6. Click enter back in the terminal
    1. The certificate is saved in: `/etc/letsencrypt/live/auth.uingame.co.il/fullchain.pem` (it's the first one)
    2. Private key is saved in: `/etc/letsencrypt/live/auth.uingame.co.il/privkey.pem`
7. Remove the environment variables from heroku (from step 4)
8. To renew `sudo certbot renew`
