const Utils = require("../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '<message>',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    msg.delete({timeout: 250})
    if (!args[0]) return msg.channel.send(`Seems like you didn't really want me to say something lol`)
    msg.channel.send(
      Utils.createEmbed(
        [
          [
            `${msg.author.username} said:`, 
            `\`\`\`` + msg.content.slice(msg.content.split(" ")[0].length + 1) + `\`\`\``
          ]
        ], { color: Utils.randomColor() }
      )
    );
  },

  help: {
    enabled: true,
    title: 'Say',
    description: `I will say your message!`
  }
}