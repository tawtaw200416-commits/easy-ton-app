const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk');

bot.start((ctx) => {
  // အပေါ်ကစာသားကို Bro လိုချင်တဲ့အတိုင်း ပြောင်းထားပါတယ်
  const message = `💸 You Can Find TON Of Them Easily ✅`;
  
  return ctx.reply(message, 
    Markup.inlineKeyboard([
      // ခလုတ်စာသားကို Open-Easy-TON လို့ ပြောင်းထားပါတယ်
      [Markup.button.webApp('🎮 Open-Easy-TON', 'https://easy-ton-app-iota.vercel.app/')]
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
    res.status(200).send('Bot is active and ready.');
  }
};
