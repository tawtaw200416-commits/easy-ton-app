import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  // --- New Ad Links ---
  ADSTERRA: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTIC: "https://data527.click/a674e1237b7e268eb5f6/8d02b7e071/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // --- External Ads Timer State ---
  const [showAdTimer, setShowAdTimer] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [pendingRewardData, setPendingRewardData] = useState(null);

  const [currentAdsBlockId, setCurrentAdsBlockId] = useState("27611"); 
  const [newAdsBlockIdInput, setNewAdsBlockIdInput] = useState('');

  // Timer Logic
  useEffect(() => {
    let timer;
    if (showAdTimer && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && showAdTimer) {
      setShowAdTimer(false);
      if (pendingRewardData) {
        completeExternalReward(pendingRewardData.id, pendingRewardData.reward);
        setPendingRewardData(null);
      }
    }
    return () => clearInterval(timer);
  }, [showAdTimer, secondsLeft, pendingRewardData]);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/settings/ads_config.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }

      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      }

      if (adsData?.blockId) setCurrentAdsBlockId(adsData.blockId);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Helper to open External Ad and Start Timer
  const startExternalAdTimer = (id, reward, linkToOpen = null) => {
    // Randomly pick Adsterra or Advertic
    const adUrl = Math.random() > 0.5 ? APP_CONFIG.ADSTERRA : APP_CONFIG.ADVERTIC;
    
    // Open the Ad link
    tg?.openLink ? tg.openLink(adUrl) : window.open(adUrl, '_blank');
    
    // If there's a task link (bot/social), open it after a small delay
    if (linkToOpen) {
        setTimeout(() => {
            tg?.openTelegramLink ? tg.openTelegramLink(linkToOpen) : window.open(linkToOpen, '_blank');
        }, 1000);
    }

    setPendingRewardData({ id, reward });
    setSecondsLeft(9);
    setShowAdTimer(true);
  };

  const completeExternalReward = (id, rewardAmount) => {
    const newBal = Number((balance + rewardAmount).toFixed(5));
    const isWatchAd = id === 'watch_ad';
    const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
    const newCompleted = !isWatchAd ? [...completed, id] : completed;

    setBalance(newBal);
    if (isWatchAd) setAdsWatched(newAdsCount);
    if (!isWatchAd) setCompleted(newCompleted);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        balance: newBal, 
        completed: newCompleted, 
        adsWatched: newAdsCount
      })
    });
    alert(`Success: +${rewardAmount} TON`);
    fetchData();
  };

  // Original Task Logic updated with External Ad Trigger
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    startExternalAdTimer(id, reward, link);
  };

  const processAdsgramReward = () => {
    if (!window.Adsgram) return alert("Ads not ready");
    const AdController = window.Adsgram.init({ blockId: currentAdsBlockId });
    AdController.show().then((result) => {
      if (result.done) {
        const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
        completeExternalReward('watch_ad', reward);
      }
    });
  };

  const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" }
  ];

  const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
  ];

  const allBotTasks = [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' },
    // Timer Overlay
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, color: '#fff', flexDirection: 'column' }
  };

  return (
    <div style={styles.main}>
      {/* Timer Overlay */}
      {showAdTimer && (
        <div style={styles.overlay}>
           <h2 style={{fontSize: '40px'}}>{secondsLeft}s</h2>
           <p>Wait for ad to finish to receive reward...</p>
           <p style={{fontSize: '12px', color: '#facc15'}}>Don't close the app</p>
        </div>
      )}

      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched} {isVip && "⭐"}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Video Reward</p>
             <div style={{display:'flex', gap: '5px'}}>
                <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={processAdsgramReward}>ADSGRAM</button>
                <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => startExternalAdTimer('watch_ad', isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD)}>DIRECT AD</button>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && allSocialTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Navigation */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
