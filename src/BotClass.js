require('dotenv').config();
const { db: { query } } = require('./Utils');

module.exports = new class BotClass {
	constructor() {
		this.Discord = require('discord.js');
		this.client = new this.Discord.Client();

		this.run(this.client);
	}

	/**
	 * @description
	 * Logs the bot in, meanwhile also loading every command and event.
	 */

	run(bot) {
		bot.login(process.env.TOKEN);
		bot.on('ready', this.ready.bind(this, bot))
			.on('guildCreate', this.guildCreate.bind(this))
			.on('guildDelete', this.guildDelete.bind(this))
	}

	async ready(bot) {
		console.log(`Ready as ${bot.user.tag}!\n`)
		await require('./Utils').load();
	}

	guildCreate(guild) {
		guild.channels.cache.find(channel => channel.id === guild.channels.cache.filter(chan => chan.type === 'text').first().id).send(
			require('./Utils')
				.strMods.createEmbed([
					['Thanks for adding me to your server!', 'Want to change some settings? Use `mc!help`']
				], { color: require('./Utils').other.colors.botRoleColor }
				))

			query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${guild.id}', '${require('./config.json').defaultPrefix}')`);
		return;
	}

	guildDelete(guild) {
		query(`DELETE FROM guilds WHERE guild_id = ${guild.id}`);
	}

	dbConnect() {	
		const mysql = require('mysql')
		var con = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: "mc_rpg",
			connectTimeout: 30000
		})

		return con
	}
}