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
      let pickaxe
      if (result[0][0].mining_item) pickaxe = JSON.parse(result[0][0].mining_item)

      let inventory = JSON.parse(result[0][0].inventory)
      const item_id = args[0].toLowerCase()
      const item_code = args[1]

      if (!item_id) return msg.inlineReply(Utils.createEmbed([
        [`NO ARGUMENTS`, `You have to provide some arguments!`]
      ], { status: 'error' }))

      if (item_code && isNaN(item_code)) return msg.inlineReply(Utils.createEmbed([
        [`ERROR`,`Item codes are only numbers!`]
      ], { status: 'error' }))

      let findInvPickaxe
      if (item_code) {
        for (let tool of inventory[1].tools) {
          if (tool.code == item_code) findInvPickaxe = tool
        }
      } else findInvPickaxe = inventory[1].tools.find(item => Object.keys(item)[0] === item_id)

      if (!findInvPickaxe) return msg.inlineReply(Utils.createEmbed([
        [`NOT FOUND`, `You do not have this tool in your inventory!`]
      ], { status: 'error' }))

      const emote = BotClass.client.emojis.cache.find(e => e.name === item_id)
      msg.inlineReply(Utils.createEmbed([
        [`TOOL EQUIPPED`,`Your ${emote} tool has been equipped!`]
      ]))

      const allJSON = require('./items/items.json').concat(require('./tools/tools.json'))
      const item = allJSON.find(item => item.id === item_id)
      if (item.usedFor.includes('lumber')) {
        Utils.query(`UPDATE members SET lumbering_item = '{"id": "${item_id}", "code": "${findInvPickaxe.code}"}' WHERE member_id = ${msg.member.id}`)
      } else if (item.usedFor.includes('mining')) {
        Utils.query(`UPDATE members SET mining_item = '{"id": "${item_id}", "code": "${findInvPickaxe.code}"}' WHERE member_id = ${msg.member.id}`)
      }
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}