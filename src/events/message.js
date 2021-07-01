const Utils = require('../Utils');
const BotClass = require('../BotClass');

module.exports = {
  async execute(msg) {
    await Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, async result => {
      if (!result[0] || !result[0][0])
        return Utils.query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${msg.guild.id}', '${require('../config.json').defaultPrefix}')`);

      const prefix = result[0][0].prefix;
      if (!msg.content.toLowerCase().startsWith(prefix)) return

      const command = msg.content.trim().split(/ +/)[0].slice(prefix.length, msg.content.trim().split(/ +/)[0].length).toLowerCase();
      const args = msg.content.trim().split(/ +/).slice(1, msg.content.length);

      try {
        for (let cmd of BotClass.Commands) {
          cmd = cmd[1]

          if (cmd.name === command || cmd.aliases.includes(command)) {
            const cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);

            const files = Utils.modules.fs.readdirSync(`./commands/${cmd.category}`)
            
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
          } 
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
    })
  }
}