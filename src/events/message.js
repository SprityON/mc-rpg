module.exports = {
  execute(msg) {
    require('../BotClass')
    .Commands.forEach(cmd => {

      let prefix;

      if (msg.content.includes(cmd.name) || msg.content.includes(cmd.aliases)) {
        require(`../commands/${cmd.category}/${cmd.name}`).execute(msg);
      }

    });
  }
}