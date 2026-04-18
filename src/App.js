import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

// Application Configuration
const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001
};

function App() {
  // --- States ---
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: '', link: '', package: '100 Views - 0.2 TON' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [isAdLoading, setIsAdLoading] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // --- Helper Functions ---
  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const sendAdminNotify = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then((result) => { 
            setIsAdLoading(false); 
            if (result.done && callback) callback(); 
        })
        .catch((err) => { 
            setIsAdLoading(false); 
            alert("Ad failed to load. Please disable VPN or check network connection."); 
        });
    } else {
      alert("Adsgram not connected. Please ensure index.html includes the script and VPN is off.");
    }
  };

  const fetchGlobalTasks = async () => {
    try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
        const data = await res.json();
        if (data) setCustomTasks(Object.values(data));
    } catch(e) { console.error("Task Error:", e); }
  };

  // --- Initialization ---
  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    const initApp = async () => {
      try {
        const userRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
        const userData = await userRes.json();
        if (userData) {
          setBalance(Number(userData.balance || 0));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        await fetchGlobalTasks();
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      if (link) window.open(link, '_blank');
      alert(`Success! +${reward} TON added to your balance.`);
    });
  };

  // --- UI Styles ---
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: '-apple-system, sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', transition: '0.2s active' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold', cursor:'pointer' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' },
    badge: { background: '#facc15', border: '1px solid #000', borderRadius: '5px', padding: '4px 8px', fontSize: '10px', cursor:'pointer', fontWeight:'bold' }
  };

  // --- Task Data ---
  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b_wt', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b_eb', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" }
  ];

  const defaultSocials = ["@GrowTeaNews", "@GoldenMinerNews", "@ADS_TON1", "@easytonfree", "@WORLDBESTCRYTO1"];

  const allBotTasks = [...defaultBots, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [
    ...defaultSocials.map(name => ({id: name, name, link: `https://t.me/${name.replace('@','')}`})), 
    ...customTasks.filter(t => t.type === 'social')
  ];

  if (loading) return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center', background:'#facc15', fontWeight:'bold', letterSpacing:'2px'}}>LOADING...</div>;

  return (
    <div style={styles.main}>
      {/* Balance Header */}
      <div style={styles.header}>
        <small style={{ color: '#facc15', fontWeight:'800' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● SYSTEM ACTIVE</div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Main Ad Button */}
          <div style={styles.card}>
            <button onClick={() => runTaskWithAd(() => {
               const newBal = Number((balance + 0.0001).toFixed(5));
               setBalance(newBal);
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert("Fast reward claimed! +0.0001 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444', boxShadow: '0 4px 0 #991b1b'}}>📺 WATCH VIDEO (FAST REWARD)</button>
          </div>

          {/* Sub Tabs */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          {/* Task Lists */}
          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.0005, t.link)} style={{...styles.btn, width: '80px', padding: '8px', fontSize:'12px'}}>START</button></div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ PROMOTE YOUR CHANNEL</button>
                {showAddPromo && (
                  <div style={{marginBottom:'20px', padding:'10px', border:'1px solid #ddd', borderRadius:'10px'}}>
                    <input style={styles.input} placeholder="Channel Name" onChange={e => setPromoForm({...promoForm, name: e.target.value})} />
                    <input style={styles.input} placeholder="Channel Link" onChange={e => setPromoForm({...promoForm, link: e.target.value})} />
                    <button style={{...styles.btn, backgroundColor:'#3b82f6'}} onClick={() => {
                        sendAdminNotify(`📢 NEW PROMO REQUEST: ${promoForm.name}\nLink: ${promoForm.link}`);
                        window.open(APP_CONFIG.HELP_BOT);
                    }}>CONTACT FOR APPROVAL</button>
                  </div>
                )}
                {allSocialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.0005, t.link)} style={{...styles.btn, width: '80px', padding: '8px', fontSize:'12px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{textAlign:'center', padding:'10px'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                    handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, APP_CONFIG.REWARD_AMT, null);
                  } else alert("Invalid promo code.");
                }}>CLAIM {APP_CONFIG.REWARD_AMT} TON</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
                <div style={{padding:'10px'}}>
                    <h4 style={{marginTop:0}}>SYSTEM ADMIN</h4>
                    <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                    <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                    <button style={styles.btn} onClick={() => {
                        const id = "task_" + Date.now();
                        syncToFirebase(`global_tasks/${id}`, {...newTask, id}).then(() => { alert("Global task added!"); fetchGlobalTasks(); });
                    }}>PUBLISH TO ALL</button>
                </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRALS</h2>
          <p style={{textAlign:'center', fontSize:14, color:'#666'}}>Earn 0.0005 TON for every active friend you invite.</p>
          <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', border:'2px dashed #000', wordBreak:'break-all', fontSize:'12px', textAlign:'center', marginBottom:'15px'}}>
            https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link copied to clipboard!");}} style={styles.btn}>COPY INVITE LINK</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{marginTop:0}}>WITHDRAW</h2>
          <p style={{fontSize:12, color:'#666'}}>Min: 0.1 TON. Payments are processed to your connected Telegram Wallet.</p>
          <input style={styles.input} type="number" placeholder="Amount (e.g. 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if(amt >= 0.1 && balance >= amt) {
              runTaskWithAd(() => {
                const newBal = Number((balance - amt).toFixed(5));
                const newHist = [{ id: Date.now(), amount: amt, status: 'Pending', date: Date.now() }, ...withdrawHistory];
                setBalance(newBal); setWithdrawHistory(newHist);
                syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHist });
                sendAdminNotify(`💰 WITHDRAWAL REQUEST: ${amt} TON\nUser UID: ${APP_CONFIG.MY_UID}`);
                alert("Withdrawal request submitted for review.");
              });
            } else alert("Insufficient balance or amount is below 0.1 TON.");
          }}>SUBMIT WITHDRAWAL</button>

          <h3 style={{marginTop:'30px', fontSize:'16px'}}>TRANSACTION HISTORY</h3>
          {withdrawHistory.length === 0 ? <p style={{fontSize:12, color:'#999'}}>No history found.</p> : withdrawHistory.map(h => (
              <div key={h.id} style={styles.row}>
                <span style={{fontSize:'13px'}}>{h.amount} TON</span>
                <span style={{color: '#f59e0b', fontSize:'11px', fontWeight:'bold'}}>{h.status}</span>
              </div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
          <div style={styles.row}><span>USER ID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>BALANCE:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <div style={styles.row}><span>TASKS:</span><strong>{completed.length} Completed</strong></div>
          <button style={{...styles.btn, marginTop:'20px', backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>HELP & SUPPORT</button>
        </div>
      )}

      {/* Navigation Bar */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
