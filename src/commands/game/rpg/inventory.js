const BotClass = require('../../../BotClass');
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['inv'],
  permissions: ['SEND_MESSAGES'],

  async execute(msg, args) {
    await Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, async result => {
      const inv = JSON.parse(result[0][0].inventory);
      const itemsJSON = require('./items/items.json');
      const status = Math.floor(args[0]);

      let lastPage, currPage = 1;

      status 
      ? currPage = (10 * status) / 10 
      : currPage = 1

      let embed = new BotClass.Discord.MessageEmbed()
      .setColor(Utils.botRoleColor())
      .setAuthor(`${msg.author.username}'s inventory`, msg.author.avatarURL())

      let i = 0;
      let text = '';
      inv.forEach(item => {

        const item_name = Object.keys(item)[0];
        const item_amount = Object.values(item)[0];

        const foundItem = itemsJSON.find(e => e.id === item_name);
        if (foundItem) {
          i++
          text += `**${foundItem.name} ▬** ${item_amount}\n\
          *ID* \`${foundItem.id}\`\n\n`
        }
      })

      embed.addField(`${i} items total`, text)
      msg.channel.send(embed)
    })
  },

  help: {
    title: '',
    description: ``,
    enabled: false
  }
}