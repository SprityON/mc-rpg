const BotClass = require('../../../BotClass')
const Utils = require('../../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['c'],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    Utils.query(`SELECT inventory FROM members WHERE member_id = ${msg.member.id}`, data => {
      let inventory = JSON.parse(data[0][0].inventory)

      if (!args[0]) return msg.inlineReply(Utils.createEmbed(
        [
          [`NO ARGUMENTS`,`You have put no arguments!`]
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
          [`WRONG USAGE`,`\`${amount}\` is not a number!`]
        ], { status: 'error' }
      ))
//
      console.log(args)

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
            if (inventory[1].items[i][recipe.id] <= 0) (inventory[1].items.splice(i,1), alt_text = '0')

            let emote = BotClass.client.emojis.cache.find(e => e.name === recipe.id)
            
            if (lostItemsAmount == userRecipeItems.length) lostItems += `${emote} ${alt_text}`
            if (lostItemsAmount < userRecipeItems.length) lostItems += `${emote} ${alt_text}, `
          }
        }
      })

      let craftedItemEmote = BotClass.client.emojis.cache.find(e => e.name === item.id)

      if (item.category === 'tools') {

        for (let i = 0; i < amount; i++) {
          inventory[1].tools.push({
            [item.id]: 1,
            currentDurability: item.maxDurability,
            maxDurability: item.maxDurability,
            code: Utils.createToolCode(inventory[1])
          })
        }
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

      Utils.query(`UPDATE members SET inventory = '${JSON.stringify(inventory)}' WHERE member_id = ${msg.member.id}`);
      
      msg.inlineReply(Utils.createEmbed(
        [
          [`CRAFTING COMPLETE`, `You now have **${lostItems}** and **${craftedItemEmote} ${amount * item.craftedAmount}**`]
        ]
      ))
    })
  },

  help: {
    enabled: true,
    title: 'Craft an item!',
    description: `No description.`
  }
}