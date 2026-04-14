import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  const isInitialLoad = useRef(true); // Data overwrite မဖြစ်အောင် တားဖို့
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // Tasks List အပြည့်အစုံ
  const staticBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
  ];

  const staticSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" }
  ];

  const syncToFirebase = useCallback(async (path, data) => {
    if (isInitialLoad.current) return; // Load မပြီးခင် data မပို့အောင်တားထားမယ်
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
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error("Load Error:", e); }
      
      isInitialLoad.current = false; // Data load ပြီးပြီဖြစ်တဲ့အတွက် sync လုပ်လို့ရပြီ
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    window.open(link, '_blank');
    const complete = () => {
      const newBalance = Number((balance + 0.0005).toFixed(5));
      const newCompleted = [...completed, id];
      setBalance(newBalance);
      setCompleted(newCompleted);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
      alert("Reward +0.0005 TON!");
    };
    setTimeout(complete, 5000); 
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '30px', marginBottom: '20px', border: '4px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    badge: { background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    promoBox: { backgroundColor: '#f8fafc', padding: '15px', borderRadius: '15px', border: '2px dashed #000', margin: '15px 0' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', fontWeight:'bold'}}>SYNCING DATA...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px' }}>AVAILABLE BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '48px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:18, color:'#facc15'}}>TON</span></h1>
        <div style={{display:'flex', justifyContent:'center', gap: '5px'}}><span style={styles.badge}>● VERIFIED</span></div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>
                  {showAddPromo ? '✖ CLOSE' : '+ ADD TASK (PROMOTE)'}
                </button>
                {showAddPromo ? (
                  <div>
                    <input style={styles.input} placeholder="Channel Name" />
                    <input style={styles.input} placeholder="Link (https://t.me/...)" />
                    <div style={styles.promoBox}>
                      <small><b>PAY TO ADMIN WALLET:</b></small>
                      <p style={{fontSize:'10px', wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                      <small><b>MEMO (YOUR UID):</b></small>
                      <h3 style={{margin:0, color:'#e11d48'}}>{APP_CONFIG.MY_UID}</h3>
                    </div>
                    <button style={styles.btn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF</button>
                  </div>
                ) : (
                  [...staticSocialTasks, ...customTasks.filter(t => t.type === 'social')].map(t => (
                    <div key={t.id} style={styles.row}>
                      <b>{t.name}</b>
                      <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px', opacity: completed.includes(t.id) ? 0.3 : 1}}>
                        {completed.includes(t.id) ? 'DONE' : 'JOIN'}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'bot' && [...staticBotTasks, ...customTasks.filter(t => t.type === 'bot')].map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px', opacity: completed.includes(t.id) ? 0.3 : 1}}>
                  {completed.includes(t.id) ? 'DONE' : 'START'}
                </button>
              </div>
            ))}

            {activeTab === 'admin' && (
              <div>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <button style={styles.btn} onClick={() => {
                   const tid = 'task_' + Date.now();
                   syncToFirebase(`global_tasks/${tid}`, {...newTask, id: tid}).then(() => window.location.reload());
                }}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL SYSTEM</h2>
          <div style={styles.promoBox}>
            <small>SHARE THIS LINK:</small>
            <p style={{fontSize:'11px', fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button style={styles.btn} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}}>COPY LINK</button>
          </div>
          <div style={{textAlign:'center'}}>Total Referrals: <b>{referralCount}</b></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if (amt >= 0.1 && balance >= amt) {
              const nb = Number((balance - amt).toFixed(5));
              const nh = [{id: Date.now(), amount: amt, status: 'Pending'}, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb, withdrawHistory: nh });
              alert("Submitted!"); setWithdrawAmount('');
            } else { alert("Insufficient Balance!"); }
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
          <div style={{textAlign:'center', marginBottom:'20px'}}>
             <div style={{width:'80px', height:'80px', background:'#facc15', borderRadius:'50%', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #000', fontSize:'30px'}}>👤</div>
             <h2 style={{margin:0}}>USER PROFILE</h2>
             <span style={styles.badge}>PREMIUM MEMBER</span>
          </div>
          <div style={styles.row}><span>UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>BALANCE:</span><b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>TOTAL TASKS:</span><b>{completed.length}</b></div>
          <div style={styles.row}><span>REFERRALS:</span><b>{referralCount}</b></div>
          <p style={{fontSize:'10px', color:'red', textAlign:'center', marginTop:'20px'}}>⚠️ Warning: One account per device only.</p>
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
