const BotClass = require('./BotClass');

module.exports = class Utils {
  constructor() {
    
  }

  modules = {
    fs: require('fs'),
  }

  strMods = {

    /**
     * Returns the file name in the current directory for any given path
     * 
     * @param {String} path 
     * @returns 
     */

    getFileName(path) {
      let FileName;
      path.endsWith('.js')
        ? FileName = path.split("\\")[path.split('\\').length - 1].split(".")[0]
        : FileName = path.split("\\")[path.split('\\').length]

      return FileName;
    },

    /**
     * Create a custom embed with specified fields and options
     * 
     * @param {Array} fields
     * @param {Object} options 
     * @returns
     */

    createEmbed(fields, options = { 
      title,
      color,
      enableFooter
    }) 
      {
      let embed = new BotClass.Discord.MessageEmbed()
      .setColor(process.env.EMBEDCOLOR);

      // options
      if (options.color) embed.setColor(options.color);
      if (options.enableFooter == true) embed.setFooter('For more information, please use mc!help');
      if (options.title) embed.setTitle(options.title)

      // fields

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]

        embed.addField(field[0], field[1]);
      }

      // return
      return embed;
    }
  }

  load() {
    // LOAD COMMANDS //
    const { readdirSync } = this.modules.fs;
    BotClass.Commands = new BotClass.Discord.Collection()
    
    readdirSync(`./commands`).filter(selected => !selected.endsWith(
      selected.split(".")[1]
    )).forEach(category => {

      readdirSync(`./commands/${category}`)
      .filter(selected => selected.endsWith('.js'))
      .forEach(commandFile => {
        const command = require(`${__dirname}\\commands\\${category}\\${commandFile}`);

        BotClass.Commands.set(command.name, command);
        })
      }
    )

    // LOAD EVENTS //
    readdirSync(`./events`)
    .filter(selected => selected.endsWith('.js'))
    .forEach(e => {
      BotClass.client["on"]
      (this.strMods.getFileName(e),
      (...args) => {
        if (args[0].author.bot && args[0].author.bot === true) return
        require(`${__dirname}\\events\\${e}`).execute(...args);
      })
    })
  }

  moderation = {
    checkIfMod(member) {
      const staffPermissions = 
      ['KICK_MEMBERS', 'BAN_MEMBERS', 
      'MANAGE_CHANNELS', 'MANAGE_GUILD', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES'];

      let isStaff = false;
      for (const perm of staffPermissions) {
        if (msg.member.permissions.has(perm)) isStaff = true;
      }

      if (isStaff) { return true } else { return false };
    },

    checkIfAdmin(member) {
      if (msg.member.permissions.has("ADMINISTRATOR")) return true
    }
  }

  other = { 
    colors: {
      firstMemberRoleColor(member) { return member.roles.cache.first().color },
      firstMentionedMemberColor(member) { return member.roles.cache.first().color },
      botRoleColor(me) { return me.roles.cache.first() ? me.roles.cache.first().color : process.env.EMBEDCOLOR },
      randomColor() { var format, color
        format = 'abcdef0123456789';
        color = '#';

        for (let i = 0; i < 6; i++) 
          color += format[Math.floor(Math.random() * format.length) + 1];
        return color;
       }
    },

    command: {
      getName(filename, dirname) {
        const cmdName = filename.replace(dirname + '\\', '').split('.')[0]

        return cmdName
      },

      getCategory(filename) {
        const cmdCategory = filename.split('\\')[filename.split('\\').length - 2]

        return cmdCategory
      },

      getUsage(filename, dirname) {
        const cmdUsage = require('./config.json').defaultPrefix + filename.replace(dirname + '\\', '').split('.')[0] + ' ';

        return cmdUsage
      }
    }
  }
}