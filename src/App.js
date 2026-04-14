import React, { useState, useEffect, useCallback, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  REF_REWARD: 0.0005 
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralList, setReferralList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Anti-Overwrite Lock
  const isDataReady = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // Native Copy Fix
  const handleCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Copied!");
  };

  // Safe Sync: Use PATCH to prevent deleting other fields
  const syncToFirebase = useCallback(async (path, data) => {
    if (!isDataReady.current) return; // Stop if data isn't loaded yet
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
          // Keep existing data
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralList(userData.referrals || []);
        } else {
          // Initialize New User only if they don't exist
          const freshData = { balance: 0, completed: [], withdrawHistory: [], referrals: [], uid: APP_CONFIG.MY_UID };
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify(freshData)
          });
        }

        if (tasksData) setCustomTasks(Object.values(tasksData));
        
        isDataReady.current = true;
      } catch (e) {
        console.error("Init Error:", e);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return alert("Task already done!");
    window.open(link, '_blank');
    
    setTimeout(() => {
      const newBalance = Number((balance + 0.0005).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBalance);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newComp });
      alert("Success! +0.0005 TON");
    }, 5000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '15px', border: '2px solid #000', boxShadow: '5px 5px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SECURE LOADING...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '40px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</button>
              )
            ))}
          </div>
          <div style={styles.card}>
             {/* Dynamic Task Rendering */}
             {(activeTab === 'bot' ? [
                { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
                { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot" }
             ] : [
                { id: 's1', name: "@easytonfree", link: "https://t.me/easytonfree" }
             ]).map(t => (
               <div key={t.id} style={styles.row}>
                 <b>{t.name}</b>
                 <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{padding:'8px 15px', borderRadius:8, backgroundColor:'#000', color:'#fff', opacity: completed.includes(t.id) ? 0.3 : 1}}>
                    {completed.includes(t.id) ? 'DONE' : 'START'}
                 </button>
               </div>
             ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{marginTop:0}}>Referral Program</h2>
          <div style={{backgroundColor:'#f3f4f6', padding:'15px', borderRadius:'15px', border:'1px dashed #000'}}>
             <p style={{margin:0, fontSize:13}}>Earn 0.0005 TON per referral + 10% from their tasks!</p>
             <div style={{marginTop:10, display:'flex', gap:5}}>
                <input readOnly style={{flex:1, padding:10, borderRadius:8, border:'1px solid #000'}} value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
                <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)} style={{padding:'10px', borderRadius:8, backgroundColor:'#000', color:'#fff'}}>COPY</button>
             </div>
          </div>
          <h4 style={{marginBottom:5}}>Invite History ({referralList.length})</h4>
          {referralList.map((ref, idx) => (
            <div key={idx} style={styles.row}><span>User ID: {ref.uid}</span><span style={{color:'green'}}>+0.0005 TON</span></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw</h3>
          <input style={{width:'100%', padding:12, boxSizing:'border-box', marginBottom:10}} placeholder="Min 0.1 TON" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{textAlign:'center'}}>
            <div style={{width:60, height:60, background:'#facc15', borderRadius:'50%', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #000', fontSize:25}}>👤</div>
            <h3 style={{margin:0}}>User Profile</h3>
          </div>
          <div style={{marginTop:15}}>
             <div style={styles.row}><span>UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
             <div style={styles.row}><span>Balance:</span><b>{balance.toFixed(5)} TON</b></div>
             <div style={styles.row}><span>Status:</span><b style={{color:'green'}}>VERIFIED</b></div>
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
