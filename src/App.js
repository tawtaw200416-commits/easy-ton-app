import React, { useState, useEffect, useRef } from 'react';

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
  const isDataLoaded = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // --- Sync logic to prevent data loss ---
  const syncToFirebase = (path, data) => {
    if (!isDataLoaded.current) return; 
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const loadData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));

        isDataLoaded.current = true;
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert("COMPLETED! +0.0005 TON added to your balance.");
      }
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else {
      setTimeout(completeTask, 5000);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const newRecord = { 
        id: Date.now(), 
        amount: amount, 
        status: 'Pending', 
        date: new Date().toLocaleDateString() 
      };
      const updatedHistory = [newRecord, ...withdrawHistory];
      
      setBalance(newBalance);
      setWithdrawHistory(updatedHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { 
        balance: newBalance, 
        withdrawHistory: updatedHistory 
      });
      alert("SUCCESS! Withdrawal request submitted.");
      setWithdrawAmount('');
    } else {
      alert("INVALID AMOUNT! Minimum withdrawal is 0.1 TON.");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box', textAlign: 'center', fontWeight: 'bold' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>CONNECTING...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>
          <div style={styles.card}>
            {(activeTab === 'bot' ? [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" }
            ] : [
              { id: 's1', name: "Follow Channel", link: "https://t.me/easytonfree" }
            ]).concat(customTasks.filter(t => t.type === activeTab)).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                {completed.includes(t.id) ? <span style={{color:'green', fontWeight:'900'}}>SUCCESS</span> : <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button>}
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE FRIENDS</h2>
          <p style={{textAlign:'center', fontSize: '14px'}}>Earn <b>0.0005 TON</b> for each friend!</p>
          <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', border:'1px dashed #000', marginBottom:'15px', wordBreak:'break-all', textAlign:'center'}}>
            <strong>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</strong>
          </div>
          <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("LINK COPIED!");}} style={styles.yellowBtn}>COPY REFERRAL LINK</button>
          <div style={{marginTop:'20px', textAlign:'center'}}>Total Referrals: <b>{referralCount}</b></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{marginTop:0}}>WITHDRAW TON</h3>
            <input style={styles.input} type="number" placeholder="Min: 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
            <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          </div>
          <div style={styles.card}>
            <h4 style={{marginTop:0}}>WITHDRAWAL HISTORY</h4>
            {withdrawHistory.length === 0 ? <p style={{fontSize: '12px', color: '#666'}}>No history found.</p> : 
              withdrawHistory.map((h, i) => (
                <div key={i} style={styles.row}>
                  <div><small>{h.date}</small><br/><b>{h.amount} TON</b></div>
                  <span style={{color: h.status === 'Pending' ? 'orange' : 'green', fontWeight: 'bold'}}>{h.status}</span>
                </div>
              ))
            }
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
          <div style={styles.row}><span>User ID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <div style={styles.row}><span>Account:</span><span style={{color:'green', fontWeight:'bold'}}>VERIFIED</span></div>
          <button style={{...styles.yellowBtn, marginTop: '20px', backgroundColor: '#ef4444'}} onClick={() => window.location.reload()}>RELOAD APP</button>
        </div>
      )}

      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
