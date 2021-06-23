const Utils = require('../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: [],
  permissions: ['SEND_MESSAGES'],

  execute(msg, args) {
    Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, result => {
      Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, ([row]) => {
        const prefix = row[0].prefix;

        if (!args[0]) return msg.channel.send(
          Utils.createEmbed(
          [
            [`ERROR`,
              `That is not a command!\n\
              Use \`${prefix}help\` for more information`]
          ], { status: 'error' }
        ))

        let command = args[0]

        try {
          const files = Utils.modules.fs.readdirSync(`${__dirname}/rpg`).filter(file => file.endsWith('.js'));

          for (let file of files) {
            const cmdAliases = require(`./rpg/${file}`);

            if (cmdAliases.aliases.includes(command))
              command = cmdAliases.name;
          }

          require(`./rpg/${command}`).execute(msg, args);
        } catch (err) {
          console.log(err);

          return msg.channel.send(
            Utils.createEmbed(
              [
                [`ERROR`, `\`${command}\` is not a command!`]
              ], { status: 'error' }
            )
          )
        }
      })

    })
  },

  help: {
    enabled: false,
    title: '',
    description: ``
  }
}