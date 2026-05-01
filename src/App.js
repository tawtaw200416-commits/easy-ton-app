import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // Persistence for offline/slow networks
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminVipUserId, setAdminVipUserId] = useState('');

  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [newAdUrl, setNewAdUrl] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Initialize Telegram environment
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand(); // Opens app in full height
    }
  }, []);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 

    setTimeout(() => {
      if (adsterraLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
        window.open(adsterraLinks[randomIndex].url, '_blank');
      }
    }, 7000); 
  }, [adsterraLinks]);

  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 7000) {
      alert("Please stay 7s on the ad page to verify!");
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const handleTabChange = (tab) => {
    if (!checkAdStay()) return;
    if (['bot', 'social', 'reward'].includes(tab)) triggerAdsSequence();
    setActiveTab(tab);
  };

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000); // 10s timeout for slow networks

      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { signal: controller.signal }),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { signal: controller.signal }),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`, { signal: controller.signal })
      ]);
      
      clearTimeout(id);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, userData.balance);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
    } catch (e) { 
      console.warn("Network slow - using cached data");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 20000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const processReward = async (id, rewardAmount) => {
    if (!checkAdStay()) return;

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    const finalize = async () => {
      const newBal = Number((balance + finalReward).toFixed(5));
      const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
      const newCompleted = !isWatchAd ? [...completed, id] : completed;

      setBalance(newBal);
      if (isWatchAd) setAdsWatched(newAdsCount);
      setCompleted(newCompleted);

      // Save locally first
      localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, newBal);

      try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
        });
        alert(`Success! +${finalReward} TON`);
        setLastAdClickTime(0); 
        fetchData();
      } catch (err) {
        alert("Saved! (Will sync when internet is better)");
      }
    };

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => { if (result.done) finalize(); }).catch(() => finalize());
    } else {
      finalize(); // Fail-safe for blocked ad scripts
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Done already!");
    triggerAdsSequence();
    if (link) {
      setTimeout(() => {
        tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
      }, 500);
    }
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const safeNavigate = (nav) => {
    if (activeNav === nav) return;
    if (!checkAdStay()) return;
    triggerAdsSequence();
    setActiveNav(nav);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>{isSyncing ? "SYNCING..." : "TOTAL BALANCE"}</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0'}}>Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleTabChange(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {triggerAdsSequence(); setTimeout(()=>processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD), 1500)}}>CLAIM</button>
              </div>
            )}
            {/* Admin Panels would go here - same as your original code */}
          </div>
        </>
      )}

      {/* Other Navigation Sections (Withdraw, Invite, Profile) same as your original code */}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => safeNavigate(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
  { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
  { id: 'b7', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=1793453606" }
];

const fixedSocialTasks = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
  { id: 's3', name: "@cryptogold_official", link: "https://t.me/cryptogold_online_official" },
  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
  { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
];

export default App;
