const Utils = require('../../../Utils');

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

  execute(msg) {

    Utils.query(`SELECT member_id FROM members WHERE member_id = ${msg.member.id}`, ([row]) => {
      if (row[0]) return msg.inlineReply(`Oi, blockhead (pun intended)! You already have an account.`)
      msg.inlineReply(`**${msg.author.username}**, please type in your RPG name. (or cancel)`)

      const filter = m => m.author.id === msg.author.id

      msg.channel.awaitMessages(filter, { timeout: 60000, max: 1 })
        .then(collected => {

          if (collected.first().content.toLowerCase() === 'cancel') return msg.inlineReply(`Cancelled for **${msg.author.username}**!`);

          const RPG_name = collected.first().content;
            
          Utils.query(`INSERT INTO members (member_id, rpg_name, inventory, lumbering_item, battle_item) VALUES (?, ?, ?, ?, ?)`,
          [
            msg.member.id, 
            RPG_name, 
            '[{"emerald":0},{"tools":[],"items":[]}]',
            '{"id": "fists"}', 
            '{}'
          ]).then(
            Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, data => {
              msg.inlineReply(
                Utils.createEmbed(
                  [
                    [`Welcome ${RPG_name}!`, `Let's get to work:\n\
                  \`${data[0][0].prefix}rpg mine\` - Go mining!\n\
                  \`${data[0][0].prefix}rpg hunt\` - Go hunt for loot and XP!\n\
                  \`${data[0][0].prefix}rpg lumber\` - Go chop some wood!`]
                  ], { footer: true }
                ))
            })
          )
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