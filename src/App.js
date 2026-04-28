import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  REFER_REWARD: 0.001
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // --- State Initialization ---
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  // UI Inputs
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [newAdUrl, setNewAdUrl] = useState('');

  // Admin Search
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // --- Ad Rotation Logic ---
  const adIndexRef = useRef(0);

  const triggerAdRotation = useCallback(() => {
    if (adsterraLinks.length > 0) {
      const idx = adIndexRef.current % adsterraLinks.length;
      const targetLink = adsterraLinks[idx].url;
      adIndexRef.current += 1;
      window.open(targetLink, '_blank');
    }
  }, [adsterraLinks]);

  // Handle global clicks for ads
  useEffect(() => {
    const handleAction = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        triggerAdRotation();
      }
    };
    window.addEventListener('click', handleAction);
    return () => window.removeEventListener('click', handleAction);
  }, [triggerAdRotation]);

  // --- Data Synchronization (Fixes VPN Disappearance) ---
  const fetchData = useCallback(async () => {
    try {
      // The ?nocache parameter prevents the browser from loading old data when VPN is off
      const syncKey = `?nocache=${Date.now()}`;
      const [userRes, taskRes, adRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json${syncKey}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json${syncKey}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json${syncKey}`)
      ]);

      const uData = await userRes.json();
      const tData = await taskRes.json();
      const aData = await adRes.json();

      if (uData) {
        setBalance(Number(uData.balance || 0));
        setAdsWatched(uData.adsWatched || 0);
        setCompleted(uData.completed || []);
        setWithdrawHistory(uData.withdrawHistory || []);
        setIsVip(uData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
      }
      
      if (tData) {
        setCustomTasks(Object.keys(tData).map(k => ({ ...tData[k], firebaseKey: k })));
      }

      if (aData) {
        setAdsterraLinks(Object.keys(aData).map(k => ({ id: k, url: aData[k].url })));
      }
    } catch (error) {
      console.warn("Network Sync Delayed. Retrying...");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const syncInterval = setInterval(fetchData, 10000); // Sync every 10 seconds
    return () => clearInterval(syncInterval);
  }, [fetchData]);

  // --- Reward Processing ---
  const processAdReward = (id, amount) => {
    if (!window.Adsgram) return alert("Ads system loading...");
    
    const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
    AdController.show().then((res) => {
      if (res.done) {
        const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
        const newTotal = Number((balance + reward).toFixed(6));
        const newCount = adsWatched + 1;
        
        setBalance(newTotal);
        setAdsWatched(newCount);

        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newTotal, adsWatched: newCount })
        });
        alert(`Success! +${reward} TON`);
      }
    }).catch(() => alert("Ad failed. Please check network."));
  };

  const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    { id: 'b7', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=1793453606" }
  ];

  const styles = {
    container: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', color: '#000' },
    header: { background: '#000', color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '15px' },
    card: { background: '#fff', borderRadius: '15px', padding: '15px', marginBottom: '10px', border: '2px solid #000' },
    btn: { background: '#000', color: '#fff', width: '100%', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <small>AVAILABLE BALANCE</small>
        <h1 style={{ fontSize: '32px' }}>{balance.toFixed(5)} TON</h1>
        {isVip && <div style={{ color: '#facc15' }}>⭐ VIP ACCOUNT</div>}
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Watch Ads ({adsWatched} Watched)</p>
            <button style={{ ...styles.btn, background: '#facc15', color: '#000' }} onClick={() => processAdReward('watch_ad')}>
              WATCH ADS
            </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'REWARD', 'ADMIN'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === tab.toLowerCase() ? '#000' : '#fff', color: activeTab === tab.toLowerCase() ? '#fff' : '#000' }}>{tab}</button>
            ))}
          </div>

          {activeTab === 'bot' && fixedBotTasks.map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{t.name}</span>
                <button style={{ background: '#000', color: '#fff', padding: '5px 15px', borderRadius: '5px' }} onClick={() => window.open(t.link)}>START</button>
              </div>
            </div>
          ))}

          {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
            <div style={styles.card}>
              <h3>Admin Ad Manager</h3>
              <input 
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }} 
                placeholder="Paste Adsterra Direct Link" 
                value={newAdUrl} 
                onChange={e => setNewAdUrl(e.target.value)} 
              />
              <button style={{ ...styles.btn, background: '#d946ef' }} onClick={async () => {
                if(!newAdUrl) return;
                const adId = 'ad_' + Date.now();
                await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${adId}.json`, { method: 'PUT', body: JSON.stringify({ url: newAdUrl }) });
                setNewAdUrl('');
                fetchData();
                alert("Link Saved Permanently!");
              }}>ADD LINK</button>

              <div style={{ marginTop: '20px' }}>
                <p>Active Links: {adsterraLinks.length}</p>
                {adsterraLinks.map(ad => (
                  <div key={ad.id} style={{ borderBottom: '1px solid #ddd', padding: '5px 0', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ad.url.substring(0, 40)}...</span>
                    <button style={{ color: 'red' }} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${ad.id}.json`, { method: 'DELETE' });
                      fetchData();
                    }}>REMOVE</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <p>Min: 0.1 TON</p>
          <input style={{ width: '100%', padding: '10px', marginBottom: '10px' }} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={{ width: '100%', padding: '10px', marginBottom: '10px' }} placeholder="TON Wallet" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn}>SUBMIT WITHDRAWAL</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, color: activeNav === n ? '#facc15' : '#fff', background: 'none', border: 'none', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
