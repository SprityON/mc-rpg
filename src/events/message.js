const Utils = require('../Utils');
const BotClass = require('../BotClass');

module.exports = {
  execute(msg) {
    Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, result => {
      if (!result[0][0])
          return Utils.query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${msg.guild.id}', '${require('../config.json').defaultPrefix}')`);

      const prefix = result[0][0].prefix;

      const args = msg.content.trim().split(/ +/).splice(1,1)
      const command = msg.content.trim().split(/ +/)[0].slice(prefix.length, msg.content.trim().split(/ +/)[0].length).toLowerCase();

      if (!msg.content.toLowerCase().startsWith(prefix)) return

      try {
        for (let cmd of BotClass.Commands) {
          cmd = cmd[1]

          if (cmd.name === command || cmd.aliases.includes(command)) {
            const cmdFile = require(`../commands/${cmd.category}/${cmd.name}`);

            let enoughPermissions = true;
            cmdFile.help.permissions.forEach(perm => {
              if (!msg.member.permissions.has(perm)) enoughPermissions = false;
            })

            if (enoughPermissions) {
              return cmdFile.execute(msg, args);
            } else {
              return msg.channel.send(`**${msg.author.username}**, you do not have enough permissions to use this command!`);
            }
          }
        }

        throw [null, 'Error message.js [line 24]: Command not found.'];
      } catch ([err, message]) {
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