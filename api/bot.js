const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf('8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk');

bot.start((ctx) => {
  return ctx.reply('💸 You Can Find TON Of Them Easily ✅', 
    Markup.inlineKeyboard([
      [Markup.button.webApp('🎮 Open-Easy-TON', 'https://easy-ton-app-iota.vercel.app/')]
    ])
  );
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } else {
    res.status(200).send('Bot is running...');
  }
};
