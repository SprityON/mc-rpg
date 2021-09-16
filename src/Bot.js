const DB = require('./classes/database/DB');
const Utils = require('./classes/utilities/Utils');

require('dotenv').config();

module.exports = new class Bot {
	constructor() {
		this.Discord = require('discord.js');
		this.Commands = new this.Discord.Collection(); 

		this.client = new this.Discord.Client({ allowedMentions: { repliedUser: false } });
		this.run(this.client);
	}

	/**
	 * @description
	 * Logs the bot in, meanwhile also loading every command and event.
	 */

	run(client) {
		require("./classes/other/replyInline")
		client.login(process.env.TOKEN);
		client.once('ready', this.ready.bind(this, client))
			.on('guildCreate', this.guildCreate.bind(this))
			.on('guildDelete', this.guildDelete.bind(this))
	}

	ready(client) {
		console.log(`Ready as ${client.user.tag}!\n`)

		client.user.setActivity(`${client.guilds.cache.size} servers`, { type: 'WATCHING' })
		
		Utils.load();
	}

	guildCreate(guild) {
		guild.channels.cache.find(channel => channel.id === guild.channels.cache.filter(chan => chan.name.includes('welcome')).first().id).send(
			Utils.createEmbed([
				['Thanks for adding me to your server!', 
				'Want to change some settings? Use `mc?help`']
			]))
				
		return DB.query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${guild.id}', '${require('./config.json').defaultPrefix}')`);
	}

	guildDelete(guild) {
		DB.query(`DELETE FROM guilds WHERE guild_id = ${guild.id}`);
	}
}