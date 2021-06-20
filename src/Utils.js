const BotClass = require('./BotClass');

module.exports = class Utils {
  constructor() {}

  modules = {
    fs: require('fs'),
  }

  strMods = {
    getFileName(path) {
      let FileName;
      path.endsWith('.js')
        ? FileName = path.split("\\")[path.split('\\').length - 1].split(".")[0]
        : FileName = path.split("\\")[path.split('\\').length]

      return FileName;
    },
  }

  load() {
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

  other = { 
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
        const cmdUsage = require('./config.json').defaultPrefix + filename.replace(dirname + '\\', '').split('.')[0]

        return cmdUsage
      }
    }
  }
}