const { db: { query }, strMods: { createEmbed } } = require('../Utils');
const BotClass = require('../BotClass');

module.exports = {
  execute(msg) {
    query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, result => {
      if (!result[0][0]) return msg.channel.send(`Something went wrong... please try again.`)
      .then(
        query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${msg.guild.id}', '${require('../config.json').defaultPrefix}')`)
      );

      const prefix = result[0][0].prefix;

      const args = msg.content.trim().split(/ +/).splice(1,1)
      const command = msg.content.trim().split(/ +/)[0].slice(prefix.length, msg.content.trim().split(/ +/)[0].length).toLowerCase();

      try {
        for (let cmd of BotClass.Commands) {
          cmd = cmd[1]

          if (cmd.name === command || cmd.aliases.includes(command)) {
            return require(`../commands/${cmd.category}/${cmd.name}`).execute(msg, args);
          }
        }
      } catch (error) {
        var text;
        command ? text = `Command \`${command}\` does not exist!` : text = `Well that is obviously no command XD`

        msg.channel.send(createEmbed(
          [
            [`ERROR`, `${text}`]
          ], { enableFooter: true }
        ))
      }
    })
  }
}