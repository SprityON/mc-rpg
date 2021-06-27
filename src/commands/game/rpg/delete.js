const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, data => {
      if (!data[0][0]) return msg.inlineReply(`You don't have an account yet!`)

      msg.inlineReply(`Are you sure you want to remove your MCRPG account? (y/n)`);

      filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
        .then(collected => {
          if (collected.first().content.toLowerCase() === 'n') return collected.first().inlineReply('Cancelled!');

          Utils.query(`DELETE FROM members WHERE member_id = ${msg.member.id}`)
          msg.inlineReply(Utils.createEmbed(
            [
              [`Creeper? Aww man...`, `Your account has blown up! (no but seriously, it's gone)`]
            ], { status: 'success ' }
          ))
        })
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
    permissions: ['SEND_MESSAGES']
  }
}