const BotClass = require('../../../BotClass');
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['inv'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
      const page = Math.floor(args[1]);

      let filter;
      if (isNaN(args[1])) {
        filter = args[1];
      }

    Utils.embedInventoryList({
        member: msg.member,
        currPage: page,
        showAmountOfItems: 5,
        filter: filter
    }, data => msg.inlineReply(data))
  },

  help: {
    title: 'Inventory',
    description: `View your inventory! To filter , use \`${Utils.getCmdUsage(__filename, __dirname)} tools\`\
     or \`${Utils.getCmdUsage(__filename, __dirname)} items\``,
    enabled: true
  }
}