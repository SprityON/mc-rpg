const BotClass = require('../../../BotClass');
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['b', 'br'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {

    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, async result => {
      let inventory = JSON.parse(result[0][0].inventory);
      const allJSON = require('./items/items.json').concat(require('./tools/tools.json'))

      let item_id
      let item_code
      let amount

      if (!args[1]) {
        item_id = args[0]
        amount = 1
      }
      else if (args[1] == 'all') {
        amount = 'all'
        // continue
      }
      else if (!isNaN(args[1]) && args[1].length == 4) {
        if (args[2] && args[2].length > 0) return msg.inlineReply(Utils.createEmbed([
          [`WRONG USAGE`, `You have specified a item code. You cannot break 2 or more specific items!`]
        ], { status: 'error' }
        ))
      }
      else if (!isNaN(args[1]) && args[1].length == 4) {
        item_code = args[1]
        item_id = args[0]
        amount = 1
        console.log('hi')
      }
      else if (!isNaN(args[0]) && args[0].length == 4) {
        item_code = args[0]
        item_id = args[1]
        amount = 1
      }
      else if (!isNaN(args[1])) {
        amount = args[1]
        item_id = args[0]
      } else {  
        amount = args[0]
        item_id = args[1]
      }

      if (item_code && item_code.length !== 4) return msg.inlineReply(Utils.createEmbed([
        [`WRONG USAGE`, `Item codes are of 4 characters!`]
      ], { status: 'error' }
      ))

      if (!item_id) return msg.inlineReply(Utils.createEmbed([
        [`WRONG USAGE`, `Please provide an item ID!`]
      ], { status: 'error'}
      ))
      let hasItem = false

      let i = 0
      let refundedItems = []
      for (const item of inventory[1].tools) {
        const itemName = Object.keys(item)[0]

        if (itemName === item_id) {
          if (amount == 'all') amount = inventory[1].tools[i][itemName]

          hasItem = true
          let oldInventory = [...inventory]
          let oldItemAmount = oldInventory[1].tools[i][itemName]
          inventory[1].tools[i][itemName] -= amount

          if (inventory[1].tools[i][itemName] < 0) return msg.inlineReply(Utils.createEmbed([
            [`ERROR`, `You can't break **${amount}** \`${item_id}\`'s, you only have **${oldItemAmount}**!`]
          ], { status: 'error' }
          ))

          if (inventory[1].tools[i][itemName] < 1) inventory[1].tools.splice(i, 1)

          const recipe = allJSON.find(item => item.id === item_id).recipe
          if (!recipe) return msg.inlineReply(Utils.createEmbed([
            [`ERROR`, `This item cannot be broken!`]
          ], { status: 'error' }
          ))

          const JSONitem = allJSON.find(item => item.id === item_id)
          if (!JSONitem.breakable) return msg.inlineReply(Utils.createEmbed([
            [`ERROR`, `This item cannot be broken!`]
          ], { status: 'error' }
          ))

          JSONitem.recipe.forEach(rec => {
            const random = Math.floor((Math.random() * Object.values(rec)[0]) * amount) + 1

            let e = -1
            for (const item2 of inventory[1].items) {
              e++
              if (Object.keys(item2)[0] === Object.keys(rec)[0]) {
                return refundedItems.push({ id: Object.keys(rec)[0], amount: random, placement: e, category: 'items' })
              }
            }
          })

          break
        }
        i++
      }

      i = 0
      for (let item of inventory[1].items) {
        const itemName = Object.keys(item)[0]
        if (itemName === item_id) {
          hasItem = true
          let oldInventory = [...inventory]
          let oldItemAmount = oldInventory[1].items[i][itemName]
          inventory[1].items[i][itemName] -= amount

          if (inventory[1].items[i][itemName] < 0) return msg.inlineReply(Utils.createEmbed([
            [`ERROR`, `You can't break **${amount}** items, you only have **${oldItemAmount}**!`]
          ], { status: 'error' }
          ))

          if (inventory[1].items[i][itemName] < 1) inventory[1].items.splice(i, 1)

          const JSONitem = allJSON.find(item => item.id === item_id)
          if (!JSONitem.breakable) return msg.inlineReply(Utils.createEmbed([
            [`ERROR`, `This item cannot be broken!`]
          ], { status: 'error' }
          ))

          JSONitem.recipe.forEach(rec => {
            const random = Math.floor((Math.random() * Object.values(rec)[0]) * amount) + 1

            let e = -1
            for (const item2 of inventory[1].items) {
              e++
              if (Object.keys(item2)[0] === Object.keys(rec)[0]) {
                return refundedItems.push({ id: Object.keys(rec)[0], amount: random, placement: e, category: 'items' })
              }
            }
          })
        }
        i++
      }

      if (!hasItem) return msg.inlineReply(Utils.createEmbed([
        [`ITEM NOT FOUND`, `You don't have that item in your inventory, or this item cannot be broken!`]
      ], { status: 'error' }
      ))

      let text_refundedItems = ''
      i = 1
      refundedItems.forEach(item => {
        if (item.category === 'tools') {
          if (!inventory[1].tools.find(item.id)) {
            inventory[1].tools.push({ [item.id]: item.amount })

            let emote = BotClass.client.emojis.cache.find(e => e.name === item.id)

            if (i === refundedItems.length) {
              text_refundedItems += `${emote} ${item.amount}`
            } else {
              text_refundedItems += `${emote} ${item.amount}, `
            }
          } else {
            inventory[1].tools[item.placement][item.id] += item.amount

            let emote = BotClass.client.emojis.cache.find(e => e.name === item.id)

            if (i === refundedItems.length) {
              text_refundedItems += `${emote} ${item.amount}`
            } else {
              text_refundedItems += `${emote} ${item.amount}, `
            }
          }
        } else {
          if (!inventory[1].items.find(e => Object.keys(e)[0] === item.id)) {
            inventory[1].items.push({ [item.id]: item.amount })

            let emote = BotClass.client.emojis.cache.find(e => e.name === item.id)

            if (i === refundedItems.length) {
              text_refundedItems += `${emote} ${item.amount}`
            } else {
              text_refundedItems += `${emote} ${item.amount}, `
            }
          } else {
            inventory[1].items[item.placement][item.id] += item.amount

            let emote = BotClass.client.emojis.cache.find(e => e.name === item.id)

            if (i === refundedItems.length) {
              text_refundedItems += `${emote} ${item.amount}`
            } else {
              text_refundedItems += `${emote} ${item.amount}, `
            }
          }
        }
      })

      msg.inlineReply(Utils.createEmbed([
        [`You successfully broke ${amount} ${item_id}`, `You now have ${text_refundedItems}`]
      ]
      ))

      Utils.query(`UPDATE members SET inventory = '${JSON.stringify(inventory)}' WHERE member_id = ${msg.member.id}`)
    })
  },

  help: {
    enabled: true,
    title: 'Break',
    description: `Break a tool to convert it to some portion of its materials!\nUse comma (,) to seperate items`,
  }
}