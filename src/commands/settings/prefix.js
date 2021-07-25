const Utils = require('../../Utils');

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: ['p'],
  permissions: ['SEND_MESSAGES', 'ADMINISTRATOR'],
  timeout: 1000,

  execute(msg, args) {
    Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, result => {
      const prefix = result[0][0].prefix;
      const newPrefix = args[0];

      if (!newPrefix) return msg.channel.send(
        Utils.createEmbed(
          [
            [`Prefix Settings`, `Change your server prefix like so:\n\`${prefix}prefix <your-prefix>\``]
          ]
        ))

      msg.channel.send(`Are you sure you want to change your MCRPG's server prefix to: \`${newPrefix}\`? (y/n)`);

      const filter = m => m.author.id === msg.author.id;
      msg.channel.awaitMessages(filter, { timeout: 30000, max: 1 })
      .then(collected => {
        if (collected.first().content.toLowerCase() === 'y') {

          Utils.query(`UPDATE guilds SET prefix = ? WHERE guild_id = '${msg.guild.id}'`, [newPrefix]).then(
            msg.channel.send(
              Utils.createEmbed(
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
    title: 'Prefix',
    description: `Change your prefix to whatever you want!`
  }
}