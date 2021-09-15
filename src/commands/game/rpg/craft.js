const Bot = require('../../../Bot')
const Player = require('../../../classes/game/Player')
const Utils = require("../../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: '<item_id> <amount>',
  aliases: ['c'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  async execute(msg, args) {
    const player = new Player(msg.member.id)
    const inventory = await player.inventory
    
    if (!args[0]) return msg.inlineReply(Utils.createEmbed(
      [
        [`NO ARGUMENTS`, `You have put no arguments!`]
      ], { status: 'error' }
    ))

    let itemToCraft = args[0].toLowerCase()
    let amount
    if (!isNaN(args[0])) {
      amount = args[0]
      itemToCraft = args[1]
    } else {
      !args[1]
        ? amount = 1
        : amount = args[1]
      itemToCraft = args[0]
    }

    if (amount < 0) return msg.inlineReply(Utils.createEmbed(
      [
        []
      ], { title: `Haha. Very funny.` }
    ))

    if (isNaN(amount)) return msg.inlineReply(Utils.createEmbed(
      [
        [`WRONG USAGE`, `\`${amount}\` is not a number!`]
      ], { status: 'error' }
    ))

    let allJSON = require('./items/items.json').concat(require('./tools/tools.json'))
    let item = allJSON.find(item => item.id === itemToCraft)
    if (!item) return msg.inlineReply(Utils.createEmbed(
      [
        [`ITEM NOT FOUND`, `That item does not exist!`]
      ], { status: 'error' }
    ))

    if (!item.craftable) return msg.inlineReply(Utils.createEmbed(
      [
        [`CANNOT CRAFT`, `This item cannot be crafted!`]
      ], { status: 'error' }
    ))

    let userRecipeItems = []

    for (let recipe of item.recipe) {
      for (let i = 0; i < inventory[1].items.length; i++) {

        if (Object.keys(recipe)[0] === Object.keys(inventory[1].items[i])[0]) {
          let recipeAmount = Object.values(recipe)[0] * amount

          if (recipeAmount > Object.values(inventory[1].items[i])[0]) return msg.inlineReply(Utils.createEmbed(
            [
              [`CANNOT CRAFT`, `You do not have enough materials to craft this item!`]
            ], { status: 'error' }
          ))

          userRecipeItems.push({ id: Object.keys(inventory[1].items[i])[0], hasAmount: Object.values(inventory[1].items[i])[0], neededAmount: recipeAmount })
        }
      }
    }

    let canCraft = true
    item.recipe.forEach(recipe => {
      if (!userRecipeItems.find(userRecipe => userRecipe.id === Object.keys(recipe)[0]))
        canCraft = false;
    })

    if (!canCraft) return msg.inlineReply(Utils.createEmbed(
      [
        [`CANNOT CRAFT`, `You do not have all the needed materials to craft this item!`]
      ], { status: 'error' }
    ))

    let lostItems = ''
    let lostItemsAmount = 0
    userRecipeItems.forEach(recipe => {
      lostItemsAmount++
      for (let i = 0; i < inventory[1].items.length; i++) {
        let invItem = inventory[1].items[i]

        if (Object.keys(invItem)[0] === recipe.id) {
          inventory[1].items[i][recipe.id] -= recipe.neededAmount

          let alt_text = `${inventory[1].items[i][recipe.id]}`
          if (inventory[1].items[i][recipe.id] <= 0) (inventory[1].items.splice(i, 1), alt_text = '0')

          let emote = Bot.client.emojis.cache.find(e => e.name === recipe.id)

          if (lostItemsAmount == userRecipeItems.length) lostItems += `${emote} ${alt_text}`
          if (lostItemsAmount < userRecipeItems.length) lostItems += `${emote} ${alt_text}, `
        }
      }
    })

    let craftedItemEmote = Bot.client.emojis.cache.find(e => e.name === item.id)

    let craftedItem
    if (item.category === 'tools') {

      for (let i = 0; i < amount; i++) {
        craftedItem = {
          [item.id]: 1,
          currentDurability: item.maxDurability,
          maxDurability: item.maxDurability,
          code: Utils.createToolCode(inventory[1])
        }
        inventory[1].tools.push(craftedItem)
      }

      Utils.query(`UPDATE members SET inventory = '${JSON.stringify(inventory)}' WHERE member_id = ${msg.member.id}`);

      msg.inlineReply(Utils.createEmbed(
        [
          [`CRAFTING COMPLETE`, `You now have **${lostItems}** and **${craftedItemEmote} ${amount * item.craftedAmount}**`]
        ]
      ))

      msg.inlineReply(`Do you want to equip this tool? **(y/n)**`)

      let filter = m => m.author.id === msg.author.id
      msg.channel.awaitMessages(filter, { time: 30000, max: 1 }).then(collected => {
        if (collected.first().content.toLowerCase() === 'y') {

          const item = allJSON.find(item => item.id === itemToCraft)

          if (item.usedFor.includes('lumber')) {
            msg.inlineReply(`Do you want to use this item to \`lumber\`, \`fight\`, or \`both\`? Or \`cancel\``)

            const filter = m => m.author.id === msg.author.id
            msg.channel.awaitMessages(filter, { max: 1, time: 30000 }).then(collected => {
              switch (collected.first().content.toLowerCase()) {
                case 'lumber':
                  Utils.query(`UPDATE members SET lumbering_item = '{"id": "${itemToCraft}", "code": "${craftedItem.code}"}' WHERE member_id = ${msg.member.id}`)
                  sendMessage()
                  break;

                case 'fight':
                  Utils.query(`UPDATE members SET battle_item = '{"id": "${itemToCraft}", "code": "${craftedItem.code}"}' WHERE member_id = ${msg.member.id}`)
                  sendMessage()
                  break;

                case 'both':
                  Utils.query(`UPDATE members SET battle_item = '{"id": "${itemToCraft}", "code": "${craftedItem.code}"}', lumbering_item = '{"id": "${itemToCraft}", "code": "${craftedItem.code}"}' WHERE member_id = ${msg.member.id}`)
                  sendMessage()
                  break;

                case 'cancel':
                  msg.channel.send(`Tool was not equipped.`)
                  break;

                default:
                  return msg.inlineReply(Utils.createEmbed([
                    [`WRONG ARGUMENTS`, `That was not an option!`]
                  ], { status: 'error' }))
              }
            }).catch(err => {
              console.log(err)
            })
          } else if (item.usedFor.includes('mining')) {
            Utils.query(`UPDATE members SET mining_item = '{"id": "${itemToCraft}", "code": "${craftedItem.code}"}' WHERE member_id = ${msg.member.id}`)
            sendMessage()
          } else if (item.usedFor.includes('combat')) {
            Utils.query(`UPDATE members SET battle_item = '{"id": "${itemToCraft}", "code": "${craftedItem.code}"}' WHERE member_id = ${msg.member.id}`)
            sendMessage()
          }

          function sendMessage() {
            const emote = Bot.client.emojis.cache.find(e => e.name === itemToCraft)
            msg.inlineReply(Utils.createEmbed([
              [`TOOL EQUIPPED`, `Your ${emote} tool has been equipped!`]
            ]))
          }
        } else return msg.inlineReply(`Tool was not equipped!`)
      }).catch(err => {
        console.log(err)
        return msg.inlineReply(`Tool was not equipped!`)
      })
    } else if (item.category === 'item') {
      let foundItem = inventory[1].items.find(item2 => Object.keys(item2)[0] === item.id)

      if (!foundItem) {
        inventory[1].items.push({ [item.id]: amount * item.craftedAmount })
      } else {
        for (let i = 0; i < inventory[1].items.length; i++) {
          if (inventory[1].items[i][item.id])
            inventory[1].items[i][item.id] += amount * item.craftedAmount
        }
      }
    }
  },

  help: {
    enabled: true,
    title: 'Craft an item!',
    description: `No description.`
  }
}