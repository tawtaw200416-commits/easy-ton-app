const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk');

bot.start((ctx) => {
  const name = ctx.from.first_name || "User";
  // စာသားကို English လို ပြောင်းထားပါတယ်
  return ctx.reply(`Welcome ${name}! 🚀\nStart mining and earn TON rewards easily. Click the button below to begin!`, 
    Markup.inlineKeyboard([
      // ခလုတ်စာသားကို Open Easy Play လို့ ပြောင်းထားပါတယ်
      [Markup.button.webApp('🎮 Open Easy Play', 'https://easy-ton-app-iota.vercel.app/')]
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
    res.status(200).send('Bot logic is active.');
  }
};
