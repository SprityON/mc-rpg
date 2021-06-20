const { 
  strMods: { createEmbed }, 
  other: { 
    colors: { botRoleColor },
    command: { 
      getName, getCategory, getUsage 
    } 
  } 
} = require('../../Utils')

module.exports = {
  name: getName(__filename, __dirname),
  category: getCategory(__filename),
  usage: getUsage(__filename, __dirname),
  aliases: ['mimick'],

  execute(msg, args) {
    if (!args[0]) return msg.channel.send(`Seems like you didn't really want me to say something lol`)
    msg.channel.send(
      createEmbed(
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