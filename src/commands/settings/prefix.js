const { other: { command: { getName, getCategory, getUsage } }, strMods: { createEmbed }, db: { query } } = require('../../Utils')

module.exports = {
  name: getName(__filename, __dirname),
  category: getCategory(__filename),
  usage: getUsage(__filename, __dirname),
  aliases: ['p'],

  execute(msg, args) {
    query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, result => {
      const prefix = result[0][0].prefix;
      const newPrefix = args[0];

      if (!newPrefix) return msg.channel.send(
        createEmbed(
        [
          [`Prefix Settings`, `Change your server prefix like so:\n\`${prefix}prefix <your-prefix>\``]
        ]
      ))

      msg.channel.send(`Are you sure you want to change your MCRPG's server prefix to: \`${newPrefix}\`? (y/n)`);

      const filter = m => m.author.id === msg.author.id;
      msg.channel.awaitMessages(filter, { timeout: 30000, max: 1 })
      .then(collected => {
        if (collected.first().content.toLowerCase() === 'y') {

          query(`UPDATE guilds SET prefix = '${newPrefix}' WHERE guild_id = '${msg.guild.id}'`).then(
            msg.channel.send(
              createEmbed(
                [
                  [`Prefix Updated!`, `Your server prefix is now: \`${newPrefix}\``]
                ]
              )
            )
          );

        } else return msg.channel.send(`Cancelled for **${msg.author.username}**!`);
      })
    })
  },

  help: {
    enabled: true,
    title: '',
    description: ``,
    permissions: ['sendMessages']
  }
}