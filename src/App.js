import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

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
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ link: '' });

  // Firebase မှ Data များကို အမြဲတမ်း Update ယူခြင်း
  const fetchData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await uRes.json();
      const tasksData = await tRes.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        // Firebase Object ကို Array ပြောင်းပြီး History ပြခြင်း
        setWithdrawHistory(userData.withdrawHistory ? Object.values(userData.withdrawHistory) : []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));
    } catch (e) { console.error("Firebase Error:", e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  // Adsgram ကြော်ငြာပြသရန် Function (အောင်မြင်မှ လုပ်ဆောင်ချက်ဆက်လုပ်မည်)
  const runWithAd = (callback) => {
    if (isAdLoading) return;
    setIsAdLoading(true);

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { 
            setIsAdLoading(false); 
            if (callback) callback(); 
        })
        .catch((err) => { 
            setIsAdLoading(false); 
            alert("Ads failed to load. Please try again.");
            console.error(err);
        });
    } else {
      setIsAdLoading(false);
      alert("Adsgram not ready. Please refresh.");
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already done!");
    runWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      if (link) window.open(link, '_blank');
      alert(`Claimed +${reward} TON!`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px' },
    header: { background: '#000', color: '#fff', padding: '25px', borderRadius: '25px', textAlign: 'center', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', border: '3px solid #000', marginBottom: '12px' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Connecting to Server...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color:'#facc15'}}>CURRENT BALANCE</small>
        <h1 style={{fontSize: '40px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <div style={{fontSize:'10px', color: isAdLoading ? 'yellow' : '#10b981'}}>● {isAdLoading ? 'LOADING ADS...' : 'ACTIVE STATUS'}</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button style={{...styles.btn, backgroundColor:'#ef4444'}} onClick={() => runWithAd(() => {
                const nb = Number((balance + 0.0002).toFixed(5));
                setBalance(nb);
                syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb });
                alert("Video Reward Added!");
            })}>📺 WATCH VIDEO (+0.0002 TON)</button>
          </div>

          <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{flex:1, padding:'10px', borderRadius:'10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', border:'2px solid #000', fontWeight:'bold', fontSize:'10px'}}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot' && !completed.includes(t.id)).map(t => (
              <div key={t.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{background:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px'}}>START</button>
              </div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, background:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo && (
                  <div style={{marginBottom:'15px'}}>
                    <input style={styles.input} placeholder="Channel Link" onChange={e => setPromoForm({link: e.target.value})} />
                    <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>SEND PROOF</button>
                  </div>
                )}
                {customTasks.filter(t => t.type === 'social' && !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
                    <b>{t.name}</b>
                    <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{background:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px'}}>JOIN</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
               <div style={{textAlign:'center'}}>
                  <p style={{fontSize:'12px'}}>Enter Code: <b>EASY2</b></p>
                  <button style={styles.btn} onClick={() => handleTaskReward('easy2_code', 0.001, null)}>CLAIM 0.001 TON</button>
               </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>REFERRALS</h2>
          <p style={{textAlign:'center', fontSize:'11px'}}>Refer friends and get 0.001 TON each!</p>
          <div style={{background:'#eee', padding:'10px', borderRadius:'10px', fontSize:'10px', wordBreak:'break-all', marginBottom:'10px'}}>
            https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={styles.btn} onClick={() => alert("Copied!")}>COPY LINK</button>
          
          <h4 style={{marginTop:'20px'}}>Invite History ({referrals.length})</h4>
          {referrals.map((r, i) => (
            <div key={i} style={{padding:'5px 0', borderBottom:'1px solid #eee'}}>User ID: {r.uid} - <b style={{color:'green'}}>+0.001</b></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" />
          <input style={styles.input} placeholder="TON Address" />
          <button style={styles.btn} onClick={() => alert("Ads loading... Please wait.")}>WITHDRAW</button>

          <h4 style={{marginTop:'20px'}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <span>{h.amount} TON</span>
              <span style={{color: h.status === 'Pending' ? 'orange' : 'green'}}>{h.status}</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n))} style={styles.navItem(activeNav === n)}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
