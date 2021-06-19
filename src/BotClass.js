require('dotenv').config();

module.exports = new class BotClass {
	constructor() {
		this.botName = __filename.split("\\")[__filename.split('\\').length - 2];
		this.Discord = require('discord.js');
		this.client = new this.Discord.Client();
		this.Utils = new (require('./Utils'));
		this.run(this.client);
	}

	/**
	 * @description
	 * Logs in the bot, meanwhile also loading every command and event.
	 */

	run(bot) {
		bot.login(process.env.TOKEN);
		bot.on('ready', this.ready.bind(this, bot))
	}

	async ready(bot) {
		console.log(`Ready as ${bot.user.tag}!\n`)
		
		await this.loadCmdsAndEvents()
	}

	loadCmdsAndEvents() {
		const { fs: { readdirSync }, getFileName } = new (require('./Utils'));

		// LOAD COMMANDS //
		readdirSync(`./commands`).filter(selected => !selected.endsWith(
			selected.split(".")[1]
		)).forEach(category => {

			readdirSync(`./commands/${category}`)
			.filter(selected => selected.endsWith('.js'))
			.forEach(commandFile => {
				const command = require(`${__dirname}\\commands\\${category}\\${commandFile}`);

				this.Commands = new this.Discord.Collection()
					.set(command.info.name, command);
			})
		})

		// LOAD EVENTS //
		readdirSync(`./events`)
		.filter(selected => selected.endsWith('.js'))
		.forEach(e => {
			this.client["on"]
			(getFileName(e),
			(...args) => {
				if (args[0].author.bot && args[0].author.bot === true) return
				require(`${__dirname}\\events\\${e}`).execute(...args);
			})
		})
	}
}