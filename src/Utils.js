module.exports = class Utils {

  /* STARTUP METHODS AND PROPERTIES */

  static load() {
    const BotClass = require('./BotClass');
    const { readdirSync, lstatSync } = require('fs');

    readdirSync(`./commands`).filter(selected => !selected.endsWith(
      selected.split(".")[1]
    )).forEach(category => {

      readdirSync(`./commands/${category}`)
      .forEach(commandFile => {
        let command = require(`./commands/${category}/${commandFile}`);

        // if the command is in another folder
        if (lstatSync(`./commands/${category}/${commandFile}`).isDirectory()) {
          readdirSync(`./commands/${category}/${commandFile}`)
            .forEach(commandFile2 => {
              if (commandFile2.endsWith('.js')) {
                command = require(`./commands/${category}/${commandFile}/${commandFile2}`)
                BotClass.Commands.set(command.name, command);
              }
          })
        } else BotClass.Commands.set(command.name, command);

      })
    })

    readdirSync(`./events`)
      .filter(selected => selected.endsWith('.js'))
      .forEach(e => {

        BotClass.client["on"]
          (Utils.getFileName(e),
            (...args) => {
              if (args[0].author.bot && args[0].author.bot === true) return
              require(`./events/${e}`).execute(...args);
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
    const pool = this.dbConnect();
    let usingCallback = arguments[1];
    
    if (Array.isArray(bindings)) {
      usingCallback = arguments[2]
    } else { callback = bindings; bindings = [] }

    pool.getConnection((err, conn) => {
      if (err) {
        console.error(err);
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
    const Utils = this

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
      ? fileName = path.split(process.env.SPLITTER)[path.split(process.env.SPLITTER).length - 1].split(".")[0]
      : fileName = path.split(process.env.SPLITTER)[path.split(process.env.SPLITTER).length]

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
    const cmdName = filename.replace(dirname + process.env.SPLITTER, '').split('.')[0];

    return cmdName;
  }

  static getCmdCategory(filename) {
    const cmdCategory = filename.split(process.env.SPLITTER)[filename.split(process.env.SPLITTER).length - 2];

    return cmdCategory;
  }

  static getCmdUsage(filename, dirname) {
    const cmdUsage = require('./config.json').defaultPrefix + filename.replace(dirname + process.env.SPLITTER, '').split('.')[0] + ' ';

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

  static checkIfCodeExists(toolCode, inventory) {
    if (inventory.tools.find(item => Object.values(item)[0] === toolCode)) return createToolCode()

    return toolCode
  }

  static createToolCode(inventory) {
    let toolCode = Math.floor(Math.random() * 8999) + 1000

    return this.checkIfCodeExists(toolCode, inventory)
  }

  static embedList({
    title,
    type,
    selectQuery,
    JSONlist,
    member,
    currPage,
    showAmountOfItems,
    filter
  }, callback) {
    const Utils = this
    const BotClass = require('./BotClass');

      switch (type) {
        case 'inventory':
          Utils.query(selectQuery, async result => {
            let inventory = JSON.parse(result[0][0].inventory);

            // the amount of items which are currently shown in one page
            let pageItemsAmount = 0;

            // all items that the user has in their inventory
            let totalItemsAmount = 0;

            let text = '';

            let i = 0;
            let testI = 0;

            //let emeraldEmote = BotClass.client.emojis.cache.find(e => e.name === 'emerald');
            let embed = new BotClass.Discord.MessageEmbed()
              .setColor(process.env.EMBEDCOLOR)
              .setDescription(title.toString())

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

            let allJSON = JSONlist;

            if (filter && isNaN(filter)) {
              try {
                allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
              } catch (error) {
                filter = '';
              }
            }

            if (!filter) filter = `items or tools`

            let item = inventory.splice(1, 2)[0]

            let foundItems = []

            if (filter == 'tools') {

              for (let i of allJSON) {

                for (let o of item.tools) {
                  if (i.id === Object.keys(o)[0]) {
                    for (let e = 0; e < Object.values(o)[0]; e++) {
                      foundItems.push({
                        id: i.id, name: i.name, amount: Object.values(o)[0], amountText: ``,
                        category: i.category,
                        currentDurability: Object.values(o)[1],
                        maxDurability: Object.values(o)[2],
                        code: Object.values(o)[3]
                      })
                    }
                  }
                }
              }
            }

            else if (filter == 'items') {

              for (let i of allJSON) {

                for (let o of item.items) {
                  if (i.id === Object.keys(o)[0]) {
                    foundItems.push({
                      id: i.id, name: i.name, amount: Object.values(o)[0],
                      category: i.category,
                      currentDurability: Object.values(o)[1],
                      maxDurability: Object.values(o)[2]
                    })
                  }
                }
              }
            } else {
              for (let i of allJSON) {

                for (let o of item.items.concat(item.tools)) {
                  if (i.id === Object.keys(o)[0]) {
                    if(i.category === 'tools') {
                      for (let e = 0; e < Object.values(o)[0]; e++) {
                        foundItems.push({
                          id: i.id, name: i.name, amount: Object.values(o)[0], amountText: ``,
                          category: i.category,
                          currentDurability: Object.values(o)[1],
                          maxDurability: Object.values(o)[2],
                          code: Object.values(o)[3]
                        })
                      }
                    } else {
                      foundItems.push({
                        id: i.id, name: i.name, amount: Object.values(o)[0], amountText: ` ▬${Object.values(o)[0]}`,
                        category: i.category,
                        currentDurability: Object.values(o)[1],
                        maxDurability: Object.values(o)[2]
                      })
                    }
                  }
                }
              }
            }

            if (!foundItems || foundItems.length < 1) return callback(Utils.createEmbed(
              [
                [`INVENTORY EMPTY`, `You do not have any ${filter} in your inventory!`]
              ], { status: 'error' }
            ))

            let totalItemsAmountIndividual = 0
            let Continue = true

            const progressBar = require('string-progressbar');
            if (foundItems) {
              for (let foundItem of foundItems) {
                let total
                let current
                let durabilityBar = ``
                let code = ``

                if (foundItem.category === 'tools') {
                  total = foundItem.maxDurability
                  current = foundItem.currentDurability
                  durabilityBar += `*Durability: ${progressBar.filledBar(total, current, 5)[0]}*\n`
                  code = ` | \`${foundItem.code}\``
                }

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
                    text += `${emote} **${foundItem.name}${foundItem.amountText}**\n${durabilityBar}*ID* \`${foundItem.id}\`${code}\n\n`

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
        break;

        case 'craftables':
          (function () {
            if (filter) callback(member.lastMessage.inlineReply(`There can be no filters!`))
            let pageItemsAmount = 0;
            let totalItemsAmount = 0;

            let text = '';

            let i = 0;
            let testI = 0;

            let embed = new BotClass.Discord.MessageEmbed()
              .setColor(process.env.EMBEDCOLOR)

            if (!currPage) currPage = 1;

            if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

            let allJSON = JSONlist;

            if (filter && isNaN(filter)) {
              try {
                allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
              } catch (error) {
                filter = '';
              }
            }

            let Continue = true
            for (let item of allJSON) {
              let recipeText = ''

              let counter = 1
              item.recipe.forEach(material => {
                let emote = BotClass.client.emojis.cache.find(e => e.name === Object.keys(material)[0]);

                counter === item.recipe.length
                  ? recipeText += `${emote} ${Object.values(material)[0]}`
                  : recipeText += `${emote} ${Object.values(material)[0]}, `
                
                counter++
              })

              totalItemsAmount++

              if (Continue == true) {
                let emote = BotClass.client.emojis.cache.find(e => e.name === item.id);

                if (testI !== i) { testI++ } else {
                  pageItemsAmount++

                  if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

                  text += `${emote} **${item.name}**\n\
                *You need:* ${recipeText}\n\
        *ID* \`${item.id}\`\n\n`

                  testI++
                  i++

                }
              }
            }

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

            embed.setDescription(`${title.toString()} ──── **Page ${currPage}/${lastPage}**\n\n${text}`)
              .setFooter(`To craft, do: rpg craft <id>`)

            callback(embed)
          })()
          
        break;

        case 'shop':
          (function() {
            let pageItemsAmount = 0;
            let totalItemsAmount = 0;

            let text = '';

            let i = 0;
            let testI = 0;

            let embed = new BotClass.Discord.MessageEmbed()
              .setColor(process.env.EMBEDCOLOR)

            if (!currPage) currPage = 1;

            if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

            let allJSON = JSONlist;

            if (filter && isNaN(filter)) {
              try {
                allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
              } catch (error) {
                filter = '';
              }
            }

            let Continue = true

            let emeraldEmote = BotClass.client.emojis.cache.find(e => e.name === 'emerald')
            for (let item of allJSON) {

              totalItemsAmount++

              if (Continue == true) {
                if (testI !== i) { testI++ } else {
                  pageItemsAmount++

                  if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

                  const emote = BotClass.client.emojis.cache.find(e => e.name === item.emoji)

                  text += `${emote} **${item.name}**\n\
                  ${item.description}\n\n**Price:** ${emeraldEmote} ${item.price}\n\n─────────\n\n`

                  testI++
                  i++

                }
              }
            }

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

            embed.setDescription(`${title.toString()}\n\n${text}`)
              .setFooter(`Page ${currPage}/${lastPage}`)

            callback(embed)
          })()
        break;
      
        default:
          let pageItemsAmount = 0;
          let totalItemsAmount = 0;

          let text = '';

          let i = 0;
          let testI = 0;

          let embed = new BotClass.Discord.MessageEmbed()
            .setColor(process.env.EMBEDCOLOR)

          if (!currPage) currPage = 1;

          if (currPage > 1) { i = (currPage * showAmountOfItems) - showAmountOfItems }

          let allJSON = JSONlist;

          if (filter && isNaN(filter)) {
            try {
              allJSON = Array.from(require(`./commands/game/rpg/${filter}/${filter}.json`));
            } catch (error) {
              filter = '';
            }
          }

          let Continue = true
          for (let item of allJSON) {

            totalItemsAmount++

            if (Continue == true) {
              if (testI !== i) { testI++ } else {
                pageItemsAmount++

                if (pageItemsAmount > showAmountOfItems) { Continue = false; continue; }

                text += `**${item}**`

                testI++
                i++

              }
            }
          }

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

          embed.setDescription(`${title.toString()} ──── **Page ${currPage}/${lastPage}**\n\n${text}`)
            .setFooter(`For more information, use the help command`)

          callback(embed)
        break;
      }
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