module.exports = {
  execute(msg, args) {
    require('../BotClass')
    .Commands.forEach(cmd => {

      if (msg.content.includes(cmd.info.name)) {
        console.log(cmd.info.name);
      }

    });
  }
}