const BotClass = require('../../../BotClass');
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['l'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, data => {
      const embedColor = '9cdd84'
      const RPG_name = data[0][0].rpg_name

      const axe = data[0][0].lumbering_item
      const emote_axe = BotClass.client.emojis.cache.find(e => e.name === axe || e.name === axe);

      const rarity = [
        { "rarity": "common", "chance": 10000 },
        { "rarity": "uncommon", "chance": 6000 },
        { "rarity": "rare", "chance": 2500 },
        { "rarity": "very rare", "chance": 1000 },
        { "rarity": "epic", "chance": 300 },
        { "rarity": "legendary", "chance": 25 },
      ]

      const itemJSON = require('./items/items.json')
      const toolsJSON = require('./tools/tools.json')
      const userTool = toolsJSON.find(tool => tool.id === axe)

      let lumbered = []
      for (let item of itemJSON) {
        if (item.canLumber) {

          for (let r of rarity) {

            if (item.rarity == r.rarity) {
              let chance = Math.floor(Math.random() * 10000) + 1
              let amount = Math.floor(((Math.random() * 8) + 4) * userTool.amountMultiplier)

              if (chance < r.chance && amount > 0) {
                lumbered.push({
                  "id": item.id,
                  "rarity": item.rarity,
                  "amount": amount,
                  "chopped": true
                })
              }
            }
          }
        }
      }

      if (lumbered.length == 0 || !lumbered) return msg.inlineReply(Utils.createEmbed(
        [
          ['AWW MAN...', `You got nothing!`]
        ], { description: `${emote_axe} **${RPG_name}** went lumbering`, color: embedColor }
      ))

      let embed = new BotClass.Discord.MessageEmbed()
        .setColor(embedColor)
        .setDescription(`${emote_axe} **${RPG_name}** went lumbering`)

      let embedReceivedItemsText = '';

      let inventory = JSON.parse(data[0][0].inventory);
      let newInventory = [...inventory];

      let notLumbered = [];

      let i = 0
      for (i = 0; i < lumbered.length; i++) {
        if (lumbered[i].chopped === false) {
          let deletedItem = lumbered.splice(i, 1)[0]
          notLumbered.push({ id: deletedItem.id, amount: deletedItem.amount })
        }
      }

      i = 1
      lumbered.forEach(res => {
        let emote = BotClass.client.emojis.cache.find(e => e.name === res.id)

        if (res.chopped === true) {
          if (lumbered.length <= 1 || i == lumbered.length) {
            embedReceivedItemsText += `${emote} **${res.amount}**`
          } else {
            !(i / 3).toString().includes('.')
              ? embedReceivedItemsText += `${emote} **${res.amount}**\n`
              : embedReceivedItemsText += `${emote} **${res.amount}**, `
          }

          i++

          let foundItem = newInventory[1].items.find(item => Object.keys(item)[0] === res.id)
          if (foundItem) {
            for (let f = 0; f < newInventory[1].items.length; f++) {

              if (Object.keys(newInventory[1].items[f])[0] == res.id)
                return newInventory[1].items[f][res.id] += res.amount

            }
          } else return newInventory[1].items.push({ [res.id]: res.amount })
        }
      })

      embed.addField(`YOU GOT`, `${embedReceivedItemsText}`)

      Utils.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}' WHERE member_id = ${msg.member.id}`);
      msg.channel.send(embed)
    })
  }, 

  help: {
    enabled: true,
    title: 'Lumber',
    description: `Chop some wood!\nThe amount of wood you get is based on the speed of your axe, because a rarer axe is faster (it takes time to chop wood!).`
  }
}