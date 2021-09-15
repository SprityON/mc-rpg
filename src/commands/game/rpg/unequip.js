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
  aliases: ['ue'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const allJSON = require('./items/items.json').concat(require('./tools/tools.json'))
    const item_id = args[0].toLowerCase()

    const item = allJSON.find(item => item.id === item_id)
    if (item) {
      if (item.usedFor.includes('lumber')) {
        DB.query(`UPDATE members SET lumbering_item = '' WHERE member_id = ${msg.member.id}`)
      } else if (item.usedFor.includes('mining')) {
        DB.query(`UPDATE members SET mining_item = '' WHERE member_id = ${msg.member.id}`)
      }
    } else return msg.inlineReply(Utils.createEmbed([
      [`NOT FOUND`, `You do not have that item/tool in your inventory!`]
    ], { status: 'error' }))
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}