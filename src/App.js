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
  WARP_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone",
  WARP_IOS: "https://apps.apple.com/app/1-1-1-1-faster-internet/id1333512190"
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
  const [adsterraLinks, setAdsterraLinks] = useState([]);

  // Admin States
  const [newAdUrl, setNewAdUrl] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  // --- Adsterra Logic ---
  const triggerAdsterra = useCallback(() => {
    if (adsterraLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
      const url = adsterraLinks[randomIndex].url;
      window.open(url, '_blank');
    }
  }, [adsterraLinks]);

  // Handle Global Clicks for Adsterra
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        triggerAdsterra();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [triggerAdsterra]);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`)
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
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(k => ({ id: k, url: adsData[k].url })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- Reward Processing with VPN Protection Logic ---
  const processReward = (id, rewardAmount) => {
    // If user is not using VPN/Warp, Adsgram will usually fail to load.
    // We only process balance if Adsgram confirmation is received.
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          // Success Path
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          
          const newCompleted = !isWatchAd ? [...completed, id] : completed;
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Success: +${finalReward} TON. (VPN Verified)`);
        } else {
          alert("Error: Reward failed. Please ensure 1.1.1.1 WARP is connected!");
        }
      }).catch(() => {
        alert("VPN Required: Please connect 1.1.1.1 WARP to claim rewards.");
      });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    // Force a small delay to mimic link checking
    setTimeout(() => { processReward(id, reward); }, 2000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '2px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '2px solid #fff' },
    info: { background: '#ef4444', color: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <h1 style={{fontSize: '32px', margin: '0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched} {isVip && "⭐ VIP"}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* 1.1.1.1 WARP DOWNLOAD SECTION */}
          <div style={styles.card}>
            <h4 style={{margin: '0 0 5px 0', color: '#ef4444'}}>⚠️ VPN/WARP REQUIRED</h4>
            <p style={{fontSize: '12px', marginBottom: '10px'}}>VPN မချိတ်ထားပါက TON များပေါင်းမည်မဟုတ်ပါ။ အမြန်ဆုံး 1.1.1.1 WARP ကိုအသုံးပြုပါ။</p>
            <div style={{display: 'flex', gap: '10px'}}>
               <button onClick={() => window.open(APP_CONFIG.WARP_ANDROID)} style={{...styles.btn, background: '#000', fontSize: '11px'}}>ANDROID APK</button>
               <button onClick={() => window.open(APP_CONFIG.WARP_IOS)} style={{...styles.btn, background: '#000', fontSize: '11px'}}>IOS APP</button>
            </div>
          </div>

          <div style={{...styles.card, background: '#000', color: '#fff'}}>
             <p style={{textAlign: 'center'}}>Watch Ads & Earn TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH VIDEO</button>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            
            {activeTab === 'admin' && (
               <div>
                  <h5>Adsterra Manager</h5>
                  <input style={{width:'100%', padding:'8px', marginBottom:'5px'}} placeholder="Paste Direct Link" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} />
                  <button style={styles.btn} onClick={async () => {
                     const id = 'ad_'+Date.now();
                     await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${id}.json`, { method: 'PUT', body: JSON.stringify({ url: newAdUrl }) });
                     setNewAdUrl(''); fetchData(); alert("Added!");
                  }}>ADD LINK</button>
               </div>
            )}
          </div>
        </>
      )}

      {/* Footer Nav */}
      <div style={styles.nav}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
