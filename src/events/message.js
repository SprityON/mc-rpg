const Utils = require('../Utils');
const BotClass = require('../BotClass');

module.exports = {
  async execute(msg) {
      const command = msg.content.trim().split(/ +/)[0].toLowerCase();
      const args = msg.content.trim().split(/ +/).slice(1, msg.content.length);

      try {
        let i = 0

        for (let cmd of BotClass.Commands) {
          cmd = cmd[1]

          let alias

          cmd.aliases.forEach(a => {
            if (command.includes(a)) {
              if (command.indexOf(a) + 1 == command.length) {
                alias = a
              }
            }
          })

          if (command.includes(cmd.name) || alias) {
            guild_id = msg.guild.id

            cmd.usage(guild_id, prefix => {
              let cmd = Array.from(BotClass.Commands)[i][1]

              if (!command.startsWith(prefix)) return

              if (BotClass.Commands.find(c => c.name === command.slice(prefix.length, command.length))) 
                cmd = BotClass.Commands.find(c => c.name === command.slice(prefix.length, command.length))

              const { readdirSync } = Utils.modules.fs

              let cmdFile

              try {
                cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);
              } catch (error) {
                var text;
                text = `Command \`${command}\` does not exist!`

                return msg.inlineReply(Utils.createEmbed(
                  [
                    [`ERROR`, `${text}`]
                  ], { footer: true, status: 'error' }
                ))
              }

              let files = readdirSync(`./commands/${cmd.category}`)

              if (files.find(file => !file.endsWith('.js')) && cmdFile.handler) return cmdFile.execute(msg, args)

              Utils.commandCooldown.execute(msg.member, cmdFile).then(([onCooldown, seconds]) => {
                if (onCooldown) {
                  return msg.inlineReply(`You have to wait ${seconds} seconds before using this command again!`);
                }

                let enoughPermissions = true;
                cmdFile.permissions.forEach(perm => {
                  if (!msg.member.permissions.has(perm)) enoughPermissions = false;
                })

                enoughPermissions
                  ? cmdFile.execute(msg, args)
                  : msg.inlineReply(`**${msg.author.username}**, you do not have enough permissions to use this command!`)
              })
            })

            return
          }
          i++
        }
      } catch (err) {
        if (err) console.log(err)

        var text;
        command ? text = `Command \`${command}\` does not exist!` : text = `Well that is obviously no command XD`

        msg.channel.send(Utils.createEmbed(
          [
            [`ERROR`, `${text}`]
          ], { footer: true, status: 'error' }
        ))
      }
  }
}