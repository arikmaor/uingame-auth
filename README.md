# UINGame Authenication Server

## Local Setup
1. Install the following tools:
  1. git
  2. nodejs
  3. yarn
  4. heroku (to upload to production)
  5. nodemon (for auto-restart during development)
  6. openssl (for generating self-signed certificates)
2. Clone this repo
3. Run `yarn` to install dependencies
4. Run `yarn start` or `yarn dev` to start the server

## Scripts
1. `yarn start` - Starts the authentication server.
2. `yarn dev` - Starts the authentication server with `nodemon`.
3. `yarn deploy` - Deploys to heroku, including the `cert` folder not included in the repository.

## Generating a self-signed certificate
in order to generate a self-signed certificate (suitable for debugging) run this:
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
