import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2", 
  REWARD_AMT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);

  // --- Task ဆွဲတဲ့အပိုင်း (Admin တင်တာနဲ့ တန်းပေါ်အောင်) ---
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
      const data = await res.json();
      if (data) {
        setCustomTasks(Object.values(data));
      }
    } catch (e) { console.error("Task load error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // --- Adsgram Logic (Ads တက်အောင် သေချာပြင်ထားတာ) ---
  const runWithAd = (callback, forceShow = false) => {
    if (isAdLoading) return;

    if (!window.Adsgram) {
      alert("Adsgram SDK loading... Please wait.");
      return;
    }

    const AdController = window.Adsgram.init({ 
      blockId: APP_CONFIG.ADSGRAM_BLOCK_ID,
      debug: false // တကယ်စမ်းသပ်ချင်ရင် true ပြောင်းကြည့်ပါ
    });

    setIsAdLoading(true);
    AdController.show()
      .then(() => {
        setIsAdLoading(false);
        callback();
      })
      .catch((err) => {
        setIsAdLoading(false);
        if (forceShow) {
            callback(); // Nav သွားတာမျိုးဆိုရင် Error တက်လည်း ပေးသွားမယ်
        } else {
            alert(err.error === 'no_ads' ? "No ads available right now." : "Ad closed early.");
        }
      });
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already done!");
    runWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      // Firebase Sync
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      if (link) window.open(link, '_blank');
      alert(`Success! +${reward} TON`);
    });
  };

  // UI အပိုင်းတွေကတော့ သင့် code အဟောင်းအတိုင်း styles တွေ သုံးနိုင်ပါတယ်
  return (
    <div style={{ padding: '15px' }}>
      {/* Balance ပြတဲ့ Header */}
      <div style={{ textAlign: 'center', background: '#000', color: '#fff', padding: '20px', borderRadius: '20px' }}>
        <h2>{balance.toFixed(5)} TON</h2>
        <p>{isAdLoading ? "Loading Ad..." : "Status: Active"}</p>
      </div>

      {/* Task Tabs */}
      <div style={{ marginTop: '20px' }}>
        {customTasks.filter(t => t.type === activeTab).map(t => (
          <div key={t.id} style={{ background: '#fff', margin: '10px 0', padding: '15px', borderRadius: '15px', border: '2px solid #000' }}>
            <span>{t.name}</span>
            <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ float: 'right' }}>START</button>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', background: '#000', padding: '15px' }}>
        <button onClick={() => runWithAd(() => setActiveNav('earn'), true)} style={{ flex: 1, color: '#fff' }}>EARN</button>
        <button onClick={() => runWithAd(() => setActiveNav('withdraw'), true)} style={{ flex: 1, color: '#fff' }}>WITHDRAW</button>
      </div>
    </div>
  );
}

export default App;
