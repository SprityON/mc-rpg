const Utils = require('../../Utils')

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: ['r'],
  permissions: ['SEND_MESSAGES'],
  timeout: 0,
  handler: true,

  execute(msg, args) {
    Utils.query(`SELECT prefix FROM guilds WHERE guild_id = ${msg.guild.id}`, data => {
      Utils.query(`SELECT * FROM members WHERE member_id = ${msg.member.id}`, member => {
        
        const prefix = data[0][0].prefix;

        if (!member[0][0]) return msg.inlineReply(
          Utils.createEmbed(
          [
            [`ERROR`, `You don't have an account!\nCreate one by using command: \`${prefix}rpg create\``]
          ], { status: 'error' }
        ))

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

          let cmdFile = require(`./rpg/${command}`)

          Utils.commandCooldown.execute(msg.member, cmdFile).then(([onCooldown, seconds]) => {
            args.shift();

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
        } catch (err) {
          console.log(err);

          return msg.channel.send(
            Utils.createEmbed(
              [
                [`ERROR`, `\`${command}\` is not a command!`]
              ], { status: 'error' }
            ))
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