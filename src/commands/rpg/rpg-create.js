const { other: { command: { getName, getCategory, getUsage } }, db: { query }, strMods: { createEmbed } } = require('../../Utils')

module.exports = {
  name: getName(__filename, __dirname),
  category: getCategory(__filename),
  usage: getUsage(__filename, __dirname),
  aliases: [],

  execute(msg, args) {
    msg.channel.send(`**${msg.author.uesrname}**, please type in your RPG name. ('cancel' to cancel)`)

    const filter = m => m.author.id === msg.author.id
    msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
    .then(collected => {
      if (collected.first().content.toLowerCase() === 'cancel') return msg.channel.send(`Cancelled for **${msg.author.username}**!`);

      const RPG_name = collected.first().content;
      query(`INSERT INTO members (member_id, inventory) VALUES ('${msg.member.id}', '{ emeralds: 0 }')`).then(
        query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, result => {
          const prefix = result[0][0].prefix

          msg.channel.send(
          createEmbed(
            [
              [`Account created successfully!`, `Your RPG name: **${RPG_name}**\nYou can always change your RPG name later!`]
            ], { enableFooter: true }
          ))
        })
      )
    })
  },

  help: {
    enabled: true,
    title: 'Create MCRPG Account',
    description: ``,
    permissions: ['sendMessages']
  }
}