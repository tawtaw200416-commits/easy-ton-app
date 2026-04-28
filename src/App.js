import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  // VPN Download Links
  WARP_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone",
  WARP_IOS: "https://apps.apple.com/app/1-1-1-1-faster-internet/id1333512190"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // Logic to lock the app until user clicks "I Have Connected VPN"
  const [vpnVerified, setVpnVerified] = useState(false);

  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [adsterraLinks, setAdsterraLinks] = useState([]);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Admin and Search States
  const [newAdUrl, setNewAdUrl] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  // --- Adsterra Logic ---
  const triggerAdsterra = useCallback(() => {
    if (adsterraLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
      window.open(adsterraLinks[randomIndex].url, '_blank');
    }
  }, [adsterraLinks]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (vpnVerified && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        triggerAdsterra();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [triggerAdsterra, vpnVerified]);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`)
      ]);
      const userData = await u.json();
      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      const tasksData = await t.json();
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      const adsData = await a.json();
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(k => ({ id: k, url: adsData[k].url })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Strict Reward Processing with VPN Check ---
  const processReward = (id, rewardAmount) => {
    if (!vpnVerified) {
        alert("CRITICAL: 1.1.1.1 VPN connection required!");
        return;
    }

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          // If VPN works, the ad will finish and reward is added
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          const newCompleted = !isWatchAd ? [...completed, id] : completed;
          
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Success! +${finalReward} TON Added.`);
        } else {
            alert("Reward Cancelled: You must finish the ad with VPN connected.");
        }
      }).catch((err) => {
        alert("VPN/Connection Error: Cannot load ads. Rewards will not be added without VPN.");
        console.error(err);
      });
    } else {
      alert("Blocked: Please turn off Ad-Blockers and Connect 1.1.1.1 VPN.");
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task Already Done!");
    if (link) window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 2000);
  };

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', color: '#fff', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' },
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <>
      {/* 1.1.1.1 VPN OVERLAY (Locks the bot) */}
      {!vpnVerified && (
        <div style={styles.overlay}>
          <h2 style={{color: '#facc15'}}>VPN CONNECTION REQUIRED</h2>
          <p style={{marginBottom: '20px'}}>Please use 1.1.1.1 WARP VPN to load ads and receive TON rewards.</p>
          <button style={{...styles.btn, background: '#fff', color: '#000', marginBottom: '10px'}} onClick={() => window.open(APP_CONFIG.WARP_ANDROID)}>GET 1.1.1.1 (ANDROID)</button>
          <button style={{...styles.btn, background: '#fff', color: '#000', marginBottom: '30px'}} onClick={() => window.open(APP_CONFIG.WARP_IOS)}>GET 1.1.1.1 (IOS)</button>
          
          <button style={{...styles.btn, background: '#facc15', color: '#000', fontSize: '18px'}} onClick={() => setVpnVerified(true)}>I HAVE CONNECTED VPN ✅</button>
          <p style={{fontSize: '11px', marginTop: '15px', opacity: 0.6}}>Note: If ads do not load, rewards will not be added to balance.</p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{...styles.main, display: vpnVerified ? 'block' : 'none'}}>
        <div style={styles.header}>
          <small style={{color: '#facc15'}}>YOUR TON BALANCE</small>
          <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
          <small>Watched: {adsWatched} {isVip && "⭐ VIP"}</small>
        </div>

        {activeNav === 'earn' && (
          <>
            <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
               <p style={{marginBottom: '10px'}}>VPN Status: <span style={{color: '#4ade80'}}>Active Required</span></p>
               <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH VIDEO & EARN</button>
            </div>

            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
                (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
              ))}
            </div>

            <div style={styles.card}>
              {activeTab === 'bot' && [
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
                  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{fontWeight:'bold'}}>{t.name}</span>
                  <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={styles.nav}>
          {['earn', 'withdraw', 'profile'].map(n => (
            <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>
              {n.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
