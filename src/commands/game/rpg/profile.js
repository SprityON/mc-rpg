const Bot = require('../../../Bot')
const Player = require('../../../classes/game/Player')
const Utils = require("../../../classes/utilities/Utils")
const progressBar = require('string-progressbar');

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: ['stats', 'p'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    let embed = new Bot.Discord.MessageEmbed()

    const player = new Player(msg.member.id)
    const inventory = await player.inventory
    const rpg_name = await player.name
    const axe = await player.axe
    const pickaxe = await player.pickaxe
    const weapon = await player.weapon

    const itemsJSON = require('./items/items.json')

    const equipped_axe = () => {
      if (axe) {
        let ax = inventory[1].tools.find(tool => Object.keys(tool)[0] === axe.id)
        let emoji = Bot.client.emojis.cache.find(e => e.name === axe.id)

        if (!ax.code) return `${emoji}`
        return `${emoji} (${progressBar.filledBar(ax.maxDurability, ax.currentDurability, 5)[0]})`
      } else return `None`
    }
    const equipped_pickaxe = () => {
      if (pickaxe.id) {
        let paxe = inventory[1].tools.find(tool => Object.keys(tool)[0] === pickaxe.id)
        let emoji = Bot.client.emojis.cache.find(e => e.name === Object.keys(paxe)[0])

        return `${emoji} (${progressBar.filledBar(paxe.maxDurability, paxe.currentDurability, 5)[0]})`
      } else return 'None'
    }
    const equipped_sword = () => {
      if (weapon.id) {
        let wpn = inventory[1].tools.find(tool => Object.keys(tool)[0] === weapon.id)
        let emoji = Bot.client.emojis.cache.find(e => e.name === Object.keys(wpn)[0])

        return `${emoji} (${progressBar.filledBar(wpn.maxDurability, wpn.currentDurability, 5)[0]})`
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

    embed.setAuthor(`${rpg_name}'s profile`, msg.author.avatarURL({ dynamic: true }))
    embed.addField(`Inventory`, `Total items: ${itemAmount} items\nWorth ${emerald} ${Utils.emeraldAmount(inventoryWorth)}`, true)
    embed.addField(`Equipped Tools`, `Pickaxe: **${equipped_pickaxe()}**\nAxe: **${equipped_axe()}**\nSword: **${equipped_sword()}**`, true)

    msg.inlineReply(embed)
  },

  help: {
    enabled: true,
    title: 'Profile',
    description: `See your RPG profile!`,
  }
}