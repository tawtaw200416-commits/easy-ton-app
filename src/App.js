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
  
  // --- New Ads Management State ---
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
      } catch (e) { console.error(e); }
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
      
      // Load Ads from DB
      if (adsData) {
        setAdList(adsData.links || []);
        setAdsgramBlockId(adsData.adsgramId || "27611");
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); handleReferral(); }, [fetchData, handleReferral]);

  // --- Flexible Reward Logic ---
  const processReward = async (id, rewardAmount) => {
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';

    if (isWatchAd) {
      // 1. Play custom ad links (Adsterra, etc.)
      for (const link of adList) {
          window.open(link, '_blank');
          await new Promise(r => setTimeout(r, 1200)); 
      }

      // 2. Play Adsgram (Verification)
      if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: adsgramBlockId });
        AdController.show().then((result) => {
          if (result.done) {
            applyBalance(isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD, true);
          }
        });
      }
    } else {
      applyBalance(finalReward, false, id);
    }
  };

  const applyBalance = (reward, isAd, taskId = null) => {
    const newBal = Number((balance + reward).toFixed(5));
    const newAds = isAd ? adsWatched + 1 : adsWatched;
    const newComp = taskId && !completed.includes(taskId) ? [...completed, taskId] : completed;

    setBalance(newBal);
    if (isAd) setAdsWatched(newAds);
    if (taskId) setCompleted(newComp);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, adsWatched: newAds, completed: newComp })
    });
    alert(`Success: +${reward} TON`);
  };

  const saveAdsToDB = async () => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_setup.json`, {
        method: 'PUT',
        body: JSON.stringify({ links: adList, adsgramId: adsgramBlockId })
    });
    alert("Saved Successfully!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p>Watch All Ads to Earn TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && (
              <div>
                <h4 style={{color:'blue'}}>ADS SETUP</h4>
                <label>Adsgram Block ID:</label>
                <input style={styles.input} value={adsgramBlockId} onChange={e => setAdsgramBlockId(e.target.value)} />
                
                <label>Other Ad Links:</label>
                <div style={{display:'flex', gap:'5px'}}>
                    <input style={styles.input} placeholder="Paste Link" value={newAdInput} onChange={e => setNewAdInput(e.target.value)} />
                    <button style={{...styles.btn, width:'60px', height:'40px'}} onClick={() => { if(newAdInput) { setAdList([...adList, newAdInput]); setNewAdInput(''); } }}>ADD</button>
                </div>
                {adList.map((l, i) => (
                    <div key={i} style={{fontSize:'10px', background:'#eee', padding:'5px', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
                        <span>{l}</span>
                        <button onClick={() => setAdList(adList.filter((_, idx) => idx !== i))} style={{color:'red', border:'none'}}>DEL</button>
                    </div>
                ))}
                <button style={{...styles.btn, background:'green'}} onClick={saveAdsToDB}>SAVE ALL ADS</button>

                <hr/>
                <h5 style={{color: '#f59e0b'}}>🔍 SEARCH USER</h5>
                <div style={{display: 'flex', gap: '5px'}}>
                  <input style={styles.input} placeholder="ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '60px'}} onClick={async () => {
                      const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const d = await r.json();
                      if(d) { setSearchedUser(d); setNewBalanceInput(d.balance || 0); } else alert("Not found");
                  }}>FIND</button>
                </div>
                {searchedUser && (
                    <div style={{marginTop:'10px', padding:'10px', border:'1px solid #ddd'}}>
                        <p>Bal: {searchedUser.balance}</p>
                        <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                        <button style={{...styles.btn, background:'blue'}} onClick={async () => {
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                            alert("Updated!");
                        }}>UPDATE BAL</button>
                    </div>
                )}
              </div>
            )}
            
            {/* ... Other Tabs (BOT/SOCIAL) ... */}
          </div>
        </>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px' }}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
