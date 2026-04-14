import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "http://t.me/EasyTonHelp_Bot",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk", // Admin ဆီ စာပို့ရန်
  ADMIN_CHAT_ID: "5020977059"
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]); // Referral UID list
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const sendAdminAlert = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const loadData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refId = urlParams.get('tgWebAppStartParam');

        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        let userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        } else {
          userData = { balance: 0, completed: [], withdrawHistory: [], referrals: [] };
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify(userData)
          });

          // Handle Referral Logic
          if (refId && refId !== APP_CONFIG.MY_UID) {
            const referrerRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${refId}.json`);
            const referrerData = await referrerRes.json();
            if (referrerData) {
              const newRefBal = Number(((referrerData.balance || 0) + 0.0005).toFixed(5));
              const newRefList = referrerData.referrals ? [...referrerData.referrals, APP_CONFIG.MY_UID] : [APP_CONFIG.MY_UID];
              await syncToFirebase(`users/${refId}`, { balance: newRefBal, referrals: newRefList });
            }
          }
        }

        if (tasksData) setCustomTasks(Object.values(tasksData));
        setLoading(false);
      } catch (e) { setLoading(false); }
    };
    loadData();
  }, []);

  const handleWatchAds = () => {
    const completeAd = () => {
        const newBalance = Number((balance + 0.0001).toFixed(5));
        setBalance(newBalance);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance });
        alert("Success! +0.0001 TON Added.");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeAd).catch(() => setTimeout(completeAd, 5000));
    } else { setTimeout(completeAd, 5000); }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const requestDate = Date.now();
      const newHistory = [{ id: requestDate, amount, status: 'Pending', timestamp: requestDate }, ...withdrawHistory];
      
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, withdrawHistory: newHistory });
      
      sendAdminAlert(`🚀 Withdrawal Request!\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amount} TON`);
      alert("Withdraw Success! Pending for 24 hours.");
      setWithdrawAmount('');
    } else { alert("Insufficient Balance (Min 0.1)"); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' },
    adsBox: { background: '#000', color: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid #fff' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward', 'admin'].map(t => (
              (t !== 'admin' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t.toUpperCase()}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
              <>
                <div style={styles.adsBox}>
                  <div><b>WATCH ADS</b><br/><small style={{color:'#facc15'}}>+0.0001 TON</small></div>
                  <button onClick={handleWatchAds} style={{...styles.yellowBtn, width:'80px', padding:'8px', background:'#facc15', color:'#000'}}>WATCH</button>
                </div>
                {[
                  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
                  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
                  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
                  { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID }
                ].concat(customTasks.filter(t => t.type === 'bot')).filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => window.open(t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
                ))}
              </>
            )}
            {/* ... Other Tabs remain similar ... */}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <p style={{textAlign:'center', fontSize:'13px'}}>Get <b>0.0005 TON</b> for each friend you invite plus <b>10% Bonus</b> from their earnings!</p>
          <div style={styles.copyBox}>
            <small>REFERRAL LINK:</small>
            <p style={{fontSize:12, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          
          <h3 style={{borderBottom: '2px solid #000', paddingBottom: '5px'}}>INVITE HISTORY</h3>
          {referrals.length === 0 ? <p style={{fontSize:12}}>No referrals yet.</p> : referrals.map((refId, i) => (
            <div key={i} style={styles.row}><span>User ID: <b>{refId}</b></span><span style={{color:'#10b981'}}>+0.0005 TON</span></div>
          ))}
          <div style={{marginTop:10}}>Total: <b>{referrals.length} Users</b></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:20, borderBottom: '2px solid #000'}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => {
            const isAutoSuccess = (Date.now() - h.timestamp) > 86400000; // 24 hours check
            return (
              <div key={i} style={styles.row}>
                <span>{h.amount} TON</span>
                <span style={{color: isAutoSuccess ? '#10b981' : 'orange', fontWeight:'bold'}}>
                   {isAutoSuccess ? 'Success' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.yellowBtn, background:'#facc15', color:'#000', marginTop:20, border:'2px solid #000'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
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
