const BotClass = require('./BotClass');

module.exports = class Utils {

  /* STARTUP METHODS AND PROPERTIES */

  static load() {
    const BotClass = require('./BotClass');
    const { readdirSync } = require('fs');

    readdirSync(`./commands`).filter(selected => !selected.endsWith(
      selected.split(".")[1]
    )).forEach(category => {

      readdirSync(`./commands/${category}`)
        .filter(selected => selected.endsWith('.js'))
        .forEach(commandFile => {
          const command = require(`${__dirname}\\commands\\${category}\\${commandFile}`);

          BotClass.Commands.set(command.name, command);
        })
    })

    readdirSync(`./events`)
      .filter(selected => selected.endsWith('.js'))
      .forEach(e => {

        BotClass.client["on"]
          (Utils.getFileName(e),
            (...args) => {
              if (args[0].author.bot && args[0].author.bot === true) return
              require(`${__dirname}\\events\\${e}`).execute(...args);
            })
      })
  }

  static modules = {
    fs: require('fs'),
  }

  /* DB METHODS */

  static dbConnect() {
    return require('mysql').createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: "mc_rpg",
      connectTimeout: 30000
    })
  }

  static async query(sql, callback) {
    let con = require('./Utils').dbConnect();
    let scnd_arg = arguments[1];

      con.query(sql, function (err, result, fields) {
      if (scnd_arg) {
        callback([result, fields, err]);
      } else { if (err) throw err }
    })
  }

  /* UTILITY METHODS */

  /**
   * Create a custom embed with specified fields and options
   * 
   * @param {Array} fields 
   * @param {Object} options
   * @returns
   */

  static createEmbed(fields, settings = {
    title: '',
    description: '',
    color: '',
    status: '',
    footer: false
  }) {
    const BotClass = require('./BotClass');
    const Utils = require('./Utils')

    let embed = new BotClass.Discord.MessageEmbed()
      .setColor(Utils.botRoleColor());

    const colors = [{
      'error': 'ff0000'
    }];

    // options
    if (settings.title) embed.setTitle(settings.title) 
    if (settings.description) embed.setDescription(settings.description)
    if (settings.color) embed.setColor(settings.color) 
    if (settings.status) {

      let embedColor;
      for (const color of colors) 
        if (settings.status.includes(Object.keys(color))) embedColor = Object.values(color).toString();

      embedColor
      ? embed.setColor(embedColor)
      : embed.setColor(Utils.botRoleColor())

    }
    if (settings.footer == true) embed.setFooter('For more information, please use the help command');
    if (!fields[0] || fields[0].length == 0) {
      if (settings.title || settings.description) 
        return embed
      throw new Error("Embed needs to have at least a title, description or two fields.")
    }

    // fields
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      
      if (field[2]) throw new Error("Cannot add more then two fields")

      if (i === 0 && settings.status) {
        embed.addField('STATUS: ' + settings.status.toUpperCase(), field[1]);
        continue;
      } 

      embed.addField(field[0], field[1]);
    }

    return embed;
  }

  /**
   * Returns the file name in the current directory for any given path
   * 
   * @param {String} path 
   * @returns 
   */

  static getFileName(path) {
    let fileName;
    path.endsWith('.js')
      ? fileName = path.split("\\")[path.split('\\').length - 1].split(".")[0]
      : fileName = path.split("\\")[path.split('\\').length]

    return fileName;
  }

  static firstMemberRoleColor(member) { 
    return member.roles.cache.first().color 
  }

  static firstMentionedMemberColor(member) {
    return member.roles.cache.first().color 
  }

  static botRoleColor() {
    const me = require('./BotClass').client.guilds.cache.first().me
    return me.roles.cache.first() ? me.roles.cache.first().color : process.env.EMBEDCOLOR 
  }

  static randomColor() {
    let format = 'abcdef0123456789';
    let color = '#';

    for (let i = 0; i < 6; i++) 
      color += format[Math.floor(Math.random() * format.length) + 1];
    return color;
  }

  static getCmdName(filename, dirname) {
    const cmdName = filename.replace(dirname + '\\', '').split('.')[0];

    return cmdName;
  }

  static getCmdCategory(filename) {
    const cmdCategory = filename.split('\\')[filename.split('\\').length - 2];

    return cmdCategory;
  }

  static getCmdUsage(filename, dirname) {
    const cmdUsage = require('./config.json').defaultPrefix + filename.replace(dirname + '\\', '').split('.')[0] + ' ';

    return cmdUsage;
  }
}