const Bot = require('../Bot');
const DB = require('../classes/database/DB');
const Utils = require('../classes/utilities/Utils');

module.exports = {
  async execute(msg) {
    const command = msg.content.trim().split(/ +/)[0].toLowerCase();
    const args = msg.content.trim().split(/ +/).slice(1, msg.content.length);

    try {
      for (let cmd of Bot.Commands) {
        cmd = cmd[1]

        let alias

        if (cmd.aliases)
          cmd.aliases.forEach(a => {
            if (command.includes(a)) {
              if (command.indexOf(a) + 1 == command.length) {
                alias = a
              }
            }
          })

        if (command.includes(cmd.name) || alias) {
          const prefix = await DB.guild.getPrefix(msg.guild.id)

          if (!msg.content.startsWith(prefix)) return

          if (Bot.Commands.find(c => c.name === command.slice(prefix.length, command.length)))
            cmd = Bot.Commands.find(c => c.name === command.slice(prefix.length, command.length))

          const { readdirSync } = require('fs')

          let cmdFile
          try {
            cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);
          } catch (error) {
            return msg.inlineReply(Utils.createEmbed(
              [
                [`ERROR`, `Command \`${command}\` does not exist!`]
              ], { footer: true, status: 'error' }
            ))
          }

          let files = readdirSync(`./commands/${cmd.category}`)

          if (files.find(file => !file.endsWith('.js')) && cmdFile.handler) return cmdFile.execute(msg, args)

          Utils.commandCooldown.execute(msg.member, cmdFile).then(([onCooldown, seconds]) => {
            if (onCooldown)
              return msg.inlineReply(`You have to wait ${seconds} seconds before using this command again!`);

            let enoughPermissions = true;
            cmdFile.permissions.forEach(perm => {
              if (!msg.member.permissions.has(perm)) enoughPermissions = false;
            })

            enoughPermissions
              ? cmdFile.execute(msg, args)
              : msg.inlineReply(`**${msg.author.username}**, you do not have enough permissions to use this command!`)
          })

          return
        }
      }
    } catch (err) {
      if (err) console.log(err)

      msg.channel.send(Utils.createEmbed(
        [
          [`ERROR`, `Command \`${command}\` does not exist!`]
        ], { footer: true, status: 'error' }
      ))
    }
  }
}