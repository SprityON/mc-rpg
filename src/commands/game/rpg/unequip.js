const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['ue'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const allJSON = require('./items/items.json').concat(require('./tools/tools.json'))
    const item_id = args[0].toLowerCase()

    const item = allJSON.find(item => item.id === item_id)
    if (item) {
      if (item.usedFor.includes('lumber')) {
        Utils.query(`UPDATE members SET lumbering_item = '' WHERE member_id = ${msg.member.id}`)
      } else if (item.usedFor.includes('mining')) {
        Utils.query(`UPDATE members SET mining_item = '' WHERE member_id = ${msg.member.id}`)
      }
    } else return msg.inlineReply(Utils.createEmbed([
      [`NOT FOUND`,`You do not have that item/tool in your inventory!`]
    ], { status: 'error' }))
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}