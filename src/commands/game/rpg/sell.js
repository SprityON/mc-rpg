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
  aliases: ['s'],
  permissions: ['SEND_MESSAGES'],
  timeout: 2500,

  execute(msg, args) {
    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, async data => {
      let correctArgument = Utils.createEmbed(
        [
          [`INCORRECT ARGUMENTS`, `Please provide the correct arguments.\nExample: \`rpg sell cobblestone 5\``]
        ], { status: 'error' }
      )

      if (!args[0]) return msg.inlineReply(correctArgument)

      let item_id
      let amount
      let inventory = JSON.parse(data[0][0].inventory)

      if (args[0] == 'all') {
        amount = args[0];
        item_id = args[1];
      } else if (args[1] == 'all') {
        amount = args[1]; 
        item_id = args[0];
      } else {
        if(!isNaN(args[0])) {
          amount = args[0]
          item_id = args[1]
        } else {
          !args[1]
            ? amount = 1
            : amount= args[1]
          item_id = args[0]
        }
      }

      let allJSON = require('./items/items.json').concat(require('./tools/tools.json'))
      let item;
      
      if (amount != 'all') {
        item = allJSON.find(item => item.id === item_id)

        if (!item) return msg.inlineReply(Utils.createEmbed(
          [
            [`ITEM NOT FOUND`, `That item does not exist!`]
          ], { status: 'error' }
        ))

        if (item.category == 'tools') return msg.inlineReply(Utils.createEmbed(
          [
            [`ERROR`, `That is a tool! Break this tool with  \`rpg break <tool_id>\`\nAfter breaking, you will be given some portion of its materials.`]
          ], { status: 'error' }
        ))
      } else {
        let text = ''
        item = allJSON.find(item => item.id === item_id)

        if (!item && args[1]) return msg.inlineReply(Utils.createEmbed(
          [
            [`ITEM NOT FOUND`, `That item does not exist!`]
          ], { status: 'error' }
        ))

        if (args[1] && !item.mineable) return msg.inlineReply(Utils.createEmbed(
          [
            [`ERROR`, `That is a tool! Break this tool with  \`rpg break <tool_id>\`\nAfter breaking, you will be given some portion of its materials.`]
          ], { status: 'error' }
        ))

        if (inventory[1].items.length <= 0) return msg.inlineReply(`You do not have any items in your inventory!`)

        if (item_id) { text += `${item.name}` }
        else text += `your items`
        msg.inlineReply(`Are you sure you want to delete all ${text}? (y/n)`)

        let Continue = false
        let filter = m => m.author.id === msg.author.id
        await msg.channel.awaitMessages(filter, { time: 30000, max: 1 })
        .then(collected => {
          if (collected.first().content.toLowerCase() === 'y') Continue = true
        })

        if (!Continue) return msg.inlineReply(`Cancelled!`);
      }

      let soldPrice = 0
      if (amount == 'all') {
        if (item_id) {
          let foundItem = inventory[1].items.find(item => Object.keys(item)[0])

          if (Object.keys(foundItem)[0] === item_id) {
            let item = allJSON.find(item => item.id === item_id)

            let receivedCurrency = item.sellPrice * Object.values(foundItem)
            soldPrice = receivedCurrency

            inventory[0]['emerald'] += receivedCurrency
            inventory[1].items.splice(0, 1)
          }
        } else {
          for (let i = 0; i < inventory[1].items.length;) {
            let foundItem = inventory[1].items[i]
            let item = allJSON.find(item => item.id === Object.keys(foundItem)[0])

            let foundItemAmount = Object.values(foundItem)
            let receivedCurrency = item.sellPrice * foundItemAmount
            soldPrice += receivedCurrency

            inventory[0]['emerald'] += receivedCurrency
            inventory[1].items.splice(0, 1)
          }
        }
      } else {
        let receivedCurrency = item.sellPrice * amount
        soldPrice = receivedCurrency
        let itemName

        for (let i = 0; i < inventory[1].items.length; i++) {
          if (Object.keys(inventory[1].items[i])[0] === item_id) {
            let foundItem = inventory[1].items[i]

            itemName = item.name

            if (!foundItem) return msg.inlineReply(Utils.createEmbed(
              [
                [`ERROR`, `You do not have that item!`]
              ], { status: 'error' }
            ))

            let foundItemAmount = Object.keys(foundItem)
            if (amount === 'all') amount = foundItemAmount

            if (amount > foundItemAmount) return msg.inlineReply(Utils.createEmbed(
              [
                [`ERROR`, `You do not have ${foundItemAmount} of ${item.name}!`]
              ], { status: 'error' }
            ))

            if (inventory[1].items[i][item_id] <= 0) { 
              inventory[1].items.splice(i,1)

              return msg.inlineReply(Utils.createEmbed(
              [
                [`ERROR`, `You do not have that item!`]
              ], { status: 'error' }
            ))
            }

            inventory[0]['emerald'] += receivedCurrency
            inventory[1].items[i][item_id] -= amount

            break 
          }
        }

        if (!itemName) return msg.inlineReply(Utils.createEmbed(
          [
            [`ERROR`, `You do not have that item!`]
          ], { status: 'error' }
        ))
      }

      let emote_emerald = Bot.client.emojis.cache.find(e => e.name === 'emerald')

      const emeraldAmount = Utils.emeraldAmount(inventory[0]['emerald'])

      if (amount == 'all') {
        let alt_text = 'Sold ALL ITEMS'
        if (item_id) alt_text = `Sold ${amount} ${item.name}` 
        msg.inlineReply(Utils.createEmbed(
          [], { title: `${alt_text} for ${soldPrice}`, description: `You now have ${emote_emerald} ${emeraldAmount} Emeralds` }
        ))
      } else {
        msg.inlineReply(Utils.createEmbed(
          [], { title: `Sold ${amount} ${item.name} for ${soldPrice}`, description: `You now have ${emote_emerald} ${emeraldAmount} Emeralds` }
        ))
      }

      Utils.query(`UPDATE members SET inventory = '${JSON.stringify(inventory)}' WHERE member_id = ${msg.member.id}`)
    })
  },

  help: {
    enabled: true,
    title: 'Sell Item',
    description: `Be sure to provide the correct arguments!\nExample: \`rpg sell cobblestone 5\``,
  }
}