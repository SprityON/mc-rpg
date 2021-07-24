const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['cr'],
  permissions: ['SEND_MESSAGES'],
  timeout: 2500,

  execute(msg, args) {
    const craftables = require('./items/items.json').concat(require('./tools/tools.json')).filter(item => item.craftable === true)

    let page;
    let filter;

    isNaN(args[0])
      ? (filter = args[0], page = Math.floor(args[1]))
      : (filter = args[1], page = Math.floor(args[0]))

    Utils.embedList({
      title: `**CRAFTABLES**`,
      type: 'craftables',
      JSONlist: craftables,
      member: msg.member,
      currPage: page,
      showAmountOfItems: 5,
      filter: filter
    }, message => msg.inlineReply(message))
  },

  help: {
    enabled: true,
    title: 'Craftables',
    description: `A list of all craftable items/blocks will be shown.`,
  }
}