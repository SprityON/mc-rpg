const Bot = require('../../Bot')
const Utils = require("../../classes/utilities/Utils")

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage(guild_id, callback) {
    Utils.getCmdUsage(__filename, __dirname, data => {
      callback(data)
    }, guild_id)
  },
  aliases: [],
  permissions: ['SEND_MESSAGES'],
  timeout: 1000,

  execute(msg, args) {
    const { readdirSync, lstatSync } = Utils.modules.fs

    let categories = require(`../categories.json`)
    const commandCategoryFolders = readdirSync('commands').filter(file => !file.includes('.'))
    let embed = new Bot.Discord.MessageEmbed()
    if (!args[0]) {
        embed.setTitle(`Commands`)
        .setFooter(`For more specific information: help (category/command)`)

      let num = 0
      commandCategoryFolders.forEach(f => {
        num++

        categories.forEach(c => {
          if (f == c.category) {
            let emote = c.emote
            if (!c.emote.includes(':')) emote = Bot.client.emojis.cache.find(e => e.name === c.emote)
            embed.addField(`${emote} ${c.title.charAt(0).toUpperCase() + c.title.slice(1)}`, `\`${c.usage}\``, true)
          }
        })
      });

      let extraFields = 0

      let alt_num = num
      for (i = 0; i < num; i++) {
        let check = alt_num / 3
        if (check.toString().startsWith(Math.floor(check) + '.')) {
          extraFields++
          alt_num++
        } else {
          for (let i = 0; i < extraFields; i++) {
            embed.addField(`\u200b`, `\u200b`, true)
          }
          break
        }
      }

      msg.channel.send(embed)
      return
    } else if (args[0]) {
      let text = ''
      let isCategory = false
      for (const cat of categories) {
        if (cat.category == args[0]) 
          isCategory = true
      }

      if (isCategory) {
        embed.setTitle(`${args[0].slice(0,1).toUpperCase() + args[0].slice(1,args[0].length)} Commands`)

        let i = 1
        const files = readdirSync(`commands/${args[0]}`)

        for (const file of files) {
          if (lstatSync(`commands/${args[0]}/${file}`).isDirectory()) {
            const commands = readdirSync(`commands/${args[0]}/${file}`).filter(file => file.endsWith('.js'))

            commands.forEach(cmd => {
              let command = require(`../${args[0]}/${file}/${cmd}`)
              if (!command.handler && command.help.enabled === true) {
                cmd = cmd.slice(0, -3)

                i === commands.length
                  ? text += `\`${cmd}\``
                  : text += `\`${cmd}\`, `
              }
              i++
            })


            break
          } else {
            i === files.length
              ? text += `\`${file.slice(0, -3)}\``
              : text += `\`${file.slice(0, -3)}\`, `
          }

          i++
        }

        embed.setDescription(text)
        msg.channel.send(embed)
      } else {
        const command = Bot.Commands.find(cmd => cmd.name === args[0])

        if (!command.help.enabled) return

        let aliases = ''
        let i = 0
        command.aliases.forEach(alias => {
          i++
          i === command.aliases.length
            ? aliases += `${alias}`
            : aliases += `${alias}, `
          
        })

        if (!aliases) aliases = 'no aliases'

        let permissions = ''
        i = 0
        command.permissions.forEach(perm => {
          i++
          i === command.permissions.length
            ? permissions += `${perm}`
            : permissions += `${perm}, `

        })

        command.usage(msg.guild.id, prefix => {

          embed.setDescription(`**${prefix}help ${command.help.title||'no title'}**`)
            .addField(`Description`, `${command.help.description||'no description'}`)
            .addField(`Usage`, `\`${prefix}${command.name||'no usage'}\``)
            .addField(`Aliases`, `${aliases||'no alias'}`)
            .addField(`Cooldown`, `${command.timeout / 1000}s`)
            .addField(`Permissions`, `\`\`\`${permissions}\`\`\``)

          msg.channel.send(embed)
        })
      }
    }
  },

  help: {
    enabled: true,
    title: 'Help',
    description: `See a list of all commands.`,
  }
}