const BotClass = require('../../BotClass')
const Utils = require('../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    if (!args[1]) {
      let embed = new BotClass.Discord.MessageEmbed()
      let text = ''
      let i = 0
      BotClass.Commands.forEach(cmd => {
        console.log(cmd.name)

        i == BotClass.Commands.length
        ? text += `\`${cmd.name}\``
        : text += `\`${cmd.name}\`, `
      })
      embed.addField(`All Commands`, `${text}`)
    }
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}