import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004,
  VIP_WATCH_REWARD: 0.0008,
  REFER_REWARD: 0.01
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // Initialize states from LocalStorage for faster loading
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem('ads_count')) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);

  // Sync states to LocalStorage
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
    localStorage.setItem('ads_count', adsWatched.toString());
  }, [balance, completed, withdrawHistory, referrals, adsWatched]);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { setIsAdLoading(false); if (callback) callback(); })
        .catch(() => { setIsAdLoading(false); if (callback) callback(); });
    } else {
      if (callback) callback();
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, t, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const allData = await all.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completedTasks || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));
      if (allData) setAllUsers(Object.keys(allData).map(key => ({ id: key, ...allData[key] })));
    } catch (e) { console.error("Data Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completedTasks: newComp });
      if (link) window.open(link, '_blank');
      alert(`Claimed! +${reward} TON`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff', color: '#fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold', cursor:'pointer', border: 'none', background: 'none' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    badge: { background: '#facc15', color: '#000', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }
  };

  if (loading) return <div style={{...styles.main, textAlign:'center', paddingTop:'50%'}}><h2>Syncing...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
        {isVip && <div style={{...styles.badge, display:'inline-block'}}>VIP MEMBER ⭐</div>}
        <button 
          onClick={() => runTaskWithAd(() => {
            const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
            const newBal = Number((balance + reward).toFixed(5));
            const newCount = adsWatched + 1;
            setBalance(newBal);
            setAdsWatched(newCount);
            syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, adsWatched: newCount });
            alert(`Reward Claimed: +${reward} TON`);
          })} 
          style={{...styles.btn, backgroundColor:'#facc15', color:'#000', marginTop:15}}
        >
          📺 WATCH AD & EARN
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'RANK'].map(t => (
              <button 
                key={t} 
                onClick={() => setActiveTab(t.toLowerCase())} 
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'rank' ? (
              <div>
                <h3 style={{textAlign:'center', marginTop:0}}>🏆 LEADERBOARD</h3>
                <table style={{width:'100%', fontSize:12}}>
                  <thead><tr style={{borderBottom:'2px solid #000'}}><th align="left">RANK</th><th align="left">UID</th><th align="right">TON</th></tr></thead>
                  <tbody>
                    {allUsers.sort((a,b) => b.balance - a.balance).slice(0, 10).map((u, i) => (
                      <tr key={i} style={{background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                        <td style={{padding:'8px 0'}}>#{i+1}</td>
                        <td>{u.id}</td>
                        <td align="right">{u.balance?.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              customTasks.filter(t => t.type === activeTab).map((t, i) => (
                <div key={i} style={styles.row}>
                  <div style={{fontSize:13}}><b>{t.name}</b><br/><small>+0.001 TON</small></div>
                  {completed.includes(t.id) ? (
                    <span style={{color:'green', fontWeight:'bold', fontSize:12}}>DONE ✅</span>
                  ) : (
                    <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width:'80px', padding:'8px'}}>START</button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRALS</h2>
          <p style={{textAlign:'center', fontSize:14, fontWeight:'bold', color:'#3b82f6'}}>Get 0.01 TON for every friend!</p>
          <div style={{backgroundColor:'#f1f5f9', padding:'15px', borderRadius:'12px', border:'2px dashed #000'}}>
             <small>Your Referral Link:</small>
             <p style={{fontSize:10, wordBreak:'break-all', margin:'10px 0'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
             <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={{...styles.btn, padding:'10px'}}>COPY LINK</button>
          </div>
          <h4 style={{marginTop:20}}>Invite History ({referrals.length})</h4>
          {referrals.map((r, i) => (
            <div key={i} style={styles.row}><span>User: {r.id}</span><b style={{color:'#10b981'}}>+0.01 TON</b></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <p style={{fontSize:12, color:'#666'}}>Minimum: 0.1 TON</p>
          <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #000', marginBottom:10, boxSizing:'border-box'}} placeholder="Amount (e.g 0.1)" />
          <input style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #000', marginBottom:10, boxSizing:'border-box'}} placeholder="TON Wallet Address" />
          <button style={styles.btn} onClick={() => alert("Insufficient balance or Invalid address.")}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:25}}>HISTORY</h4>
          {withdrawHistory.length === 0 ? <p style={{fontSize:12, color:'#999', textAlign:'center'}}>No requests found.</p> : 
            withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}>
                <div><b>{h.amount} TON</b><br/><small>{h.date}</small></div>
                <span style={{color: h.status === 'Pending' ? 'orange' : 'green', fontWeight:'bold'}}>{h.status}</span>
              </div>
            ))
          }
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>PROFILE</h2>
          <div style={styles.row}><span>User ID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Membership:</span><strong>{isVip ? "VIP ⭐" : "Standard"}</strong></div>
          <div style={styles.row}><span>Ads Watched:</span><strong>{adsWatched}</strong></div>
          <button style={{...styles.btn, marginTop:20, backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>GET SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button 
            key={n} 
            onClick={() => runTaskWithAd(() => setActiveNav(n))} 
            style={styles.navItem(activeNav === n)}
          >
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
