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
  // External Ad Links
  ADSTERRA_LINK: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTIC_LINK: "https://data527.click/a674e1237b7e268eb5f6/8d02b7e071/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [customTasks, setCustomTasks] = useState([]);

  // --- External Ads Logic State ---
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [timer, setTimer] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);

  // --- UI States ---
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [currentAdsBlockId, setCurrentAdsBlockId] = useState("27611");

  // --- Ad Timer Effect ---
  useEffect(() => {
    let interval;
    if (isWatchingAd && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isWatchingAd) {
      setIsWatchingAd(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
    return () => clearInterval(interval);
  }, [isWatchingAd, timer, pendingAction]);

  // --- Ad Trigger Function ---
  const triggerAd = (action) => {
    // Skip ads if in Admin tab
    if (activeTab === 'admin' && activeNav === 'earn') {
      action();
      return;
    }

    const adUrl = Math.random() > 0.5 ? APP_CONFIG.ADSTERRA_LINK : APP_CONFIG.ADVERTIC_LINK;
    tg?.openLink ? tg.openLink(adUrl) : window.open(adUrl, '_blank');

    setPendingAction(() => action);
    setTimer(9);
    setIsWatchingAd(true);
  };

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
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (adsData?.blockId) setCurrentAdsBlockId(adsData.blockId);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const processAdsgramReward = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: currentAdsBlockId });
      AdController.show().then((result) => {
        if (result.done) {
          const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
          const newBal = Number((balance + reward).toFixed(5));
          setBalance(newBal);
          setAdsWatched(prev => prev + 1);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, adsWatched: adsWatched + 1 })
          });
          alert(`Reward Success: +${reward} TON`);
        }
      });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    
    triggerAd(() => {
      if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      alert(`Success: +${reward} TON`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 10 },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000, textAlign: 'center', padding: '20px' }
  };

  return (
    <div style={styles.main}>
      {/* 9S Mandatory Ad Overlay */}
      {isWatchingAd && (
        <div style={styles.overlay}>
          <h2 style={{color: '#facc15'}}>SECURE LOADING</h2>
          <p>Please watch the ad for <b>{timer}s</b> to verify.</p>
          <div style={{width: '70%', height: '8px', background: '#333', borderRadius: '4px', marginTop: '15px', overflow: 'hidden'}}>
            <div style={{width: `${(9 - timer) * 11.1}%`, height: '100%', background: '#facc15', transition: 'width 1s linear'}}></div>
          </div>
          <p style={{fontSize: '11px', marginTop: '15px', opacity: 0.6}}>Closing early will cancel your reward.</p>
        </div>
      )}

      <div style={styles.header}>
        <small>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched} {isVip && "⭐ VIP"}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{fontWeight: 'bold', marginBottom: '10px'}}>Instant Adsgram Reward</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={processAdsgramReward}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
               <button style={styles.btn} onClick={() => handleTaskReward('b1', 0.001, 'https://t.me/GrowTeaBot')}>Start Bot Task</button>
            )}
            {activeTab === 'reward' && (
               <button style={styles.btn} onClick={() => handleTaskReward('promo', 0.0008)}>Claim Code Reward</button>
            )}
            {activeTab === 'admin' && <p>Admin Mode: Ads Disabled</p>}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
           <h3>Withdraw</h3>
           <button style={styles.btn} onClick={() => triggerAd(() => alert("Verified. You can withdraw now."))}>
             UNLOCK WITHDRAW (9s Ad)
           </button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => triggerAd(() => setActiveNav(n))} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontSize: '10px', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
