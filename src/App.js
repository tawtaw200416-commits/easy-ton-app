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
      alert(`Wait! Please stay on the page for ${requiredSeconds} seconds to verify. (${Math.ceil(requiredSeconds - elapsed)}s left)`);
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const handleAction = (callback) => {
    // Navigation doesn't require ad stay, but task completion does
    callback();
  };

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

  const processReward = async (id, amt) => {
    const timeLimit = id === 'watch_ad' ? 30 : 15;
    
    // Validate if user stayed long enough
    if (!checkAdStay(timeLimit)) return;

    if (id !== 'watch_ad' && completed.includes(id)) {
        alert("Task already completed!");
        return;
    }

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
    
    alert(`Reward Added! +${rewardAmt} TON`);
    setLastAdClickTime(0); // Reset timer after success
    fetchData();
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    watchBtn: { background: '#facc15', color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginTop: '10px', width: '100%' },
    adminBtn: { padding: '8px 15px', background: '#000', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none' },
    delBtn: { background: '#ef4444', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', border: 'none', cursor: 'pointer', marginLeft: '5px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>{isSyncing ? "SYNCHRONIZING..." : "TOTAL BALANCE"}</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:'bold'}}>VIP ⭐</span>}
        <button style={styles.watchBtn} onClick={() => { triggerAdsSequence(); setTimeout(() => processReward('watch_ad', 0), 1000) }}>
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
                <div style={{display:'flex', gap:'5px'}}>
                   {!completed.includes(t.id) ? (
                     <>
                       <button onClick={() => { triggerAdsSequence(); window.open(t.link); }} style={styles.adminBtn}>START</button>
                       <button onClick={() => processReward(t.id, 0.001)} style={{...styles.adminBtn, backgroundColor: '#22c55e'}}>VERIFY</button>
                     </>
                   ) : <span style={{color: '#888', fontWeight: 'bold'}}>COMPLETED</span>}
                </div>
              </div>
            ))}
            {activeTab === 'social' && [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id) ? 0.5 : 1}}>{t.name}</span>
                <div style={{display:'flex', gap:'5px'}}>
                   {!completed.includes(t.id) ? (
                     <>
                       <button onClick={() => { triggerAdsSequence(); window.open(t.link); }} style={styles.adminBtn}>JOIN</button>
                       <button onClick={() => processReward(t.id, 0.001)} style={{...styles.adminBtn, backgroundColor: '#22c55e'}}>VERIFY</button>
                     </>
                   ) : <span style={{color: '#888', fontWeight: 'bold'}}>COMPLETED</span>}
                </div>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if (completed.includes(`promo_${rewardCodeInput}`)) return alert("Code already used!");
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) {
                    triggerAdsSequence();
                    setTimeout(() => processReward(`promo_${rewardCodeInput}`, found.reward), 1000);
                  } else alert("Invalid Code");
                }}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h3 style={{borderBottom:'2px solid #000', paddingBottom: 5}}>Admin Panel</h3>
                
                <h5>User Lookup</h5>
                <input style={styles.input} placeholder="User Telegram ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.adminBtn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); alert("User Found"); } else alert("User not found");
                }}>Search User</button>
                
                {searchedUser && (
                  <div style={{background:'#f0f0f0', padding: 10, borderRadius: 10, marginTop: 10}}>
                    <p>ID: {searchUserId}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.adminBtn} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Balance Updated Successfully");
                    }}>Save Balance</button>
                    <button style={{...styles.adminBtn, background: searchedUser.isVip ? '#ef4444' : '#22c55e', marginLeft: 5}} onClick={async () => {
                        const newVip = !searchedUser.isVip;
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({isVip: newVip})});
                        alert(`VIP ${newVip ? 'Activated' : 'Deactivated'}`);
                    }}>Toggle VIP</button>
                  </div>
                )}

                <h5 style={{marginTop: 20}}>Promo Code Manager</h5>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} placeholder="Reward Amount" type="number" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method:'PUT', body: JSON.stringify(Number(adminPromoReward))});
                   alert("Promo Code Created");
                   setAdminPromoCode(''); setAdminPromoReward(''); fetchData();
                }}>Create Code</button>

                <h5 style={{marginTop: 20}}>Global Task Manager</h5>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Task URL" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                   <option value="bot">Bot Task</option>
                   <option value="social">Social Task</option>
                </select>
                <button style={styles.btn} onClick={async () => {
                   const id = 'task_' + Date.now();
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method:'PUT', body: JSON.stringify({id, name: adminTaskName, link: adminTaskLink, type: adminTaskType})});
                   alert("Task Added"); setAdminTaskName(''); setAdminTaskLink(''); fetchData();
                }}>Add Task</button>

                <div style={{marginTop: 15}}>
                    {customTasks.map(t => (
                        <div key={t.firebaseKey} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #ddd'}}>
                            <span style={{fontSize: 12}}>{t.name}</span>
                            <button style={styles.delBtn} onClick={async () => {
                                if(window.confirm("Delete this task?")) {
                                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${t.firebaseKey}.json`, { method:'DELETE' });
                                    fetchData();
                                }
                            }}>X</button>
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
          <h3>Invite Friends</h3>
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> for every friend you bring!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          <h4 style={{marginTop: 15}}>Referral Count: {referrals.length}</h4>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>VIP Upgrade (0.5 TON)</h3>
            <p style={{fontSize: 12}}>Send payment to the following address and memo:</p>
            <div style={{display:'flex', gap: 5, marginBottom: 10}}>
                <input style={{...styles.input, marginBottom:0}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                <button style={{...styles.adminBtn, height: 40}} onClick={() => copyText(APP_CONFIG.ADMIN_WALLET)}>Copy</button>
            </div>
            <p style={{fontSize: 12}}>Memo (Required):</p>
            <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom:0}} readOnly value={APP_CONFIG.MY_UID} />
                <button style={{...styles.adminBtn, height: 40}} onClick={() => copyText(APP_CONFIG.MY_UID)}>Copy</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Minimum 0.1 TON" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => {
              const amount = Number(withdrawAmount);
              if(amount < 0.1) return alert("Minimum withdrawal is 0.1 TON.");
              if(amount > balance) return alert("Insufficient balance.");
              if(!withdrawAddress) return alert("Please enter wallet address.");
              
              triggerAdsSequence();
              setTimeout(async () => {
                const h = [{
                    amount: amount, 
                    status: 'Pending', 
                    timestamp: Date.now(), 
                    date: new Date().toLocaleString()
                  }, ...withdrawHistory];

                  await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                    method:'PATCH', 
                    body: JSON.stringify({
                      balance: Number((balance - amount).toFixed(5)), 
                      withdrawHistory: h
                    })
                  });
                  alert("Withdrawal Requested! Will process in 5 minutes."); 
                  fetchData();
                  setWithdrawAmount('');
              }, 1000);
            }}>WITHDRAW NOW</button>
          </div>

          <div style={styles.card}>
            <h3>Payment History</h3>
            {withdrawHistory.length === 0 ? <p style={{fontSize: 12, color: '#888'}}>No history found.</p> : 
             withdrawHistory.map((w, i) => (
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
          <p>Account UID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Current Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Account Type: {isVip ? <b style={{color: '#facc15'}}>VIP ⭐</b> : "Standard"}</p>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

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

const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606", type: 'bot' },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD", type: 'bot' }
];

const fixedSocialTasks = [
  { id: 's1', name: "Subscribe GrowTea News", link: "https://t.me/GrowTeaNews", type: 'social' },
  { id: 's10', name: "Join EasyTon Channel", link: "https://t.me/easytonfree", type: 'social' }
];

export default App;
