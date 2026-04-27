import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  // မင်းပေးထားတဲ့ Adsterra Direct Link
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  // ... ကျန်တဲ့ State များ

  // --- AD LOGIC: နှစ်မျိုးလုံးကြည့်ခိုင်းသည့် Function ---
  const triggerDoubleAds = (onCompleteReward) => {
    // ၁။ Adsterra Link ကို အရင်ဖွင့်တယ်
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');

    // ၂။ Adsgram ကို ခဏစောင့်ပြီးမှ တက်လာအောင်လုပ်တယ် (User app ဆီပြန်လာချိန်)
    setTimeout(() => {
      if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
        AdController.show().then((result) => {
          if (result.done) {
            onCompleteReward(); // Adsgram ပါကြည့်ပြီးမှ ပိုက်ဆံပေးမယ်
          }
        }).catch((err) => {
          console.error("Adsgram Error:", err);
          alert("Ad load မဖြစ်ပါ။ ခဏနေမှ ထပ်စမ်းပါ။");
        });
      }
    }, 1000); 
  };

  const handleWatchAdReward = () => {
    const finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    
    triggerDoubleAds(() => {
        const newBal = Number((balance + finalReward).toFixed(5));
        const newAdsCount = adsWatched + 1;
        
        setBalance(newBal);
        setAdsWatched(newAdsCount);

        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ 
            balance: newBal, 
            adsWatched: newAdsCount
          })
        });
        alert(`ဂုဏ်ယူပါတယ်! +${finalReward} TON ရရှိပါပြီ။`);
    });
  };

  // Nav ခလုတ်နှိပ်ရင် Ad တက်အောင် လုပ်ဆောင်ချက်
  const handleNavChange = (navName) => {
    if (navName !== activeNav) {
        // Nav ပြောင်းတိုင်း Adsterra Link ပွင့်စေချင်ရင် triggerDoubleAds သုံးနိုင်ပါတယ်
        // ဒါမှမဟုတ် Adsterra Link တစ်ခုတည်း ပွင့်စေချင်ရင် window.open သုံးပါ
        window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
        setActiveNav(navName);
    }
  };

  // ... (fetchData, handleReferral logic များ အရင်အတိုင်း ထားနိုင်ပါတယ်)

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#facc15', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE {isVip && "VIP ⭐"}</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
           <p style={{marginBottom: '10px'}}>Watch Adsterra + Adsgram to get Rewards</p>
           {/* အပေါ်ခလုတ် */}
           <button style={styles.btn} onClick={handleWatchAdReward}>WATCH ADS</button>
        </div>
      )}

      {/* ... Task Tabs များ ... */}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button 
            key={n} 
            onClick={() => handleNavChange(n)} // အောက်ခြေခလုတ် Logic
            style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}
          >
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
