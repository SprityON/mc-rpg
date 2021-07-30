const Bot = require('../../../Bot')
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: ['stats', 'pr'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    let embed = new Bot.Discord.MessageEmbed()

    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, result => {
      const itemsJSON = require('./items/items.json')
      const rpg_name = result[0][0].rpg_name
      const inventory = JSON.parse(result[0][0].inventory)
      const progressBar = require('string-progressbar');

      const equipped_axe = () => {
        if (JSON.parse(result[0][0].lumbering_item).code) {
          console.log(inventory[1].tools[1])
          let axe = inventory[1].tools.find(tool => Object.keys(tool)[0] === JSON.parse(result[0][0].lumbering_item).id)
          let emoji = Bot.client.emojis.cache.find(e => e.name === Object.keys(axe)[0])

          if (!axe.code) return `${emoji}`
          return `${emoji} (${progressBar.filledBar(axe.maxDurability, axe.currentDurability, 5)[0]})`
        } else return `None`
      }
      const equipped_pickaxe = () => {
        if (JSON.parse(result[0][0].mining_item).id) {
          let pickaxe = inventory[1].tools.find(tool => Object.keys(tool)[0] === JSON.parse(result[0][0].mining_item).id)
          let emoji = Bot.client.emojis.cache.find(e => e.name === Object.keys(pickaxe)[0])

          return `${emoji} (${progressBar.filledBar(pickaxe.maxDurability, pickaxe.currentDurability, 5)[0]})`
        } else return 'None'
      }
      const equipped_sword = () => {
        if (JSON.parse(result[0][0].battle_item).id) {
          let sword = inventory[1].tools.find(tool => Object.keys(tool)[0] === JSON.parse(result[0][0].battle_item).id)
          let emoji = Bot.client.emojis.cache.find(e => e.name === Object.keys(sword)[0])

          return `${emoji} (${progressBar.filledBar(sword.maxDurability, sword.currentDurability, 5)[0]})`
        } else return 'None'
      }

      let itemAmount = 0
      let inventoryWorth = 0
      inventory[1].items.forEach(item => {
        let jsonItem = itemsJSON.find(item2 => item2.id === Object.keys(item)[0])
        itemAmount += Object.values(item)[0]

        inventoryWorth += Object.values(item)[0] * jsonItem.sellPrice
      })
      inventory[1].tools.forEach(item => {
        itemAmount++
      })

      let emerald = Bot.client.emojis.cache.find(e => e.name === 'emerald')

      embed.setAuthor(`${rpg_name}'s profile`, msg.author.avatarURL({dynamic: true}))
      embed.addField(`Inventory`, `Total items: ${itemAmount} items\nWorth ${emerald} ${Utils.emeraldAmount(inventoryWorth)}`, true)
      embed.addField(`Equipped Tools`, `Pickaxe: **${equipped_pickaxe()}**\nAxe: **${equipped_axe()}**\nSword: **${equipped_sword()}**`, true)

      msg.inlineReply(embed)
    })
  },

  help: {
    enabled: true,
    title: 'Profile',
    description: `See your RPG profile!`,
  }
}