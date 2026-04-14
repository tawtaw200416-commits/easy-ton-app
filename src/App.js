import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // --- Fixed Social & Bot Tasks (ဒါတွေက အမြဲပေါ်နေမှာပါ) ---
  const staticSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews", type: 'social' },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews", type: 'social' },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree", type: 'social' },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO", type: 'social' }
  ];

  const staticBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID, type: 'bot' },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD", type: 'bot' },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID, type: 'bot' }
  ];

  const syncToFirebase = useCallback(async (path, data) => {
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (e) { console.error("Sync Error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const initApp = async () => {
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
          setReferralCount(userData.referralCount || 0);
        } else {
          await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {
            balance: 0, completed: [], withdrawHistory: [], referralCount: 0, uid: APP_CONFIG.MY_UID
          });
        }

        if (tasksData) {
          setCustomTasks(Object.values(tasksData));
        }
      } catch (e) { console.error("Load Error:", e); }
      setLoading(false);
    };

    initApp();
  }, [syncToFirebase]);

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    window.open(link, '_blank');
    
    const completeTask = () => {
      setBalance(prev => {
        const newBal = Number((prev + 0.0005).toFixed(5));
        setCompleted(prevComp => {
          const newComp = [...prevComp, id];
          syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
          return newComp;
        });
        return newBal;
      });
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '12px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '10px', fontWeight: 'bold' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', fontSize:20, fontWeight:'bold'}}>SYNCING SECURE DATA...</div>;

  const currentTasks = activeTab === 'bot' 
    ? [...staticBotTasks, ...customTasks.filter(t => t.type === 'bot')] 
    : [...staticSocialTasks, ...customTasks.filter(t => t.type === 'social')];

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED & SECURED</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' ? (
              <div>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={styles.btn} onClick={() => {
                   const tid = 'task_' + Date.now();
                   syncToFirebase(`global_tasks/${tid}`, {...newTask, id: tid}).then(() => window.location.reload());
                }}>PUBLISH TASK</button>
              </div>
            ) : (
              currentTasks.map(t => (
                <div key={t.id} style={styles.row}>
                  <b>{t.name}</b>
                  <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px', opacity: completed.includes(t.id) ? 0.3 : 1}}>
                    {completed.includes(t.id) ? 'DONE' : 'START'}
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL</h2>
          <div style={{background:'#f3f4f6', padding:'15px', borderRadius:'15px', border:'2px dashed #000'}}>
             <small>YOUR INVITE LINK:</small>
             <p style={{fontSize:'12px', fontWeight:'bold', wordBreak:'break-all', margin:'10px 0'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
             <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          </div>
          <div style={{marginTop:20, textAlign:'center'}}>Referrals: <b>{referralCount} Users</b></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if (amt >= 0.1 && balance >= amt) {
              const newBal = Number((balance - amt).toFixed(5));
              const newHis = [{id: Date.now(), amount: amt, status: 'Pending', date: new Date().toLocaleDateString()}, ...withdrawHistory];
              setBalance(newBal); setWithdrawHistory(newHis);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHis });
              alert("Submitted!"); setWithdrawAmount('');
            } else { alert("Insufficient balance or Min 0.1!"); }
          }}>WITHDRAW NOW</button>
          <div style={{marginTop:20}}>
            <h4>HISTORY</h4>
            {withdrawHistory.map(h => (
              <div key={h.id} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange', fontWeight:'bold'}}>{h.status}</span></div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Balance:</span><b>{balance.toFixed(5)} TON</b></div>
          <p style={{fontSize:11, color:'red', marginTop:15, textAlign:'center'}}>⚠️ Security: Multi-accounts are not allowed.</p>
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
