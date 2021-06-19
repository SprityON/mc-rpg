module.exports.info = {
  name: __filename.replace(__dirname + "\\", "").split(".")[0],
  category: __filename.split("\\")[__filename.split('\\').length-2],
  usage: `${require('../../config.json').defaultPrefix}say`,
  help: {
    enabled: true,
    title: 'Say',
    aliases: [],
    description: `I will mimick your message!`,
    permissions: ['sendMessages']
  }
}

module.exports.command = {
  execute(msg, args, client) {
    msg.channel.send(arguments[0].content.slice(config.prefix.length + thisName.length))
  }
}