const Utils = require('../../Utils')
const BotClass = require('../../BotClass');

module.exports = {
  name: Utils.getCmdName(__filename, __dirname),
  category: Utils.getCmdCategory(__filename),
  usage: Utils.getCmdUsage(__filename, __dirname),
  aliases: [],

  execute(msg, args) {

    msg.channel.send(Utils.createEmbed(
      [
        []
      ], {
        title: "Create Rules", description: "Example of usage:\n\
        \"Rule title\", \"Rule description\"" 
      }
    ))

    const filter = m => m.author.id === msg.author.id;

    let embed = new BotClass.Discord.MessageEmbed()
    .setColor(Utils.botRoleColor())
    .setTitle(`Rules of ${msg.guild.name}`);
    let secondField = false

    let times = 0;
    let oneMessageCheck = 0;

    createMessage()

    function messageLoop(loopFromError) {
      createMessage(loopFromError);
    }

    function createMessage(loopFromError) {
      times++
      oneMessageCheck++
      console.log(oneMessageCheck)
      if (oneMessageCheck === 1) {
        setTimeout(() => {
          if (!loopFromError) {
            msg.channel.send(Utils.createEmbed(
              [
                [`STATE RULE #**${times}**`, `*Type something in (which is formatted)\n\nOR type one of the following:*\n**done** : create your embed\n**cancel** : cancel creation of embed`]
              ]
            ))
          } else {
            msg.channel.send(`State your rule`)
          }
        }, 1000);


        msg.channel.awaitMessages(filter, { timeout: 300000, max: 1 })
          .then(collected => {

            secondField = false
            // if user cancels
            if (collected.first().content.toLowerCase() === 'cancel') {

              return msg.channel.send(
                Utils.createEmbed(
                  [
                    [`Cancelled for **${msg.author.username}**`, `No rules were created.`]
                  ]
                ))
            } else if (collected.first().content.toLowerCase() === 'done') {
              if (embed.fields.length == 0) {
                msg.channel.send(
                  Utils.createEmbed(
                    [
                      [`Cancelled for **${msg.author.username}**`, `No rules were created.`]
                    ]
                  ))

                return
              }
              return msg.channel.send(embed);
            } else if (!collected.first().content.startsWith('"') || !collected.first().content.endsWith('"')) {
              msg.channel.send(Utils.createEmbed(
                [
                  [`ERROR`, `Your message has to start with:\nan opening quotation mark \`"\` and another quotation mark to end it`]
                ], { status: 'error' }
              ))

              times--
              return messageLoop(true);
            }

            // make the embed fields

            let field1 = '';
            let field2 = '';

            let canContinue = true
            for (i = 0; i < collected.first().content.length; i++) {
              canContinue = true

              let prevChar;
              if (i > 0) prevChar = collected.first().content.charAt(i - 1);
              let char = collected.first().content.charAt(i);

              if (char === '[' || char === ']') canContinue = false;
              if (char === ' ' && prevChar === ',') canContinue = false;

              if (canContinue === true) {
                if (char === ',' && prevChar === '"' && i > 1) if (!secondField) {
                  secondField = true
                  continue
                } else {
                  msg.channel.send(`Can't have more then two fields!`);
                  return messageLoop();
                }

                if (char !== '"')
                  secondField ? field2 += char : field1 += char;
              }

              field1.replace('"', "")
              field2.replace('"', "")
            }

            embed.setAuthor(`Owner: ${msg.guild.owner.user.username}#${msg.guild.owner.user.discriminator}`, msg.guild.owner.user.avatarURL())
            embed.addField(`#${times} ` + field1, field2, true);
            oneMessageCheck--

            return messageLoop()
          })
        }
      }
  },

  help: {
    enabled: true,
    title: '',
    description: ``,
    permissions: ['SEND_MESSAGS', 'ADMINISTRATOR']
  }
}