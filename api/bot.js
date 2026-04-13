const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk');

bot.start((ctx) => {
  const name = ctx.from.first_name || "Bro";
  return ctx.reply(`Welcome ${name}! 🚀\nEasy TON မှာ Mining လုပ်ဖို့ အောက်ကခလုတ်ကို နှိပ်လိုက်ပါဗျ။`, 
    Markup.inlineKeyboard([
      [Markup.button.webApp('🎮 Open Mining App', 'https://easy-ton-app-iota.vercel.app/')]
    ])
  );
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error');
    }
  } else {
    res.status(200).send('Bot logic is running...');
  }
};
