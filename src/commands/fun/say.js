const { 
  strMods: { createEmbed }, 
  other: { 
    colors: { firstMemberRoleColor, botRoleColor },
    command: { 
      getName, getCategory, getUsage 
    } 
  } 
} = (new (require('../../Utils')))

module.exports = {
  name: getName(__filename, __dirname),
  category: getCategory(__filename),
  usage: getUsage(__filename, __dirname),

  execute(msg, ...args) {
    msg.channel.send(
      createEmbed(
        [
          [
            `${msg.author.username} said:`, `\`\`\`` + msg.content.slice(this.usage.length) + `\`\`\``
          ]
        ], { color: botRoleColor(msg.guild.me) }
      )
    );
  },

  help: {
    enabled: true,
    title: 'Say',
    aliases: [],
    description: `I will mimick your message!`,
    permissions: ['sendMessages']
  }
}