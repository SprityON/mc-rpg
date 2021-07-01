const Utils = require('../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}