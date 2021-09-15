const Bot = require('../../../Bot')
const Utils = require("../../../classes/utilities/Utils")
const disbut = require('discord-buttons')
const Player = require('../../../classes/game/Player')
const DB = require('../../../classes/database/DB')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: ['m'],
  permissions: ['SEND_MESSAGES'],
  timeout: 30000,

  async execute(msg, args) {
    const player = new Player(msg.member.id)
    const inventory = await player.inventory
    const pickaxe = await player.pickaxe

    const embedColor = '#b8b8b8';

    if (!pickaxe) return msg.inlineReply(Utils.createEmbed(
      [
        [`NO PICKAXE EQUIPPED`, `Buy or equip a pickaxe to be able to mine.`]
      ], { color: embedColor }
    ))

    const emote_pickaxe = Bot.client.emojis.cache.find(e => e.name === pickaxe.id);

    let mined = [];

    const itemJSON = require('./items/items.json');
    const toolsJSON = require('./tools/tools.json')

    const rarity = [
      { "rarity": "common", "chance": 8500, amountMultiplier: 1 },
      { "rarity": "uncommon", "chance": 6000, amountMultiplier: 0.7 },
      { "rarity": "rare", "chance": 2500, amountMultiplier: 0.4 },
      { "rarity": "very rare", "chance": 1000, amountMultiplier: 0.3 },
      { "rarity": "epic", "chance": 300, amountMultiplier: 0.3 },
      { "rarity": "legendary", "chance": 25, amountMultiplier: 0.1 },
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
      ], { description: `${emote_pickaxe} **${await player.name}** went mining`, color: embedColor }
    ))

    let embed = new Bot.Discord.MessageEmbed()
      .setDescription(`${emote_pickaxe} **${await player.name}** went mining`)
      .setColor(embedColor)

    let embedReceivedItemsText = ''
    let embedTriedMiningFailed = ''

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
      let emote = Bot.client.emojis.cache.find(e => e.name === res.id)

      notMined.length - 1 <= 1 || i == notMined.length - 1
        ? embedTriedMiningFailed += `${emote} **${res.amount}**`
        : embedTriedMiningFailed += `${emote} **${res.amount}**, `

      i++
    }

    i = 1
    let broken_pickaxe_text = ''
    mined.forEach(res => {
      let emote = Bot.client.emojis.cache.find(e => e.name === res.id)

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
                if (inventory[1].tools[ii][pickaxe.id] && inventory[1].tools[ii].code == pickaxe.code) {
                  newInventory[1].tools[ii].currentDurability -= res.amount

                  if (newInventory[1].tools[ii].currentDurability < 0) {
                    broken_pickaxe_text += `\n\n**AW MAN...**\nYour ${emote_pickaxe} Pickaxe broke!`
                    JSON.stringify(pickaxe) = ``
                    return newInventory[1].tools.splice(ii, 1)
                  }
                }
              }
            }

            if (newInventory[1].items[f][res.id])
              newInventory[1].items[f][res.id] += res.amount
          }
        } else return newInventory[1].items.push({ [res.id]: res.amount });
      }
    })

    embedTriedMiningFailed
      ? embed.addField(`YOU GOT`, `${embedReceivedItemsText}\n\nYou tried mining ${embedTriedMiningFailed} but couldn't!\nTry upgrading your pickaxe.${broken_pickaxe_text}`)
      : embed.addField(`YOU GOT`, `${embedReceivedItemsText}${broken_pickaxe_text}`)

    // [{ "emerald": 0}, {"tools": [{"fists": 1}], "items": [{"cobblestone": 1}] }]

    msg.channel.send(embed)
    function win(msg, content, mob) {

      let embed = new Bot.Discord.MessageEmbed()
        .setAuthor(`You killed a ${mob.name}!`, msg.author.avatarURL({ dynamic: true }))
        .attachFiles([`./classes/game/mobs/overworld/hostile/img/${mob.name.toLowerCase()}.png`])
        .setThumbnail(`attachment://${mob.name.toLowerCase()}.png`)
        .addField(`YOU GOT`, content)
        .setColor(`00ff00`)
      msg.channel.send(embed)
    }

    function loss(msg, inventory, mob) {
      let random = Math.floor(Math.random() * inventory[1].items.length)
      let foundItems = []
      let text = ''

      for (let i = 0; i < random; i++) {
        function getRandomItem(foundItems, inventory) {
          let random = Math.floor(Math.random() * inventory[1].items.length)
          if (foundItems.find(item => item === random)) return repeat1(foundItems, inventory)
          return random
        }

        function repeat1(foundItems, inventory) {
          return getRandomItem(foundItems, inventory)
        }

        let randomItem = getRandomItem(foundItems, inventory)
        foundItems.push(randomItem)
        let item = inventory[1].items[randomItem]

        function lost() {
          let r = Math.floor(Math.random() * 10) + 1
          if (r <= Object.values(inventory[1].items[randomItem])) { return r } else return repeat()
        }

        function repeat() {
          return lost()
        }

        let lostAmount = lost()

        let emoji = Bot.client.emojis.cache.find(e => e.name === Object.keys(item)[0])

        if (!((i + 1) / 3).toString().includes('.')) {
          text += `${emoji} ${lostAmount}\n`
        } else {
          i === random - 1
            ? text += `${emoji} ${lostAmount}`
            : text += `${emoji} ${lostAmount}, `
        }

        inventory[1].items[randomItem][itemJSON.find(i => i.id === Object.keys(item)[0]).id] -= lostAmount
        if (inventory[1].items[randomItem][itemJSON.find(i => i.id === Object.keys(item)[0]).id] < 1)
          inventory[1].items.splice(randomItem, 1)
      }

      if (!text) text = 'Nothing!'

      msg.inlineReply(Utils.createEmbed([
        []
      ], { title: `${mob.attacks[0].text} and you lost:`, description: `**${text}**`, color: 'ff0000' }))

      return inventory
    }

    let weapon = await player.weapon
    let random = Math.floor(Math.random() * 10) + 1
    if (random <= 10) {
      const hostileMobs = require('../../../classes/game/mobs/overworld/hostile/hostile_mobs.json')
      const selectedMob = hostileMobs[Math.floor(Math.random() * hostileMobs.length - 1) + 1]
      
      let mobHealth = selectedMob.hp

      let embed = new Bot.Discord.MessageEmbed()
        .setColor('#ff0000').setAuthor(`${await player.name} encountered a ${selectedMob.name}`, msg.author.avatarURL({ dynamic: true }))

      let types = [
        "text",
        "battle"
      ]

      const randomType = 'battle'//types[Math.floor(Math.random() * (types.length - 0.01))]

      switch (randomType) {
        case 'text':
          let randomText = selectedMob.texts[Math.floor(Math.random() * selectedMob.texts.length - 1) + 1]
          embed.setDescription(`***Quick!** Type in: \n\`${randomText}\`*`)
            .addField(`Time`, `\n${(randomText.length * 0.3).toFixed(1)}s`, true)
            .addField(`HP`, `${selectedMob.hp}/${selectedMob.hp}`, true)
            .addField(`Actions`, `\`run\``, true)
            .attachFiles([`./commands/game/rpg/mobs/overworld/hostile/img/${selectedMob.name.toLowerCase()}.png`])
            .setThumbnail(`attachment://${selectedMob.name.toLowerCase()}.png`)

          doDamage()

          function repeat() {
            return doDamage()
          }

          function doDamage() {

            let filter = m => m.author.id === msg.author.id
            msg.channel.awaitMessages(filter, { max: 1, time: (randomText.length * 0.3) * 1000 }).then(collected => {
              const userInput = collected.first().content.toLowerCase()

              if (userInput == 'run') {
                random = Math.floor(Math.random() * 4) + 1
                if (random == 4) {
                  newInventory = loss(msg, newInventory, selectedMob)
                  return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
                } else return collected.first().inlineReply(`You successfully ran away from a **${selectedMob.name}**`)
              }

              else if (userInput != randomText.toLowerCase()) {
                newInventory = loss(msg, newInventory, selectedMob)
                return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
              }

              else {
                let damageDone

                weapon.id
                  ? (mobHealth -= toolsJSON.find(tool => tool.id === weapon.id).combat.damage,
                    damageDone = toolsJSON.find(tool => tool.id === weapon.id).combat.damage)
                  : (mobHealth -= 1,
                    damageDone = 1)

                embed.setAuthor(`You did ${damageDone} damage!`, msg.author.avatarURL({ dynamic: true }))
                  .spliceFields(0, 3)

                if (mobHealth <= 0) {
                  let text = ''

                  let i = 0
                  selectedMob.drops.forEach(drop => {
                    const random = Math.floor(Math.random() * 10000) + 1

                    if (random <= drop.chance) {
                      let dropAmount = Math.floor(Math.random() * drop.maxAmount) + 1
                      let emote = Bot.client.emojis.cache.find(e => e.name === drop.id)

                      selectedMob.drops.length == i + 1
                        ? (text += `${emote} ${dropAmount}`)
                        : (text += `${emote} ${dropAmount}, `)
                    }

                    i++
                  })

                  !text
                    ? win(collected.first(), 'Nothing...', selectedMob)
                    : win(collected.first(), text, selectedMob)

                  return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
                } else {
                  randomText = selectedMob.texts[Math.floor(Math.random() * selectedMob.texts.length - 1) + 1]
                  embed.setDescription(`***Quick!*** *Type in:*\n\`${randomText}\``)
                    .addField(`Time`, `\n${(randomText.length * 0.3).toFixed(1)}s`, true)
                    .addField(`HP`, `${mobHealth}/${selectedMob.hp}`, true)
                    .addField(`Actions`, `\`run\``, true)
                  msg.channel.send(embed)
                  return repeat()
                }
              }
            }).catch(collected => {
              if (collected instanceof Error) throw collected

              newInventory = loss(msg, newInventory, selectedMob)
              return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
            })
          }

          break;

        case 'battle':
          let playerHealth = await player.health
          embed.setDescription(`***Quick!** Type in: \`attack\` or \`run\`*`)
            .addField(`Time left`, `\n10 seconds`, true)
            .addField(`HP`, `${selectedMob.hp}/${selectedMob.hp}`, true)
            .addField(`Damage`, `\n${selectedMob.attack}`, true)
            .attachFiles([`./classes/game/mobs/overworld/hostile/img/${selectedMob.name.toLowerCase()}.png`])
            .setThumbnail(`attachment://${selectedMob.name.toLowerCase()}.png`)

          msg.channel.send(embed)

          doDamage()

          function repeat() {
            return doDamage()
          }

          function doDamage() {
            const filter = m => m.author.id === msg.author.id
            msg.channel.awaitMessages(filter, { time: 10000, max: 1 }).then(collected => {
              const userInput = collected.first().content.toLowerCase()
              if (userInput === 'run') {
                random = Math.floor(Math.random() * 4)
                if (random == 3) {
                  newInventory = loss(msg, newInventory, selectedMob)
                  return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
                } else return collected.first().inlineReply(`You successfully ran away from a **${selectedMob.name}**`)
              }

              else if (userInput === 'attack') {
                let damageDone
                (mobHealth -= player.attack, damageDone = player.attack)

                let damageTaken
                (playerHealth -= selectedMob.attack, damageTaken = selectedMob.attack)

                embed.setAuthor(`You did ${damageDone} damage!`, msg.author.avatarURL({ dynamic: true }))
                  .spliceFields(0, 3)
                  .setColor('#ffff00')

                if (player.health <= 0) {
                  newInventory = loss(msg, newInventory, selectedMob)
                  return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
                }

                else if (mobHealth <= 0) {
                  let text = ''

                  let i = 0
                  selectedMob.drops.forEach(drop => {
                    const random = Math.floor(Math.random() * 10000) + 1

                    if (random <= drop.chance) {
                      let dropAmount = Math.floor(Math.random() * drop.maxAmount) + 1
                      let emote = Bot.client.emojis.cache.find(e => e.name === drop.id)

                      selectedMob.drops.length == i + 1
                        ? text += `${emote} ${dropAmount}`
                        : text += `${emote} ${dropAmount}, `
                    }

                    i++
                  })

                  !text
                    ? win(collected.first(), 'Nothing...', selectedMob)
                    : win(collected.first(), text, selectedMob)

                  return DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
                } else {
                embed.addField(`Time left`, `\n10 seconds`, true)
                .addField(`HP`, `${mobHealth}/${selectedMob.hp}`, true)
                .addField(`Damage`, `\n${selectedMob.attack}`, true)
                .attachFiles([`./classes/game/mobs/overworld/hostile/img/${selectedMob.name.toLowerCase()}.png`])
                .setThumbnail(`attachment://${selectedMob.name.toLowerCase()}.png`)
                  msg.inlineReply(embed)
                  return repeat()
                }
              }
            }).catch(collected => {
              if (collected instanceof Error) throw collected
            })
          }

          break;
      }
    } else DB.query(`UPDATE members SET inventory = '${JSON.stringify(newInventory)}', pickaxe = '${JSON.stringify(pickaxe)}' WHERE member_id = ${msg.member.id}`);
  },

  help: {
    enabled: true,
    title: '[mine](https://www.youtube.com/watch?v=dgha9S39Y6M)',
    description: `Mining is essential to upgrade one's own gear.\nThe rarer the item, the lesser you get!`
  }
}