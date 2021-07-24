const BotClass = require('../../../BotClass')
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['m'],
  permissions: ['SEND_MESSAGES'],
  timeout: 30000,

  async execute(msg, args) {
    await Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, data => {
      const embedColor = '#b8b8b8';
      const RPG_name = data[0][0].rpg_name

      if (!data[0][0].mining_item) return msg.inlineReply(Utils.createEmbed(
        [
          [`NO PICKAXE EQUIPPED`, `Buy or equip a pickaxe to be able to mine.`]
        ], { color: embedColor }
      ))

      const pickaxe = JSON.parse(data[0][0].mining_item)
      const emote_pickaxe = BotClass.client.emojis.cache.find(e => e.name === pickaxe.id);

      let mined = [];

      let itemJSON = require('./items/items.json');

      const rarity = [
        { "rarity": "common",     "chance": 8500, amountMultiplier: 1 },
        { "rarity": "uncommon",   "chance": 6000, amountMultiplier: 0.7 },
        { "rarity": "rare",       "chance": 2500, amountMultiplier: 0.4 },
        { "rarity": "very rare",  "chance": 1000, amountMultiplier: 0.3 },
        { "rarity": "epic",       "chance": 300,  amountMultiplier: 0.3 },
        { "rarity": "legendary",  "chance": 25,   amountMultiplier: 0.1 },
      ]

      for (let item of itemJSON) {
        if (item.mineable) {

          for (let r of rarity) {

            if (item.rarity == r.rarity) {
              let chance = Math.floor(Math.random() * 10000) + 1
              let amount = Math.floor(((Math.floor(Math.random() * 10) + 1) * r.amountMultiplier)) + 1

              if (chance < r.chance) {
                if (item.mineableWith.includes(pickaxe.id)) {
                  mined.push({
                    "id": item.id,
                    "rarity": item.rarity,
                    "amount": amount,
                    "mined": true
                  })
                } else {
                  mined.push({
                    "id": item.id,
                    "rarity": item.rarity,
                    "amount": amount,
                    "mined": false
                  })
                }
              }
            }
          }
        }
      }

      if (mined.length == 0 || !mined) return msg.inlineReply(Utils.createEmbed(
        [
          ['AWW MAN...', `You got nothing!`]
        ], { description: `${emote_pickaxe} **${RPG_name}** went mining`, color: embedColor }
      ))

      let embed = new BotClass.Discord.MessageEmbed()
        .setDescription(`${emote_pickaxe} **${RPG_name}** went mining`)
        .setColor(embedColor)

      let embedReceivedItemsText = '';
      let embedTriedMiningFailed = '';

      let inventory = JSON.parse(data[0][0].inventory);
      let newInventory = [...inventory];

      let notMined = [];

      let i = 0
      for (i = 0; i < mined.length; i++) {
        if (mined[i].mined === false) {
          let deletedItem = mined.splice(i, 1)[0]
          notMined.push({ id: deletedItem.id, amount: deletedItem.amount })
        }
      }

      i = 0
      for (let res of notMined) {
        let emote = BotClass.client.emojis.cache.find(e => e.name === res.id)

        notMined.length - 1 <= 1 | i == notMined.length - 1
          ? embedTriedMiningFailed += `${emote} **${res.amount}**`
          : embedTriedMiningFailed += `${emote} **${res.amount}**, `

        i++
      }

      i = 1
      mined.forEach(res => {
        let emote = BotClass.client.emojis.cache.find(e => e.name === res.id)
        
        if (res.mined === true) {
          if (mined.length <= 1 || i == mined.length) {
            embedReceivedItemsText += `${emote} **${res.amount}**`
          } else {
            !(i / 3).toString().includes('.')
              ? embedReceivedItemsText += `${emote} **${res.amount}**\n`
              : embedReceivedItemsText += `${emote} **${res.amount}**, `
          }

          i++

          if (res.id == 'emerald') 
            return newInventory[0][res.id] += res.amount;

          let foundItem = newInventory[1].items.find(item => Object.keys(item)[0] === res.id)
          if (foundItem) {
            for (let f = 0; f < newInventory[1].items.length; f++) {

              if (Object.keys(newInventory[1].items[f])[0] == res.id) {
                for (let ii = 0; ii < inventory[1].tools.length; ii++) {
                  if (inventory[1].tools[ii][pickaxe.id] && inventory[1].tools[ii].code === pickaxe.code) {
                    newInventory[1].tools[ii].currentDurability -= res.amount

                    if (newInventory[1].tools[ii].currentDurability < 0) {
                      embedReceivedItemsText += `\n\nYour ${emote_pickaxe} Pickaxe broke!`
                      data[0][0].lumbering_item = `{"id": "fists"}`
                      return newInventory[1].tools.splice(ii, 1)
                    }
                  }

                  ii++
                }
              }
               return newInventory[1].items[f][res.id] += res.amount
            }
          } else return newInventory[1].items.push({ [res.id]: res.amount })
        }
      })
      
      embedTriedMiningFailed.length > 0
        ? embed.addField(`YOU GOT`, `${embedReceivedItemsText}\n\nYou tried mining ${embedTriedMiningFailed} but couldn't!\nTry upgrading your pickaxe.`)
        : embed.addField(`YOU GOT`, `${embedReceivedItemsText}`)
      
      // [{ "emerald": 0}, {"tools": [{"fists": 1}], "items": [{"cobblestone": 1}] }]

      Utils.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}' WHERE member_id = ${msg.member.id}`);
      msg.channel.send(embed)
    })
  },

  help: {
    enabled: true,
    title: '(MINING AWAY)[https://www.youtube.com/watch?v=dgha9S39Y6M]',
    description: `Mining is essential to upgrade one's own gear.\nThe rarer the item, the lesser you get!`
  }
}