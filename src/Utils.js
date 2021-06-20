const { Discord } = require('./BotClass');

module.exports = new class Utils {
  constructor() {

  }

  load() {
    // LOAD COMMANDS //

    const { readdirSync } = this.modules.fs;
    require('./BotClass').Commands = new (require('./BotClass')).Discord.Collection();

    readdirSync(`./commands`).filter(selected => !selected.endsWith(
      selected.split(".")[1]
    )).forEach(category => {

      readdirSync(`./commands/${category}`)
        .filter(selected => selected.endsWith('.js'))
        .forEach(commandFile => {
          const command = require(`${__dirname}\\commands\\${category}\\${commandFile}`);

          require('./BotClass').Commands.set(command.name, command);
        })
    })
    
    // LOAD EVENTS //
    readdirSync(`./events`)
      .filter(selected => selected.endsWith('.js'))
      .forEach(e => {
        require('./BotClass').client["on"]
          (this.strMods.getFileName(e),
            (...args) => {
              if (args[0].author.bot && args[0].author.bot === true) return
              require(`${__dirname}\\events\\${e}`).execute(...args);
            })
      })
  }

  db = {
    async query(sql, callback) {
      let con = require('./BotClass').dbConnect();
      let scnd_arg = arguments[1];

       con.query(sql, function (err, result, fields) {
        if (scnd_arg) {
          callback([result, fields, err]);
        } else { if (err) throw err }
      })
    }
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
      title: '',
      color: '',
      enableFooter: false
    })
      {
      let embed = new (require('./BotClass')).Discord.MessageEmbed()
      .setColor(process.env.EMBEDCOLOR);

      // options
      if (options.title) embed.setTitle(options.title)
      if (options.color) { 
        try {
          embed.setColor(options.color);
        } catch (err) {
          embed.setColor(process.env.EMBEDCOLOR)
        }
      }
      if (options.enableFooter == true) embed.setFooter('For more information, please use mc?help');

      // fields
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]

        embed.addField(field[0], field[1]);
      }

      return embed;
    }
  }

  moderation = {
    checkIfMod(member) {
      const staffPermissions = 
      [
        'KICK_MEMBERS', 
        'BAN_MEMBERS', 
        'MANAGE_CHANNELS', 
        'MANAGE_GUILD', 
        'MOVE_MEMBERS', 
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES'
      ];

      for (const perm of staffPermissions)
        if (msg.member.permissions.has(perm)) return true;
      return false;
    },

    checkIfAdmin(member) {
      if (msg.member.permissions.has("ADMINISTRATOR")) return true;
      return false;
    }
  }

  other = { 
    colors: {
      firstMemberRoleColor(member) { return member.roles.cache.first().color },
      firstMentionedMemberColor(member) { return member.roles.cache.first().color },
      botRoleColor(me) { return me.roles.cache.first() ? me.roles.cache.first().color : process.env.EMBEDCOLOR },
      randomColor() {
        let format = 'abcdef0123456789';
        let color = '#';

        for (let i = 0; i < 6; i++) 
          color += format[Math.floor(Math.random() * format.length) + 1];
        return color;
       }
    },

    command: {
      getName(filename, dirname) {
        const cmdName = filename.replace(dirname + '\\', '').split('.')[0];

        return cmdName;
      },

      getCategory(filename) {
        const cmdCategory = filename.split('\\')[filename.split('\\').length - 2];

        return cmdCategory;
      },

      getUsage(filename, dirname) {
        const cmdUsage = require('./config.json').defaultPrefix + filename.replace(dirname + '\\', '').split('.')[0] + ' ';

        return cmdUsage;
      }
    }
  }
}