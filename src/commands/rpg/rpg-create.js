const Utils = require('../../Utils');

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: [],

  execute(msg) {

    Utils.query(`SELECT member_id FROM members WHERE member_id = ${msg.member.id}`, ([row]) => {
      if (row[0]) return msg.inlineReply(`Oi, blockhead (pun intended)! You already have an account.`)
      msg.channel.send(`**${msg.author.username}**, please type in your RPG name. (or cancel)`)

      const filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
        .then(collected => {
          if (collected.first().content.toLowerCase() === 'cancel') return msg.channel.send(`Cancelled for **${msg.author.username}**!`);

          const RPG_name = collected.first().content;
          Utils.query(`INSERT INTO members (member_id, inventory) VALUES ('${msg.member.id}', '{ diamonds: 0 }')`).then(
            msg.channel.send(
              Utils.createEmbed(
                [
                  [`Welcome ${RPG_name}!`, `Hey there, crafter! FYI: you can always change your RPG name later!`]
                ], { footer: true }
              ))
          )
        })
    })
  },

  help: {
    enabled: true,
    title: 'Create MCRPG Account',
    description: ``,
    permissions: ['SEND_MESSAGS', 'ADMINISTRATOR']
  }
}