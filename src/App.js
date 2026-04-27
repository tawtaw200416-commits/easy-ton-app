import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
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
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Admin Search states
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);

  // --- ကြော်ငြာပွင့်ပြီး Reward ပေးတဲ့ Logic ---
  const applyReward = (id, rewardAmt) => {
    let finalReward = rewardAmt;
    if (id === 'watch_ad') {
      finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    }

    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    
    setBalance(newBal);
    if (id === 'watch_ad') setAdsWatched(newAdsCount);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount })
    });
    alert(`Success! +${finalReward} TON`);
  };

  // --- ခလုတ်တိုင်းမှာ ကြော်ငြာတက်စေမယ့် Function ---
  const handleAdClick = (id, reward, link = null) => {
    // 1. Adsterra ကို New Tab နဲ့ အရင်ဖွင့်တယ်
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');

    // 2. Adsgram Video Ad ကို ခေါ်တယ်
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then((result) => {
          if (result.done) {
            applyReward(id, reward);
            if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
          }
        })
        .catch(() => {
            // Video မတက်လည်း Reward ရချင်ရင် ဒီမှာ applyReward ထည့်လို့ရတယ်
            alert("Video error. Please try again.");
        });
    } else {
      alert("Adsgram script not loaded.");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const data = await res.json();
      if (data) {
        setBalance(Number(data.balance || 0));
        setAdsWatched(data.adsWatched || 0);
        setWithdrawHistory(data.withdrawHistory || []);
        setReferrals(data.referrals ? Object.values(data.referrals) : []);
      }
    } catch (e) { console.log(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px' },
    header: { background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', textAlign: 'center', marginBottom: '15px' },
    card: { background: '#fff', padding: '15px', borderRadius: '15px', border: '2px solid #000', marginBottom: '10px' },
    btn: { width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', display: 'flex', padding: '15px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>BALANCE</small>
        <h1 style={{fontSize: '32px'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched} | {isVip ? "VIP ⭐" : "USER"}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
            <p>Watch Ads - Earn TON</p>
            <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => handleAdClick('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px'}}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
               <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                 <span>Grow Tea Bot</span>
                 <button onClick={() => handleAdClick('b1', 0.001, 'https://t.me/GrowTeaBot')} style={{background: '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px'}}>START</button>
               </div>
            )}
            
            {activeTab === 'admin' && (
               <div>
                  <input style={{width: '100%', padding: '10px', marginBottom: '5px'}} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={styles.btn} onClick={async () => {
                    const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                    const d = await r.json();
                    setSearchedUser(d || { error: "Not Found" });
                  }}>FIND USER</button>
                  {searchedUser && <pre style={{fontSize: '10px', marginTop: '10px'}}>{JSON.stringify(searchedUser, null, 2)}</pre>}
               </div>
            )}
          </div>
        </>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold'}}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
