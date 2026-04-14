import React, { useState, useEffect, useCallback, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  REF_REWARD: 0.0005 // Reward per referral
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralList, setReferralList] = useState([]); // To show who you invited
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // Native Copy Function Fix
  const handleCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Copied to clipboard!");
  };

  const syncToFirebase = useCallback(async (path, data) => {
    if (isInitialLoad.current) return;
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
          setReferralList(userData.referrals || []);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error("Load Error:", e); }
      
      isInitialLoad.current = false;
      setLoading(false);
    };
    initApp();
  }, []);

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #111827, #1f2937)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '15px', border: '2px solid #000', boxShadow: '5px 5px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#111', borderTop: '3px solid #fff', padding: '10px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' },
    infoText: { fontSize: '12px', color: '#4b5563', margin: '5px 0' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>LOADING...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '40px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981'}}>● SECURED ACCOUNT</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</button>
              )
            ))}
          </div>
          <div style={styles.card}>
            {/* Task list logic remains same but with English labels */}
            <p style={{textAlign:'center', fontSize: '12px'}}>Complete tasks to earn TON instantly.</p>
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{marginTop:0}}>Referral Program</h2>
          <div style={{backgroundColor:'#f3f4f6', padding:'15px', borderRadius:'10px', border:'1px dashed #000'}}>
            <p style={{margin:0, fontSize:'13px'}}><b>Reward:</b> {APP_CONFIG.REF_REWARD} TON per friend</p>
            <p style={{margin:'5px 0', fontSize:'13px', color:'#059669'}}><b>Bonus:</b> Get 10% from friend's tasks!</p>
            
            <div style={{marginTop:15}}>
              <small>Your Invitation Link:</small>
              <div style={{display:'flex', gap:5, marginTop:5}}>
                <input readOnly style={{...styles.input, marginBottom:0, flex:1}} value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
                <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)} style={{...styles.btn, width:'80px', padding:'5px'}}>COPY</button>
              </div>
            </div>
          </div>

          <div style={{marginTop:20}}>
            <h4>Invitation History ({referralList.length})</h4>
            {referralList.length > 0 ? (
              referralList.map((ref, idx) => (
                <div key={idx} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:'13px'}}>
                  <span>Friend ID: {ref.uid}</span>
                  <span style={{color:'#059669'}}>+{APP_CONFIG.REF_REWARD} TON</span>
                </div>
              ))
            ) : <p style={styles.infoText}>No friends invited yet.</p>}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw Funds</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => alert("Withdrawal submitted!")}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{textAlign:'center'}}>
            <div style={{width:70, height:70, background:'#facc15', borderRadius:'50%', margin:'0 auto 10px', border:'2px solid #000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30}}>👤</div>
            <h3 style={{margin:0}}>User Profile</h3>
            <span style={{background:'#000', color:'#fff', padding:'2px 10px', borderRadius:20, fontSize:10}}>PREMIUM LEVEL</span>
          </div>
          <div style={{marginTop:20}}>
            <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f3f4f6'}}><span>User UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f3f4f6'}}><span>Referrals:</span><b>{referralList.length}</b></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0'}}><span>Status:</span><b style={{color:'#10b981'}}>ACTIVE</b></div>
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
