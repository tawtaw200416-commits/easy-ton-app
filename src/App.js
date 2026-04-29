import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

// --- CONFIGURATION ---
const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  AD_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0009, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // User States
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Admin Search & Edit States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();

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
    } catch (e) { console.error("Fetch Error:", e); }
  }, []);

  // --- REFERRAL SYSTEM ---
  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    if (startParam && !localStorage.getItem(`joined_${APP_CONFIG.MY_UID}`) && startParam !== APP_CONFIG.MY_UID) {
      try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`);
        const inviter = await res.json();
        if (inviter) {
          const newBal = Number((Number(inviter.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newRefs = inviter.referrals ? [...Object.values(inviter.referrals), { id: APP_CONFIG.MY_UID }] : [{ id: APP_CONFIG.MY_UID }];
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, referrals: newRefs })
          });
          localStorage.setItem(`joined_${APP_CONFIG.MY_UID}`, 'true');
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    fetchData();
    handleReferral();
    const inv = setInterval(fetchData, 20000);
    return () => clearInterval(inv);
  }, [fetchData, handleReferral]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, balance.toString());
    localStorage.setItem(`comp_tasks_${APP_CONFIG.MY_UID}`, JSON.stringify(completed));
    localStorage.setItem(`wd_hist_${APP_CONFIG.MY_UID}`, JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // --- AD LOGIC & REWARD ---
  const processReward = (id, amount) => {
    // VPN check logic can be added here via external API if needed
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          finalizeReward(id, amount);
        } else {
          alert("Ad not finished or VPN detected. Please turn off VPN.");
        }
      }).catch(() => {
        // Fallback to Advertica link if Adsgram fails
        window.open(APP_CONFIG.AD_URL, '_blank');
        setTimeout(() => finalizeReward(id, amount), 5000);
      });
    } else {
      window.open(APP_CONFIG.AD_URL, '_blank');
      setTimeout(() => finalizeReward(id, amount), 5000);
    }
  };

  const finalizeReward = (id, amount) => {
    let reward = amount;
    let isWatch = id === 'watch_ad';
    if (isWatch) reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    const newBal = Number((balance + reward).toFixed(5));
    const newAds = isWatch ? adsWatched + 1 : adsWatched;
    const newComp = !isWatch ? [...completed, id] : completed;

    setBalance(newBal);
    setAdsWatched(newAds);
    setCompleted(newComp);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, adsWatched: newAds, completed: newComp })
    });
    alert(`Success: +${reward} TON`);
  };

  // --- HANDLERS ---
  const handleTask = (task) => {
    if (completed.includes(task.id)) return alert("Already done!");
    tg?.openTelegramLink ? tg.openTelegramLink(task.link) : window.open(task.link, '_blank');
    setTimeout(() => processReward(task.id, 0.001), 2000);
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW || amt > balance || !withdrawAddress) return alert("Invalid Input");
    
    const entry = { amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' };
    const newHist = [entry, ...withdrawHistory];
    const newBal = Number((balance - amt).toFixed(5));

    setBalance(newBal);
    setWithdrawHistory(newHist);
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: newHist })
    });
    alert("Withdrawal Requested!");
    setWithdrawAmount('');
  };

  // --- STYLES ---
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', marginBottom: '15px' },
    card: { background: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px' }
  };

  // --- FIXED DATA ---
  const tasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606", type: 'bot' },
    { id: 's1', name: "@easytonfree", link: "https://t.me/easytonfree", type: 'social' }
  ];

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>BALANCE {isVip && "⭐ VIP"}</small>
        <h1 style={{ fontSize: '32px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
        <small>Ads: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ ...styles.card, background: '#000', color: '#fff', textAlign: 'center' }}>
            <p>Watch Ads to Earn</p>
            <button style={{ ...styles.btn, background: '#facc15', color: '#000' }} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'CODE', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #000', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...tasks, ...customTasks].filter(x => x.type === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => handleTask(t)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}

            {activeTab === 'code' && (
              <div>
                <input style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                   const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${rewardCodeInput}.json`);
                   const d = await r.json();
                   if(d && !completed.includes('c_'+rewardCodeInput)) processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD);
                   else alert("Invalid or Used!");
                }}>CLAIM</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{marginTop:0}}>Admin Panel</h4>
                <input style={{width:'100%', padding:'8px', marginBottom:'5px', boxSizing:'border-box'}} placeholder="Search User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={{...styles.btn, background:'#f59e0b'}} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("Not Found");
                }}>FIND USER</button>

                {searchedUser && (
                  <div style={{marginTop:'10px', background:'#eee', padding:'10px', borderRadius:'10px'}}>
                    <p>Bal: {searchedUser.balance} | VIP: {searchedUser.isVip ? "Yes" : "No"}</p>
                    <input type="number" style={{width:'100%', padding:'5px', boxSizing:'border-box'}} value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, height:'30px', padding:0, marginTop:'5px'}} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Updated");
                    }}>SAVE BALANCE</button>
                    <button style={{...styles.btn, background:'blue', height:'30px', padding:0, marginTop:'5px'}} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({isVip: true})});
                      alert("VIP Done");
                    }}>GIVE VIP</button>
                  </div>
                )}
                <hr/>
                <h5>Add Task</h5>
                <input style={{width:'100%', padding:'5px', marginBottom:'5px', boxSizing:'border-box'}} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={{width:'100%', padding:'5px', marginBottom:'5px', boxSizing:'border-box'}} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background:'green'}} onClick={async () => {
                  const id = 't_'+Date.now();
                  await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method:'PUT', body: JSON.stringify({id, name: adminTaskName, link: adminTaskLink, type: adminTaskType})});
                  alert("Task Added"); fetchData();
                }}>ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw</h3>
          <input style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW</button>
          
          <h4 style={{ marginTop: '20px' }}>History</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
              <span>{h.amount} TON - {h.date}</span>
              <span style={{ color: h.status === 'Success' ? 'green' : 'orange' }}>{h.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn {APP_CONFIG.REFER_REWARD} TON per referral.</p>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          <div style={{marginTop: '15px'}}>
            <h4>Referrals: {referrals.length}</h4>
          </div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
