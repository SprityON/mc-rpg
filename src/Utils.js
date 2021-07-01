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
    return require('mysql').createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: "mc_rpg",
      debug: false
    })
  }

  static async query(sql, bindings, callback) {
    const pool = require('./Utils').dbConnect();
    let usingCallback = arguments[1];
    
    if (Array.isArray(bindings)) {
      usingCallback = arguments[2]
    } else { callback = bindings; bindings = [] }

    pool.getConnection((err, conn) => {
      if (err) {
        console.error(`Query Error`, err);
      } else {
        conn.query(sql, bindings, function (err, result, fields) {
          if (err) throw err
          if (usingCallback) {
            callback([result, fields, err]);
          }
        })

        conn.release();
      }
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
    thumbnail: '',
    footer: false,
    setFooter: ''
  }) {
    const BotClass = require('./BotClass');
    const Utils = require('./Utils')

    let embed = new BotClass.Discord.MessageEmbed()
      .setColor(Utils.botRoleColor());

    const colors = [
      { 'error': 'ff0000' },
      { 'success': '00ff00' }
    ];  

    if (settings) {
      if (settings.setFooter) embed.setFooter(settings.setFooter)
      if (settings.title) embed.setTitle(settings.title) 
      if (settings.description) embed.setDescription(settings.description)
      if (settings.color) embed.setColor(settings.color) 
      if (settings.status) {
        for (const color of colors) 
          if (settings.status.includes(Object.keys(color))) 
            embed.setColor(Object.values(color).toString());
      }
      if (settings.thumbnail) {
        embed.setThumbnail()
      }
      if (settings.footer == true) embed.setFooter('For more information, please use the help command');
      if (!fields[0] || fields[0].length == 0) {
        if (settings.title || settings.description)
          return embed
        throw new Error("Embed needs to have at least a title, description or two fields.")
      }
    }

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      
      if (field[2]) throw new Error("Cannot add more then two fields")

      if (i === 0 && settings.status) {
        embed.addField('STATUS: ' + field[0], field[1]);
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

  static emeraldAmount(emeralds) {
    if (emeralds !== 0) {
      if (emeralds < 0.1) { emeralds = emeralds.toFixed(3) } else
      if (emeralds < 10) { emeralds = emeralds.toFixed(2) } else 
      if (emeralds < 1000) { emeralds = emeralds.toFixed(1) } else emeralds = emeralds.toFixed(0)
    }
    return emeralds
  }

  static embedInventoryList({
    member,
    currPage,
    showAmountOfItems,
    filter
  }, callback ) {
    const Utils = require('./Utils');

    Utils.query(`SELECT * FROM members WHERE member_id = ${member.id}`, async result => {
      const inventory = JSON.parse(result[0][0].inventory);

      let emeraldAmount = Utils.emeraldAmount(inventory[0]['emerald'])

      const BotClass = require('./BotClass');

      // the amount of items which are currently shown in one page
      let pageItemsAmount = 0;

      // all items that the user has in their inventory
      let totalItemsAmount = 0;

      let text = '';

      let i = 0;
      let testI = 0;

      let emeraldEmote = BotClass.client.emojis.cache.find(e => e.name === 'emerald');
      let embed = new BotClass.Discord.MessageEmbed()
        .setColor(process.env.EMBEDCOLOR)
        .setDescription(`**𝗜𝗡𝗩𝗘𝗡𝗧𝗢𝗥𝗬 ───────────── ${emeraldEmote} ${emeraldAmount}**`)

      // if the currentpage (which the user chooses) is higher then 1, then in the i var, multiply the currpage by the amount of items and - the amount of items 
      // say for example a user wants to see page 3 with 5 items:
      /*
      i = (3 * 5 = 15) - 5 = 10
  
      why -5? because we have to start showing items at i = 10 until i = 14
      because:
      page 1 = items 0 to 4
      page 2 = items 5 to 9
      page 3 = items 10 to 14
      */

      if (!currPage) currPage = 1;

      if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }
      
      let listJSON = []
      listJSON.push(require(`./commands/game/rpg/items/items.json`));
      listJSON.push(require(`./commands/game/rpg/tools/tools.json`));

      let allJSON = listJSON;

      if (filter && isNaN(filter)) {
        try {
          allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
        } catch (error) {
          filter = '';
        }
      }

      let item = inventory.splice(1, 2)[0]

      let foundItems = []
        
      if (filter == 'tools') {

        for (let i of allJSON) {

          for (let o of item.tools) {
            if (i.id === Object.keys(o)[0]) {
              foundItems.push({ id: i.id, name: i.name, amount: Object.values(o)[0] })
            }
          }
        }
      } 

      else if (filter == 'items') {

        for (let i of allJSON) {

          for (let o of item.items) {
            if (i.id === Object.keys(o)[0]) {
              foundItems.push({ id: i.id, name: i.name, amount: Object.values(o)[0] })
            }
          }
        }
      } else {
        allJSON = allJSON[0].concat(allJSON[1])

        for (let i of allJSON) {

          for (let o of item.items.concat(item.tools)) {
            if (i.id === Object.keys(o)[0]) {
              foundItems.push({ id: i.id, name: i.name, amount: Object.values(o)[0] })
            }
          }
        }
      }

      if (!foundItems || foundItems.length < 1) callback(Utils.createEmbed(
        [
          [`INVENTORY EMPTY`, `You do not have any ${filter} in your inventory!`]
        ], { status: 'error' }
      ))

      let totalItemsAmountIndividual = 0
      let Continue = true
      if (foundItems) {
        for (let foundItem of foundItems) {
          totalItemsAmount++
          totalItemsAmountIndividual += foundItem.amount

          if (Continue == true) {
            let emote = BotClass.client.emojis.cache.find(e => e.name === foundItem.id);

            /* testI will check if this variable is the same as i
            *  if it is not the same, then the user wants to see another page
            *  so it will increment until it coincides with the page that the user wants
            * (example of usage: mc?rpg inv 2) where 2 is the page that the user wants */
            if (testI !== i) { testI++ } else {
              pageItemsAmount++

              if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

              text += `${emote} **${foundItem.name} ▬** ${foundItem.amount}\n\
          *ID* \`${foundItem.id}\`\n\n`

              testI++
              i++
              
            }
          }
        }
      }

      // calculate last page by dividing the total amount of items by the amount of items that will be shown in 1 page (which in this case is 5)

      let lastPage;
      let totalItemsAmount_temp = totalItemsAmount / showAmountOfItems;
      totalItemsAmount_temp < 1 ? lastPage = 1 : lastPage = Math.ceil(totalItemsAmount_temp);

      if (currPage > lastPage) {
        if (lastPage == 1) {
          return callback(`**${member.user.username}**, there is only 1 page!`);
        } else {
          return callback(`**${member.user.username}**, there are only ${lastPage} pages!`);
        }
      }

      embed.addField(`${totalItemsAmountIndividual} items total`, text)
        .setFooter(`Filtering: rpg inventory (tools/items) | Page ${currPage} of ${lastPage}`)

      callback(embed)
    })
  }
  
  static commandCooldown = { 
    cooldownSet: new Set(),
    async execute(member, command) {
      let thisUserInSet = false
      const userObj = { id: member.id, command: command, timeout: Date.now() + command.timeout }
      
      for (const user of this.cooldownSet) {

        if (user.id === member.id) {
          if (command.name === user.command.name) {
            thisUserInSet = true

            if (user.timeout < Date.now()) {
              this.cooldownSet.delete(user)

              thisUserInSet = false
            } else {
              let seconds = Math.floor((user.timeout - Date.now()) / 1000)
              return [true, seconds]
            }
          }
        }
      }

      if (!thisUserInSet) {
        this.cooldownSet.add(userObj)
        return [false]
      }
    }
  }
}