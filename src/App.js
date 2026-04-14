import React, { useState, useEffect, useRef } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "http://t.me/EasyTonHelp_Bot",
  ADMIN_BOT_TOKEN: "8181403217:AAG6j7tS7Ue_qR-l7I1B7H0i9m_P3ZzS7f4",
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralList, setReferralList] = useState([]);
  const [customTasks, setCustomTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const isDataLoaded = useRef(false);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [promoForm, setPromoForm] = useState({ name: '', link: '', plan: '100 Views - 0.2 TON' });

  // --- Firebase Sync Function ---
  const syncToFirebase = (path, data) => {
    if (!isDataLoaded.current) return;
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  // --- Admin Notification ---
  const notifyAdmin = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  // --- Initial Data Loading ---
  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const loadData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralList(userData.referralList || []);
        } else {
          // New User Creation
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify({ balance: 0, completed: [], withdrawHistory: [], referralList: [] })
          });
        }

        if (tasksData) {
          const taskArray = Object.keys(tasksData).map(key => ({ ...tasksData[key], id: key }));
          setCustomTasks(taskArray);
        }
        
        isDataLoaded.current = true;
        setLoading(false);
      } catch (e) { setLoading(false); }
    };

    loadData();
  }, []);

  // --- Task Handling ---
  const handleTaskAction = (id, link, reward = 0.0005) => {
    window.open(link, '_blank');
    setTimeout(() => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + reward).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert(`Success! +${reward} TON Added.`);
      }
    }, 5000);
  };

  // --- Ads Watching ---
  const handleWatchAds = () => {
    const complete = () => {
      const newBal = Number((balance + 0.0001).toFixed(5));
      setBalance(newBal);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
      alert("Ad Reward Received! +0.0001 TON");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(complete).catch(() => setTimeout(complete, 2000));
    } else {
      setTimeout(complete, 2000);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const requestTime = Date.now();
      const newHistory = [{ id: requestTime, amount, status: 'Pending', timestamp: requestTime }, ...withdrawHistory];
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, withdrawHistory: newHistory });
      notifyAdmin(`🚀 Withdrawal!\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amount} TON`);
      alert("Success! Pending approval (24h).");
      setWithdrawAmount('');
    } else { alert("Insufficient Balance (Min 0.1)"); }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      if (tg) tg.HapticFeedback.notificationOccurred('success');
      alert(`${label} Copied!`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    promoBox: { backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '15px', border: '2px dashed #000', margin: '15px 0' },
    adsBox: { background: 'linear-gradient(to right, #000, #334155)', color: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #fff' }
  };

  const botList = [
    { id: 'b1', name: "Grow Tea Bot", link: `https://t.me/GrowTeaBot/app?startapp=${APP_CONFIG.MY_UID}` },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED ACCOUNT</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
              <>
                <div style={styles.adsBox}>
                  <div><b>VIDEO ADS</b><br/><small style={{color: '#facc15'}}>+0.0001 TON / Reward</small></div>
                  <button onClick={handleWatchAds} style={{...styles.btn, width: '80px', padding: '8px', background: '#facc15', color: '#000'}}>WATCH</button>
                </div>
                {botList.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
                ))}
              </>
            )}

            {activeTab === 'social' && !showAddPromo && (
              <>
                <button style={{...styles.btn, background:'#facc15', color:'#000', border:'2px solid #000', marginBottom: 15}} onClick={() => setShowAddPromo(true)}>+ ADD TASK (PROMOTE)</button>
                {customTasks.filter(t => t.type === 'social' && !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {showAddPromo && (
              <div>
                <h3 style={{marginTop:0}}>PROMOTE YOUR AD</h3>
                <input style={styles.input} placeholder="Channel/Bot Name" value={promoForm.name} onChange={e => setPromoForm({...promoForm, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://t.me/...)" value={promoForm.link} onChange={e => setPromoForm({...promoForm, link: e.target.value})} />
                <select style={styles.input} value={promoForm.plan} onChange={e => setPromoForm({...promoForm, plan: e.target.value})}>
                    <option value="100 Views - 0.2 TON">100 Views - 0.2 TON</option>
                    <option value="500 Views - 0.8 TON">500 Views - 0.8 TON</option>
                </select>
                <div style={styles.promoBox}>
                  <small><b>PAY TO:</b> {APP_CONFIG.ADMIN_WALLET}</small><br/>
                  <small><b>REQUIRED MEMO:</b> <b style={{color:'red'}}>{APP_CONFIG.MY_UID}</b></small>
                </div>
                <button style={styles.btn} onClick={() => {
                   const msg = encodeURIComponent(`🚀 PROMOTIONAL REQUEST:\nUID: ${APP_CONFIG.MY_UID}\nName: ${promoForm.name}\nPlan: ${promoForm.plan}`);
                   window.open(`https://t.me/GrowTeaNews?text=${msg}`);
                }}>I HAVE PAID (SEND PROOF)</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3>ADMIN: ADD GLOBAL TASK</h3>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.btn} onClick={() => {
                  const id = 'task_' + Date.now();
                  syncToFirebase(`global_tasks/${id}`, {...newTask, id}).then(() => {
                    alert("Published!"); window.location.reload();
                  });
                }}>PUBLISH TO ALL</button>
              </div>
            )}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                   if(rewardInput === "FREE500") {
                      alert("Code Claimed!"); // Logic can be added here
                   } else { alert("Invalid Code"); }
                }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRALS</h2>
          <div style={styles.promoBox}>
            <small>YOUR INVITE LINK:</small>
            <p style={{fontSize:11, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.btn}>COPY LINK</button>
          </div>
          <h4>HISTORY</h4>
          {referralList.length === 0 ? <small>No referrals yet.</small> : referralList.map((uid, i) => (
            <div key={i} style={styles.row}><span>User: {uid}</span><span style={{color:'#10b981'}}>+0.0005 TON</span></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div>
          <div style={styles.card}>
            <h2 style={{textAlign:'center', marginTop:0}}>MY PROFILE</h2>
            <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
            <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
            <button style={{...styles.btn, background:'#facc15', color:'#000', marginTop:15}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>HELP CENTER</button>
          </div>
          <div style={{backgroundColor:'#fee2e2', color:'#b91c1c', padding:'15px', borderRadius:'15px', fontSize:'12px', border:'1px solid #f87171'}}>
            <b>⚠️ WARNING:</b> Automation or fake accounts will lead to a permanent ban.
          </div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
