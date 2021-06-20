module.exports = {
  execute(msg) {
    require('../BotClass')
    .Commands.forEach(cmd => {

      if (msg.content.includes(cmd.name)) {
        require(`../commands/${cmd.category}/${cmd.name}`).execute(msg);
      }

    });
  }
}