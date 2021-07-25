const BotClass = require('../../BotClass')
const Utils = require('../../Utils')

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
    let embed = new BotClass.Discord.MessageEmbed()
    if (!args[0]) {
        embed.setTitle(`Commands`)
        .setFooter(`For more specific information: help (category/command)`)

      let num = 0
      commandCategoryFolders.forEach(f => {
        num++

        categories.forEach(c => {
          if (f == c.category) {
            let emote = c.emote
            if (!c.emote.includes(':')) emote = BotClass.client.emojis.cache.find(e => e.name === c.emote)
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
              if (!command.handler) {
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
              ? text += `\`${file}\``
              : text += `\`${file}\`, `
          }

          i++
        }

        embed.setDescription(text)
        msg.channel.send(embed)
      } else {
        const command = BotClass.Commands.find(cmd => cmd.name === args[0])

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

        Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, result => {
          const prefix = Object.values(result[0][0])[0]
          
          embed.setTitle(`help ${command.name}`)
            .addField(`Description`, `${command.help.description}`)
            .addField(`Usage`, `\`${prefix}${command.usage.trim().slice(3, command.usage.length)}\``)
            .addField(`Aliases`, `${aliases}`)
            .addField(`Cooldown`, `${command.timeout / 1000}s`)
            .addField(`Permissions`, `${permissions}`)

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