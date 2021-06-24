const Utils = require('../Utils');
const BotClass = require('../BotClass');

module.exports = {
  execute(msg) {
    Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, async result => {
      if (!result[0][0])
          return Utils.query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${msg.guild.id}', '${require('../config.json').defaultPrefix}')`);

      const prefix = result[0][0].prefix;

      if (!msg.content.toLowerCase().startsWith(prefix)) return

      msg.channel.startTyping();

      const command = msg.content.trim().split(/ +/)[0].slice(prefix.length, msg.content.trim().split(/ +/)[0].length).toLowerCase();
      const args = msg.content.trim().split(/ +/).slice(1, msg.content.length);

      try {
        for (let cmd of BotClass.Commands) {
          cmd = cmd[1]

          if (cmd.name === command || cmd.aliases.includes(command)) {
            const cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);

            let enoughPermissions = true;
            cmdFile.permissions.forEach(perm => {
              if (!msg.member.permissions.has(perm)) enoughPermissions = false;
            })

            enoughPermissions 
            ? await cmdFile.execute(msg, args) 
            : msg.inlineReply(`**${msg.author.username}**, you do not have enough permissions to use this command!`)

            return msg.channel.stopTyping();
          } 
        }

        throw new Error(`Command ${command} does not exist`);

      } catch (err) {
        if (err) console.log(err)

        var text;
        command ? text = `Command \`${command}\` does not exist!` : text = `Well that is obviously no command XD`

        msg.channel.send(Utils.createEmbed(
          [
            [`ERROR`, `${text}`]
          ], { footer: true, status: 'error' }
        ))

        msg.channel.stopTyping();
      }
    })
  }
}