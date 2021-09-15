const Bot = require('../../../Bot');
const Player = require('../../../classes/game/Player');
const Utils = require("../../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: ['inv'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    let page, filter;

    isNaN(args[0])
      ? (filter = args[0], page = Math.floor(args[1]))
      : (filter = args[1], page = Math.floor(args[0]))

    const player = new Player(msg.member.id)
    const inventory = await player.inventory

    let emeraldAmount = Utils.emeraldAmount(inventory[0]['emerald'])
    let emeraldEmote = Bot.client.emojis.cache.find(e => e.name === 'emerald');

    let listJSON = require(`./items/items.json`).concat(require(`./tools/tools.json`))

    Utils.embedList({
      title: `**𝗜𝗡𝗩𝗘𝗡𝗧𝗢𝗥𝗬 ───────────── ${emeraldEmote} ${emeraldAmount}**`,
      type: 'inventory',
      selectQuery: `SELECT * FROM members WHERE member_id = ${msg.member.id}`,
      JSONlist: listJSON,
      member: msg.member,
      currPage: page,
      showAmountOfItems: 5,
      filter: filter
    }, message => msg.inlineReply(message))
  },

  help: {
    title: 'Inventory',
    description: `View your inventory! To filter , use \`${Utils.getCmdUsage(__filename, __dirname)} tools\`\
     or \`${Utils.getCmdUsage(__filename, __dirname)} items\``,
    enabled: true
  }
}