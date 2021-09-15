const DB = require("../../../classes/database/DB")
const Utils = require("../../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    DB.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`).then(data => {
      if (!data[0][0]) return msg.inlineReply(`You don't have an account yet!`)

      msg.inlineReply(`Are you sure you want to remove your MCRPG account? (y/n)`);

      filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
        .then(collected => {
          if (collected.first().content.toLowerCase() === 'n') return collected.first().inlineReply('Cancelled!');

          DB.query(`DELETE FROM members WHERE member_id = ${msg.member.id}`)
          msg.inlineReply(Utils.createEmbed(
            [
              [`Creeper? Aww man...`, `Your account has blown up! (no but seriously, it's gone)`]
            ], { status: 'success ' }
          ))
        })
    })
  },

  help: {
    enabled: true,
    title: 'Delete MCRPG Account',
    description: `Delete your MCRPG account. Beware: your account can not be restored!`
  }
}