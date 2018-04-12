const {promisify} = require('util')
const Url = require("url")
const redis = require('redis')
const config = require('./config')

var redisUrl = Url.parse(config.redisUrl);
const client = redis.createClient(redisUrl.port, redisUrl.hostname)

client.on("error", function (err) {
  console.error("Error in redis client: " + err)
});

client.auth(redisUrl.auth.split(":")[1]);

const COMMANDS = ['set', 'get', 'expire']

module.exports = COMMANDS.reduce((ret, cmd) => {
  ret[cmd] = promisify(client[cmd]).bind(client)
  return ret
}, {})
