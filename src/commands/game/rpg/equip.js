const BotClass = require('../../../BotClass')
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: ['e'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, result => {
      const inventory = JSON.parse(result[0][0].inventory)
      const item_id = args[0].toLowerCase()
      const item_code = args[1]

      if (!item_id) return msg.inlineReply(Utils.createEmbed([
        [`NO ARGUMENTS`, `You have to provide some arguments!`]
      ], { status: 'error' }))

      if (item_code && isNaN(item_code)) return msg.inlineReply(Utils.createEmbed([
        [`ERROR`,`Item codes are only numbers!`]
      ], { status: 'error' }))

      let tool
      if (item_code) {
        for (let t of inventory[1].tools) {
          if (tool.code == item_code) tool = t
        }
      } else tool = inventory[1].tools.find(item => Object.keys(item)[0] === item_id)

      if (!tool) return msg.inlineReply(Utils.createEmbed([
        [`NOT FOUND`, `You do not have this tool in your inventory!`]
      ], { status: 'error' }))

      const allJSON = require('./items/items.json').concat(require('./tools/tools.json'))
      const item = allJSON.find(item => item.id === item_id)
      if (item.usedFor.includes('lumber')) {
        msg.inlineReply(`Do you want to use this item to \`lumber\`, \`fight\`, or \`both\`? Or \`cancel\``)

        const filter = m => m.author.id === msg.author.id
        msg.channel.awaitMessages(filter, { max: 1, time: 30000 }).then(collected => {
          switch (collected.first().content.toLowerCase()) {
            case 'lumber':
              Utils.query(`UPDATE members SET lumbering_item = '{"id": "${item_id}", "code": "${tool.code}"}' WHERE member_id = ${msg.member.id}`)
              break;

            case 'fight':
              Utils.query(`UPDATE members SET battle_item = '{"id": "${item_id}", "code": "${tool.code}"}' WHERE member_id = ${msg.member.id}`)
              break;

            case 'both':  
              Utils.query(`UPDATE members SET battle_item = '{"id": "${item_id}", "code": "${tool.code}"}', lumbering_item = '{"id": "${item_id}", "code": "${tool.code}"}' WHERE member_id = ${msg.member.id}`)
              break;

            case 'cancel':
              msg.channel.send(`Tool was not equipped.`)
              break;
          
            default:
              return msg.inlineReply(Utils.createEmbed([
                [`WRONG ARGUMENTS`, `That was not an option!`]
              ], { status: 'error' }))
          }
        })
      } else if (item.usedFor.includes('mining')) {
        Utils.query(`UPDATE members SET mining_item = '{"id": "${item_id}", "code": "${tool.code}"}' WHERE member_id = ${msg.member.id}`)
      } else if(item.usedFor.includes('combat')) {
        Utils.query(`UPDATE members SET battle_item = '{"id": "${item_id}", "code": "${tool.code}"}' WHERE member_id = ${msg.member.id}`)
      }

      const emote = BotClass.client.emojis.cache.find(e => e.name === item_id)
      msg.inlineReply(Utils.createEmbed([
        [`TOOL EQUIPPED`, `Your ${emote} tool has been equipped!`]
      ]))
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}