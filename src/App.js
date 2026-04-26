import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  ADSTERRA_SMARTLINK: "https://profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
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
  const [balance, setBalance] = useState(0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [loading, setLoading] = useState(true);

  // Database ကနေ Data အရင်ပြန်ဆွဲထုတ်မယ်
  const fetchData = useCallback(async () => {
    try {
      const uRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await uRes.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
      }
      setLoading(false);
    } catch (e) { 
        console.error("Fetch Error:", e);
        setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';

    if (isWatchAd) {
      finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
      
      if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
        AdController.show()
          .then((result) => {
            if (result.done) {
              const newBal = Number((balance + finalReward).toFixed(5));
              const newAdsCount = adsWatched + 1;
              
              setBalance(newBal);
              setAdsWatched(newAdsCount);

              fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount })
              });

              // Adsgram ပြီးတာနဲ့ Adsterra ဖွင့်ပေးမယ်
              window.open(APP_CONFIG.ADSTERRA_SMARTLINK, '_blank');
              alert(`Adsgram Success! +${finalReward} TON added.`);
            }
          })
          .catch(() => window.open(APP_CONFIG.ADSTERRA_SMARTLINK, '_blank'));
      } else {
        window.open(APP_CONFIG.ADSTERRA_SMARTLINK, '_blank');
      }
    }
  };

  const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b10', name: "Easy Ton Bot", link: "https://t.me/easytonfree" }
  ];

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#000'}}>Loading Data...</div>;

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '35px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:5, fontWeight:'bold'}}>VIP</span>}
      </div>

      <div style={{...styles.card, background:'#000', color:'#fff', textAlign:'center', marginTop:'15px'}}>
         <p>Watch Ads (Adsgram + Adsterra)</p>
         <button style={{...styles.btn, background:'#facc15', color:'#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH VIDEO</button>
      </div>

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
