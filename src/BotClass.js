require('dotenv').config();

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
		.on('guildCreate', this.guildCreate.bind(this, bot))
	}

	async ready(bot) {
		console.log(`Ready as ${bot.user.tag}!\n`)
		await (new (require('./Utils'))).load();
	}

	guildCreate(guild) {
		guild.channels.cache.firstKey().send(
			(new (require('./Utils')))
			.strMods.createEmbed([
				['Thanks for adding me in your server!', 'Want to change some settings? Use `mc!help`']
			])
		);
	}
}