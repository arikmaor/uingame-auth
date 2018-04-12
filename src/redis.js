const {promisify} = require('util')
const redis = require('redis')
const config = require('./config')

const client = redis.createClient({
  host: config.redisUrl
})

client.on("error", function (err) {
  console.error("Error is redis client: " + err)
});

const COMMANDS = ['set', 'get', 'expire']

module.exports = COMMANDS.reduce((ret, cmd) => {
  ret[cmd] = promisify(client[cmd]).bind(client)
  return ret
}, {})
