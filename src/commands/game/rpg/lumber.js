const Bot = require('../../../Bot');
const DB = require('../../../classes/database/DB');
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
  aliases: ['l'],
  permissions: ['SEND_MESSAGES'],
  timeout: 30000,

  async execute(msg, args) {
    const player = new Player(msg.member.id)
    const inventory = await player.inventory

    const embedColor = '9cdd84'
    const emote_axe = Bot.client.emojis.cache.find(e => e.name === player.axe.id);

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
    const userTool = toolsJSON.find(tool => tool.id === player.axe.id)

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
      ], { description: `${emote_axe} **${player.name}** went lumbering`, color: embedColor }
    ))

    let embed = new Bot.Discord.MessageEmbed()
      .setColor(embedColor)
      .setDescription(`${emote_axe} **${player.name}** went lumbering`)

    let embedReceivedItemsText = '';

    let newInventory = [...inventory];

    i = 1
    let broken_axe_text = ''
    lumbered.forEach(res => {
      let emote = Bot.client.emojis.cache.find(e => e.name === res.id)

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

            // update durability
            if (Object.keys(newInventory[1].items[f])[0] == res.id) {
              for (let ii = 0; ii < inventory[1].tools.length; ii++) {
                if (inventory[1].tools[ii][player.axe.id] && inventory[1].tools[ii].code == player.axe.code) {
                  newInventory[1].tools[ii].currentDurability -= res.amount

                  if (newInventory[1].tools[ii].currentDurability < 0) {
                    broken_axe_text += `\n\n**AWW MAN...**\nYour ${emote_axe} Axe broke!`
                    axe = `{"id": "fists"}`
                    return newInventory[1].tools.splice(ii, 1)
                  }
                }

                ii++
              }

              if (newInventory[1].items[f][res.id])
                newInventory[1].items[f][res.id] += res.amount
            }
          }
        } else return newInventory[1].items.push({ [res.id]: res.amount })
      }
    })

    embed.addField(`YOU GOT`, `${embedReceivedItemsText}${broken_axe_text}`)

    DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', axe = '${JSON.stringify(axe)}' WHERE member_id = ${msg.member.id}`);
    msg.channel.send(embed)
  },

  help: {
    enabled: true,
    title: 'Lumber',
    description: `Chop some wood!\nThe amount of wood you get is based on the speed of your axe, because a rarer axe is faster (it takes time to chop wood!).`
  }
}