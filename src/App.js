import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsterraLinks, setAdsterraLinks] = useState([]);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Admin States
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
    setTimeout(() => {
      if (adsterraLinks.length > 0) {
        const rnd = Math.floor(Math.random() * adsterraLinks.length);
        window.open(adsterraLinks[rnd].url, '_blank');
      }
    }, 1000);
  }, [adsterraLinks]);

  const checkAdStay = () => {
    const elapsed = (Date.now() - lastAdClickTime) / 1000;
    if (lastAdClickTime === 0 || elapsed < 9) {
      alert(`Please stay 9s on the ad page! (${Math.ceil(9 - elapsed)}s left)`);
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [u, t, a, p] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();
      const promoData = await p.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(k => ({ id: k, url: adsData[k].url })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    } catch (e) { console.warn("Sync error"); }
    finally { setIsSyncing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = async (id, amt) => {
    if (!checkAdStay()) return;
    
    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    setBalance(newBal);
    
    const updates = { balance: newBal };
    if (id !== 'watch_ad') {
        const newCompleted = [...completed, id];
        setCompleted(newCompleted);
        updates.completedTasks = newCompleted;
    }

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify(updates)
    });
    alert(`Success! +${rewardAmt} TON`);
    setLastAdClickTime(0);
    fetchData();
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    watchBtn: { background: '#facc15', color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginTop: '10px', width: '100%' },
    adminBtn: { padding: '8px', background: '#000', color: '#fff', borderRadius: '5px', fontSize: '12px', marginBottom: '5px', cursor: 'pointer', border: 'none' },
    delBtn: { background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '5px', fontSize: '10px', border: 'none', cursor: 'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>{isSyncing ? "SYNCING..." : "TOTAL BALANCE"}</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:'bold'}}>VIP ⭐</span>}
        <button style={styles.watchBtn} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>
           WATCH ADS (+{isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD})
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => { triggerAdsSequence(); setActiveTab(t.toLowerCase()); }} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => { triggerAdsSequence(); window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000)}} style={styles.adminBtn}>START</button>
              </div>
            ))}
            {activeTab === 'social' && [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => { triggerAdsSequence(); window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000)}} style={styles.adminBtn}>JOIN</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if (completed.includes(`promo_${rewardCodeInput}`)) return alert("Already used!");
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h3 style={{borderBottom:'2px solid #000', marginBottom: 15}}>Admin Dashboard</h3>
                
                {/* User Editor */}
                <h5>Search User (UID)</h5>
                <input style={styles.input} placeholder="User ID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.adminBtn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  setSearchedUser(data); setNewBalanceInput(data?.balance || 0);
                }}>Find User</button>
                {searchedUser && (
                  <div style={{background:'#eee', padding:10, borderRadius:10, marginTop:10}}>
                    <p>TON: {searchedUser.balance} | VIP: {searchedUser.isVip ? "Yes" : "No"}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.adminBtn} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Updated!"); fetchData();
                    }}>Set Balance</button>
                    <button style={{...styles.adminBtn, background:'blue', marginLeft:5}} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({isVip: !searchedUser.isVip})});
                      alert("VIP Status Changed!"); fetchData();
                    }}>Toggle VIP</button>
                  </div>
                )}

                {/* Task Editor */}
                <h5 style={{marginTop:20}}>Add New Task</h5>
                <input style={styles.input} placeholder="Name" onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">Bot</option>
                  <option value="social">Social</option>
                </select>
                <button style={styles.btn} onClick={async () => {
                  const id = 't'+Date.now();
                  await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method:'PUT', body: JSON.stringify({id, name: adminTaskName, link: adminTaskLink, type: adminTaskType})});
                  fetchData();
                }}>Save Task</button>
                <div style={{marginTop:10}}>
                  {customTasks.map(t => (
                    <div key={t.firebaseKey} style={{display:'flex', justifyContent:'space-between', padding:5, background:'#f9f9f9', borderBottom:'1px solid #ddd'}}>
                      <span style={{fontSize:12}}>{t.name}</span>
                      <button style={styles.delBtn} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${t.firebaseKey}.json`, { method:'DELETE' });
                        fetchData();
                      }}>Delete</button>
                    </div>
                  ))}
                </div>

                {/* Promo Editor */}
                <h5 style={{marginTop:20}}>Add Promo Code</h5>
                <input style={styles.input} placeholder="Code" onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} placeholder="Reward" type="number" onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method:'PUT', body: JSON.stringify(Number(adminPromoReward))});
                  fetchData();
                }}>Save Code</button>
                <div style={{marginTop:10}}>
                  {promoCodes.map(c => (
                    <div key={c.code} style={{display:'flex', justifyContent:'space-between', padding:5, background:'#f9f9f9', borderBottom:'1px solid #ddd'}}>
                      <span style={{fontSize:12}}>{c.code}: {c.reward}</span>
                      <button style={styles.delBtn} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${c.code}.json`, { method:'DELETE' });
                        fetchData();
                      }}>Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{color: '#000'}}>Invite Friends</h2>
          <p style={{background: '#fef08a', padding: 10, borderRadius: 10, border: '1px dashed #000'}}>
            Invite friends and get <b>{APP_CONFIG.REFER_REWARD} TON</b> per referral!
          </p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          <h4 style={{marginTop: 15}}>Referrals: {referrals.length}</h4>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>VIP Membership</h3>
            <p style={{fontSize: 12}}>Send 0.5 TON to get VIP rewards.</p>
            <div style={{display:'flex', gap:5}}>
              <input style={styles.input} readOnly value={APP_CONFIG.ADMIN_WALLET} />
              <button style={{...styles.adminBtn, height:40}} onClick={() => copyText(APP_CONFIG.ADMIN_WALLET)}>Copy</button>
            </div>
            <div style={{display:'flex', gap:5}}>
              <input style={styles.input} readOnly value={APP_CONFIG.MY_UID} />
              <button style={{...styles.adminBtn, height:40}} onClick={() => copyText(APP_CONFIG.MY_UID)}>Copy</button>
            </div>
          </div>
          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Min 0.1 TON" type="number" onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={async () => {
              if(Number(withdrawAmount) < 0.1 || Number(withdrawAmount) > balance) return alert("Invalid amount");
              triggerAdsSequence();
              const h = [{amount: withdrawAmount, status: 'Pending', date: new Date().toLocaleDateString()}, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method:'PATCH', body: JSON.stringify({balance: balance - Number(withdrawAmount), withdrawHistory: h})});
              alert("Request Sent!"); fetchData();
            }}>WITHDRAW NOW</button>
          </div>
          <div style={styles.card}>
            <h3>History</h3>
            {withdrawHistory.map((item, idx) => (
                <div key={idx} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                    <span>{item.amount} TON</span>
                    <span style={{color: item.status === 'Pending' ? 'orange' : 'green'}}>{item.status}</span>
                </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>TON: <b>{balance.toFixed(5)}</b></p>
          <p>Status: {isVip ? "VIP ⭐" : "Standard"}</p>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => { triggerAdsSequence(); setActiveNav(n); }} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
];

const fixedSocialTasks = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
];

export default App;
