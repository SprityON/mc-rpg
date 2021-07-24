require('dotenv').config();

const Utils = require('./Utils');

module.exports = new class BotClass {
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

	run(bot) {
		require("./replyInline")
		bot.login(process.env.TOKEN);
		bot.on('ready', this.ready.bind(this, bot))
			.on('guildCreate', this.guildCreate.bind(this))
			.on('guildDelete', this.guildDelete.bind(this))
	}

	async ready(bot) {
		console.log(`Ready as ${bot.user.tag}!\n`)

		bot.user.setActivity('mc?help', { type: 'LISTENING' })
		
		Utils.load();
	}

	guildCreate(guild) {
		guild.channels.cache.find(channel => channel.id === guild.channels.cache.filter(chan => chan.type === 'text').first().id).send(
			Utils
				.createEmbed(
				[
					['Thanks for adding me to your server!', 'Want to change some settings? Use `mc!help`']
				], { color: Utils.botRoleColor(guild) }
				))
				
			return Utils.query(`INSERT INTO guilds (guild_id, prefix) VALUES ('${guild.id}', '${require('./config.json').defaultPrefix}')`);
	}

	guildDelete(guild) {
		Utils.query(`DELETE FROM guilds WHERE guild_id = ${guild.id}`);
	}
}