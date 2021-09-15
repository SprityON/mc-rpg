const Utils = require('../../classes/utilities/Utils')
const Player = require('../../classes/game/Player')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '',
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    // test code
  },

  help: {
    enabled: false,
    title: '',
    description: ``,
  }
}