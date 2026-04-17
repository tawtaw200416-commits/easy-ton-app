import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  ADMINS: ["1793453606", "5020977059"], 
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001,
  BOT_TASK_REWARD: 0.002
};

function App() {
  const [balance, setBalance] = useState(null); // အကောင့်သစ်တွေကို 0 မပြခင် null ထားပါ
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);
  // ကျန်တဲ့ state တွေကို လိုအပ်သလို ထည့်ပါ...

  // --- ကြော်ငြာကြည့်ပြီးမှ အလုပ်လုပ်မည့် Function ---
  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;
    
    if (window.Adsgram) {
      setIsAdLoading(true);
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { 
          // ကြော်ငြာကို အဆုံးထိ ကြည့်ပြီးမှသာ ဒီထဲက callback အလုပ်လုပ်မည်
          setIsAdLoading(false); 
          if (callback) callback(); 
        })
        .catch((err) => { 
          // ကြော်ငြာကြည့်တာ မအောင်မြင်ရင် (သို့) ကြားဖြတ်ပိတ်ရင် TON မပေးပါ
          setIsAdLoading(false); 
          alert("ကြော်ငြာဆုံးအောင် ကြည့်မှ TON ရပါမည်။");
        });
    } else { 
      alert("Ad provider is not ready!");
    }
  };

  // --- TON ပေါင်းပေးမည့် Function (ကြော်ငြာကြည့်ပြီးမှ) ---
  const handleClaimReward = (rewardAmount, taskId = null) => {
    runTaskWithAd(() => {
      // ဒီနေရာရောက်မှသာ TON ပေါင်းမည်
      const currentBalance = balance || 0;
      const newBal = Number((currentBalance + rewardAmount).toFixed(5));
      
      setBalance(newBal);
      
      let updateData = { balance: newBal };
      if (taskId) {
        const newComp = [...completed, taskId];
        setCompleted(newComp);
        updateData.completed = newComp;
      }

      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
      
      alert(`Claimed! +${rewardAmount} TON`);
    });
  };

  // Nav ပြောင်းရင်လည်း ကြော်ငြာပြမည်
  const handleNavChange = (newNav) => {
    runTaskWithAd(() => setActiveNav(newNav));
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    const initApp = async () => {
      try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
        const userData = await res.json();
        if (userData) {
          setBalance(Number(userData.balance || 0));
          setCompleted(userData.completed || []);
        } else {
          // အကောင့်သစ်ဆိုရင် Firebase မှာ 0 အရင်သွားဆောက်ပါ
          setBalance(0);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: 0, completed: [] })
          });
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  if (loading || balance === null) return <div style={{textAlign:'center', marginTop:'100px', fontWeight:'bold'}}>SYNCING DATA...</div>;

  return (
    <div style={{ backgroundColor: '#facc15', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header အပိုင်း */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '20px', color: '#fff' }}>
        <small>CURRENT BALANCE</small>
        <h1>{balance.toFixed(5)} TON</h1>
        <div style={{color: '#10b981'}}>{isAdLoading ? "LOADING AD..." : "● ACTIVE STATUS"}</div>
      </div>

      {activeNav === 'earn' && (
        <div style={{ padding: '15px' }}>
          {/* Watch Video Button */}
          <button 
            onClick={() => handleClaimReward(0.0002)}
            style={{ width: '100%', padding: '15px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '15px', fontWeight: 'bold', marginBottom: '10px' }}
          >
            📺 WATCH VIDEO (+0.0002 TON)
          </button>

          {/* Tab ခလုတ်များ */}
          <div style={{ display: 'flex', gap: '5px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(tab => (
              <button key={tab} onClick={() => runTaskWithAd(() => setActiveTab(tab.toLowerCase()))} 
                style={{ flex: 1, padding: '10px', backgroundColor: activeTab === tab.toLowerCase() ? '#000' : '#fff', color: activeTab === tab.toLowerCase() ? '#fff' : '#000', borderRadius: '10px' }}>
                {tab}
              </button>
            ))}
          </div>
          
          {/* ကျန်တဲ့ Task list တွေမှာလည်း handleClaimReward ကို သုံးပါ */}
        </div>
      )}

      {/* Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, width: '100%', display: 'flex', background: '#000', padding: '15px 0' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => handleNavChange(n)} style={{ flex: 1, color: activeNav === n ? '#facc15' : '#fff', textAlign: 'center', cursor: 'pointer' }}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
