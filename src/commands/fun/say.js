const Utils = require('../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['mimick'],

  execute(msg, args) {
    if (!args[0]) return msg.channel.send(`Seems like you didn't really want me to say something lol`)
    msg.channel.send(
      Utils.createEmbed(
        [
          [
            `${msg.author.username} said:`, `\`\`\`` + msg.content.slice(msg.content.split(" ")[0].length + 1) + `\`\`\``
          ]
        ], { color: botRoleColor(msg.guild.me) }
      )
    );
  },

  help: {
    enabled: true,
    title: 'Say',
    description: `I will mimick your message!`,
    permissions: ['SEND_MESSAGES', 'ADMINISTRATOR']
  }
}