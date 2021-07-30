const Bot = require('../../../Bot');
const Utils = require('../../../Utils')

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
  timeout: 2500,

  execute(msg, args) {
    const shop = require('./shop/shop.json')

    let page;
    let filter;

    isNaN(args[0])
      ? (filter = args[0], page = Math.floor(args[1]))
      : (filter = args[1], page = Math.floor(args[0]))

    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, async result => {
      const inventory = JSON.parse(result[0][0].inventory);

      let emeraldAmount = Utils.emeraldAmount(inventory[0]['emerald'])
      let emeraldEmote = Bot.client.emojis.cache.find(e => e.name === 'emerald');

      Utils.embedList({
        title: `**SHOP ───────────── ${emeraldEmote} ${emeraldAmount}**`,
        type: 'shop',
        JSONlist: shop,
        member: msg.member,
        currPage: page,
        showAmountOfItems: 2,
        filter: filter
      }, message => msg.inlineReply(message))
    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}