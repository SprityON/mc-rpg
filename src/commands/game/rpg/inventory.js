const BotClass = require('../../../BotClass');
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['inv'],
  permissions: ['SEND_MESSAGES'],

  async execute(msg, args) {
      const page = Math.floor(args[1]);

      Utils.embedInventoryList({
        member: msg.member,
        currPage: page,
        showAmountOfItems: 5
      }, ([success, message]) => {
        if (success) {
          // if success = true then message = embed
          msg.channel.send(message);
        } else {
          // if success = false then message = error message
          msg.channel.send(message);
        };
      });
  },

  help: {
    title: 'Inventory',
    description: `View your inventory!`,
    enabled: true
  }
}