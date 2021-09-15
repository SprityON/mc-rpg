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

  async execute(msg) {

    DB.query(`SELECT member_id FROM members WHERE member_id = ${msg.member.id}`).then(async ([row]) => {
      if (row[0]) return msg.inlineReply(`Oi, blockhead (pun intended)! You already have an account.`)
      msg.inlineReply(`**${msg.author.username}**, please type in your RPG name. (or cancel)`)

      const filter = m => m.author.id === msg.author.id

      msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
        .then(async collected => {

          if (collected.first().content.toLowerCase() === 'cancel') return msg.inlineReply(`Cancelled for **${msg.author.username}**!`);

          const RPG_name = collected.first().content;
            
          DB.query(`INSERT INTO members (member_id, rpg_name, inventory, axe, weapon) VALUES (?, ?, ?, ?, ?)`,
          [
            msg.member.id, 
            RPG_name, 
            '[{"emerald":0},{"tools":[],"items":[]}]',
            '{"id": "fists"}', 
            '{}'
          ])

          const prefix = await DB.guild.getPrefix(msg.guild.id)

          msg.inlineReply(Utils.createEmbed([
                [`Welcome ${RPG_name}!`, 
                `Let's get to work:\n\`${prefix}rpg mine\` - Go mining!\n\`${prefix}rpg hunt\` - Go hunt for loot and XP!\n\`${prefix}rpg lumber\` - Go chop some wood!`]
              ], { footer: true }
            ))
        }).catch(collected => {
          return msg.inlineReply(`Cancelled!`);
        })
    })
  },

  help: {
    enabled: true,
    title: 'Create MCRPG Account',
    description: `To begin your adventure, create your MCRPG account first.`
  }
}