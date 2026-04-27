import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  // Reward for watching ALL ads in a sequence
  WATCH_REWARD: 0.0005, 
  VIP_WATCH_REWARD: 0.001, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  // List of Ads IDs (Admin can add more via Admin Panel)
  const [adsList, setAdsList] = useState(["27611", "29164006"]); 
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [newAdsIdInput, setNewAdsIdInput] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/settings/ads_list.json`)
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
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      if (adsData) setAdsList(adsData);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // NEW: Function to show all ads in the adsList one by one
  const showSequentialAds = async () => {
    if (!window.Adsgram) return alert("Adsgram not loaded");

    let allDone = true;
    
    // Loop through each ID in your list
    for (let i = 0; i < adsList.length; i++) {
      const blockId = adsList[i];
      try {
        const AdController = window.Adsgram.init({ blockId: blockId });
        const result = await AdController.show();
        
        if (!result.done) {
          allDone = false;
          alert(`Ad ${i+1} was not completed. Reward canceled.`);
          break; // Stop if user skips any ad
        }
      } catch (e) {
        allDone = false;
        console.error(`Ad ID ${blockId} failed:`, e);
        break;
      }
    }

    if (allDone) {
      const finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
      const newBal = Number((balance + finalReward).toFixed(5));
      const newAdsCount = adsWatched + adsList.length;

      setBalance(newBal);
      setAdsWatched(newAdsCount);
      
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount })
      });

      alert(`Success! All ${adsList.length} ads watched.\nReward: +${finalReward} TON`);
      fetchData();
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Requirement: Watch all {adsList.length} ads for reward</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{marginBottom: 10}}>Click to start sequence ({adsList.length} Ads)</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={showSequentialAds}>
               WATCH {adsList.length} ADS
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px' }}>{t}</button>
            ))}
          </div>

          {activeTab === 'admin' && (
            <div style={styles.card}>
              <h4>Admin - Multi Ads sequence</h4>
              <input style={styles.input} placeholder="New Ad ID" value={newAdsIdInput} onChange={e => setNewAdsIdInput(e.target.value)} />
              <button style={{...styles.btn, background: '#16a34a'}} onClick={async () => {
                  const newList = [...adsList, newAdsIdInput];
                  await fetch(`${APP_CONFIG.FIREBASE_URL}/settings.json`, { method: 'PATCH', body: JSON.stringify({ ads_list: newList }) });
                  alert("New ID added to sequence!"); fetchData(); setNewAdsIdInput('');
              }}>ADD TO SEQUENCE</button>
              <div style={{marginTop: 10, fontSize: 11}}>Current IDs: {adsList.join(' -> ')}</div>
            </div>
          )}
        </>
      )}

      <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px'}}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
