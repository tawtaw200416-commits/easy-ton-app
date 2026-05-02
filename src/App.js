import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  VIP_PRICE: "1 TON", // Updated price for display
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Admin States
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [u, t, p] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    } catch (e) { console.warn("Sync error"); }
    finally { setIsSyncing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 5 Minute Auto-Success Logic ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let hasUpdates = false;
      const updatedHistory = withdrawHistory.map(item => {
        if (item.status === 'Pending' && item.timestamp && (now - item.timestamp) > 300000) {
          hasUpdates = true;
          return { ...item, status: 'Success' };
        }
        return item;
      });
      if (hasUpdates) {
        setWithdrawHistory(updatedHistory);
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ withdrawHistory: updatedHistory })
        });
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
  }, []);

  const checkAdStay = (requiredSeconds) => {
    if (lastAdClickTime === 0) {
      triggerAdsSequence();
      return false;
    }
    const elapsed = (Date.now() - lastAdClickTime) / 1000;
    if (elapsed < requiredSeconds) {
      alert(`Wait! Please stay on the ad page for ${requiredSeconds} seconds. (${Math.ceil(requiredSeconds - elapsed)}s left)`);
      return false;
    }
    return true;
  };

  const handleAction = (callback) => {
    if (checkAdStay(15)) {
      callback();
      setLastAdClickTime(0); 
    }
  };

  const processReward = async (id, amt) => {
    // Watch ad is repeatable, others are one-time
    if (id !== 'watch_ad' && completed.includes(id)) {
        alert("Task already completed!");
        return;
    }

    const timeLimit = id === 'watch_ad' ? 30 : 15;
    if (!checkAdStay(timeLimit)) return;

    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    
    const updates = { balance: newBal };
    if (id !== 'watch_ad') {
        const newCompleted = [...completed, id];
        setCompleted(newCompleted);
        updates.completedTasks = newCompleted;
    }

    setBalance(newBal);
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify(updates)
    });
    alert(`Success! +${rewardAmt} TON added.`);
    setLastAdClickTime(0);
    fetchData();
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    watchBtn: { background: '#facc15', color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginTop: '10px', width: '100%' },
    adminBtn: { padding: '8px', background: '#000', color: '#fff', borderRadius: '5px', fontSize: '12px', marginBottom: '5px', cursor: 'pointer', border: 'none' },
    delBtn: { background: '#ef4444', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', border: 'none', cursor: 'pointer', marginLeft: '5px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>{isSyncing ? "REFRESHING DATA..." : "TOTAL BALANCE"}</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:'bold'}}>VIP ⭐</span>}
        <button style={styles.watchBtn} onClick={() => processReward('watch_ad', 0)}>
           WATCH ADS (30s)
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id) ? 0.5 : 1}}>{t.name}</span>
                <button 
                  disabled={completed.includes(t.id)}
                  onClick={() => { triggerAdsSequence(); window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000)}} 
                  style={{...styles.adminBtn, backgroundColor: completed.includes(t.id) ? '#ccc' : '#000'}}>
                  {completed.includes(t.id) ? "COMPLETED" : "START"}
                </button>
              </div>
            ))}
            {activeTab === 'social' && [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id) ? 0.5 : 1}}>{t.name}</span>
                <button 
                  disabled={completed.includes(t.id)}
                  onClick={() => { triggerAdsSequence(); window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000)}} 
                  style={{...styles.adminBtn, backgroundColor: completed.includes(t.id) ? '#ccc' : '#000'}}>
                  {completed.includes(t.id) ? "JOINED" : "JOIN"}
                </button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleAction(() => {
                  if (completed.includes(`promo_${rewardCodeInput}`)) return alert("Code already used!");
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                })}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h3 style={{borderBottom:'2px solid #000', paddingBottom: 5}}>Admin Panel</h3>
                <h5>Search User</h5>
                <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.adminBtn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("User not found");
                }}>Find User</button>
                {searchedUser && (
                  <div style={{background:'#f0f0f0', padding: 10, borderRadius: 10, marginTop: 10}}>
                    <p>UID: {searchUserId}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.adminBtn} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Updated!");
                    }}>Update Balance</button>
                  </div>
                )}
                <h5 style={{marginTop: 20}}>Create Code</h5>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} placeholder="Reward Amount" type="number" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method:'PUT', body: JSON.stringify(Number(adminPromoReward))});
                   alert("Promo Code Created!"); setAdminPromoCode(''); setAdminPromoReward(''); fetchData();
                }}>Save Code</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> for every referral!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          <h4 style={{marginTop: 15}}>Total Referrals: {referrals.length}</h4>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Buy VIP ({APP_CONFIG.VIP_PRICE})</h3>
            <p style={{fontSize: 12}}>Send payment to the address below:</p>
            <div style={{display:'flex', gap: 5, marginBottom: 10}}>
                <input style={{...styles.input, marginBottom:0}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                <button style={{...styles.adminBtn, height: 40}} onClick={() => copyText(APP_CONFIG.ADMIN_WALLET)}>Copy</button>
            </div>
            <p style={{fontSize: 12}}>Required Memo (UID):</p>
            <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom:0}} readOnly value={APP_CONFIG.MY_UID} />
                <button style={{...styles.adminBtn, height: 40}} onClick={() => copyText(APP_CONFIG.MY_UID)}>Copy</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Withdraw Funds</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Wallet Address" onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => handleAction(async () => {
              const amount = Number(withdrawAmount);
              if(amount < 0.1) return alert("Minimum withdrawal is 0.1 TON.");
              if(amount > balance) return alert("Insufficient balance.");
              
              const h = [{ amount, status: 'Pending', timestamp: Date.now(), date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((balance - amount).toFixed(5)), withdrawHistory: h })
              });
              alert("Withdrawal Requested! Processed in 5 mins."); 
              fetchData();
              setWithdrawAmount('');
            })}>WITHDRAW NOW</button>
          </div>

          <div style={styles.card}>
            <h3>Transaction History</h3>
            {withdrawHistory.map((w, i) => (
               <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                  <span>{w.amount} TON</span>
                  <span style={{color: w.status === 'Pending' ? 'orange' : 'green', fontWeight:'bold'}}>{w.status}</span>
               </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Current Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Account Status: {isVip ? "VIP Member ⭐" : "Standard User"}</p>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleAction(() => setActiveNav(n))} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
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
  { id: 's1', name: "@GrowTeaNews Channel", link: "https://t.me/GrowTeaNews" },
  { id: 's10', name: "@EasyTonFree Channel", link: "https://t.me/easytonfree" }
];

export default App;
