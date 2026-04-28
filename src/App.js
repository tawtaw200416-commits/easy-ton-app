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
  // New state to check if VPN instruction is closed
  const [vpnConnected, setVpnConnected] = useState(false);

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

  // Admin and Search States (Old functionality preserved)
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [newAdUrl, setNewAdUrl] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // --- Adsterra Logic (Preserved) ---
  const triggerAdsterra = useCallback(() => {
    if (adsterraLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
      window.open(adsterraLinks[randomIndex].url, '_blank');
    }
  }, [adsterraLinks]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (vpnConnected && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        triggerAdsterra();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [triggerAdsterra, vpnConnected]);

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

  // --- Process Reward (Ensures connection check) ---
  const processReward = (id, rewardAmount) => {
    if (!vpnConnected) return alert("Please connect VPN first!");
    
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          setBalance(newBal);
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          if (isWatchAd) setAdsWatched(newAdsCount);
          const newCompleted = !isWatchAd ? [...completed, id] : completed;
          
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${finalReward} TON`);
        }
      }).catch(() => alert("Ad failed. Check your VPN connection."));
    }
  };

  const styles = {
    vpnOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#000', color: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' },
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <>
      {/* VPN REQUIREMENT SCREEN */}
      {!vpnConnected && (
        <div style={styles.vpnOverlay}>
          <h2 style={{color: '#facc15'}}>CONNECTION REQUIRED</h2>
          <p>Please connect to <b>1.1.1.1 WARP VPN</b> to use this bot and earn TON rewards.</p>
          <div style={{margin: '20px 0', width: '100%'}}>
            <button style={{...styles.btn, background: '#fff', color: '#000', marginBottom: '10px'}} onClick={() => window.open(APP_CONFIG.WARP_ANDROID)}>DOWNLOAD FOR ANDROID</button>
            <button style={{...styles.btn, background: '#fff', color: '#000'}} onClick={() => window.open(APP_CONFIG.WARP_IOS)}>DOWNLOAD FOR IOS</button>
          </div>
          <button style={{...styles.btn, background: '#facc15', color: '#000', marginTop: '20px'}} onClick={() => setVpnConnected(true)}>I HAVE CONNECTED</button>
          <p style={{fontSize: '11px', marginTop: '15px', opacity: 0.7}}>Rewards will not be processed without a valid connection.</p>
        </div>
      )}

      {/* MAIN BOT CONTENT (Only visible after VPN check) */}
      <div style={{...styles.main, display: vpnConnected ? 'block' : 'none'}}>
        <div style={styles.header}>
          <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
          <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
          <small>Ads Watched: {adsWatched} {isVip && "⭐ VIP"}</small>
        </div>

        {activeNav === 'earn' && (
          <>
            <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
               <p>Watch Video to Earn</p>
               <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
            </div>

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
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <span>{t.name}</span>
                  <button onClick={() => { if(t.link) window.open(t.link); processReward(t.id, 0.001); }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
                </div>
              ))}
              
              {activeTab === 'admin' && (
                <div>
                  <input style={styles.input} placeholder="Adsterra Link" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} />
                  <button style={styles.btn} onClick={async () => {
                    const id = 'ad_'+Date.now();
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${id}.json`, { method: 'PUT', body: JSON.stringify({ url: newAdUrl }) });
                    setNewAdUrl(''); fetchData(); alert("Link Saved!");
                  }}>ADD LINK</button>
                </div>
              )}
            </div>
          </>
        )}

        <div style={styles.nav}>
          {['earn', 'withdraw', 'profile'].map(n => (
            <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>{n.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
