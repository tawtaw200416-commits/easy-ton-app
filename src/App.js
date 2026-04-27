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
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  // --- New Dynamic Ads States ---
  const [adList, setAdList] = useState([]); 
  const [newAdInput, setNewAdInput] = useState('');
  const [adsgramBlockId, setAdsgramBlockId] = useState("27611");

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminVipUserId, setAdminVipUserId] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const isNewUser = !localStorage.getItem(`joined_${APP_CONFIG.MY_UID}`);
    if (startParam && isNewUser && startParam !== APP_CONFIG.MY_UID) {
      try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`);
        const inviterData = await res.json();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newInviterRefs = inviterData.referrals ? [...Object.values(inviterData.referrals), { id: APP_CONFIG.MY_UID }] : [{ id: APP_CONFIG.MY_UID }];
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newInviterBalance, referrals: newInviterRefs })
          });
          localStorage.setItem(`joined_${APP_CONFIG.MY_UID}`, 'true');
        }
      } catch (e) { console.error("Referral Error:", e); }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_setup.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsSetup = await a.json();

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
      if (adsSetup) {
        setAdList(adsSetup.links || []);
        setAdsgramBlockId(adsSetup.adsgramId || "27611");
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); handleReferral(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData, handleReferral]);

  // --- Dynamic Reward Logic ---
  const processReward = async (id, rewardAmount) => {
    if (id === 'watch_ad') {
      // 1. Open all custom links first (Adsterra, etc.)
      for (const adLink of adList) {
          window.open(adLink, '_blank');
          await new Promise(r => setTimeout(r, 1000)); // Delay between links
      }

      // 2. Finally show Adsgram to verify and reward
      if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: adsgramBlockId });
        AdController.show().then((result) => {
          if (result.done) {
            applyReward(isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD, true);
          }
        }).catch(() => alert("Ad error or closed."));
      }
    } else {
      applyReward(rewardAmount, false, id);
    }
  };

  const applyReward = (amount, isAd, taskId = null) => {
    const newBal = Number((balance + amount).toFixed(5));
    const newCount = isAd ? adsWatched + 1 : adsWatched;
    const newComp = taskId && !completed.includes(taskId) ? [...completed, taskId] : completed;

    setBalance(newBal);
    if (isAd) setAdsWatched(newCount);
    if (taskId) setCompleted(newComp);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, adsWatched: newCount, completed: newComp })
    });
    alert(`Reward: +${amount} TON`);
  };

  const handleSaveAds = async () => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_setup.json`, {
        method: 'PUT',
        body: JSON.stringify({ links: adList, adsgramId: adsgramBlockId })
    });
    alert("Ad Settings Saved!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Total Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch All Ads - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && (
              <div>
                <h4 style={{color: '#3b82f6'}}>ADS SETUP</h4>
                <label style={{fontSize:'12px', fontWeight:'bold'}}>Adsgram Block ID:</label>
                <input style={styles.input} value={adsgramBlockId} onChange={e => setAdsgramBlockId(e.target.value)} />
                
                <label style={{fontSize:'12px', fontWeight:'bold'}}>Custom Ad Links (Adsterra, etc.):</label>
                <div style={{display:'flex', gap:'5px'}}>
                  <input style={styles.input} placeholder="Paste link here" value={newAdInput} onChange={e => setNewAdInput(e.target.value)} />
                  <button style={{...styles.btn, width:'80px', height:'40px'}} onClick={() => { if(newAdInput) { setAdList([...adList, newAdInput]); setNewAdInput(''); } }}>ADD</button>
                </div>
                
                <div style={{margin: '10px 0', maxHeight:'150px', overflowY:'auto'}}>
                  {adList.map((link, i) => (
                    <div key={i} style={{fontSize:'10px', background:'#eee', padding:'8px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between'}}>
                      <span style={{overflow:'hidden'}}>{link}</span>
                      <button onClick={() => setAdList(adList.filter((_, idx) => idx !== i))} style={{color:'red', border:'none', background:'none', fontWeight:'bold'}}>DEL</button>
                    </div>
                  ))}
                </div>
                <button style={{...styles.btn, background:'green'}} onClick={handleSaveAds}>SAVE ADS CONFIG</button>

                <hr style={{margin: '20px 0'}}/>
                <h5 style={{color: '#f59e0b'}}>🔍 USER MANAGER</h5>
                {/* Existing Admin Logic (Search, Tasks, etc. kept as is) */}
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="Enter User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={async () => {
                      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const data = await res.json();
                      if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); } else alert("Not found");
                    }}>FIND</button>
                </div>
                {/* ... (Keep the rest of your original admin search results UI here) ... */}
              </div>
            )}
            
            {/* ... (Keep BOT, SOCIAL, REWARD UI the same) ... */}
          </div>
        </>
      )}

      {/* ... (Keep NAV, WITHDRAW, PROFILE UI the same) ... */}
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
