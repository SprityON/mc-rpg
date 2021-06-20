const { other: { command: { getName, getCategory, getUsage } } } = (new (require('../../Utils')))

module.exports = {
  name: getName(__filename, __dirname),
  category: getCategory(__filename),
  usage: getUsage(__filename, __dirname),

  execute(msg, ...args) {
    msg.channel.send(msg.content.slice(this.usage.length))
  },

  help: {
    enabled: true,
    title: 'Say',
    aliases: [],
    description: `I will mimick your message!`,
    permissions: ['sendMessages']
  }
}