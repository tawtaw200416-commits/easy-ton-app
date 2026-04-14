import React, { useState, useEffect, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Native Copy Helper for Mobile
  const handleCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Oops, unable to copy");
    }
    document.body.removeChild(textArea);
  };

  const syncToFirebase = (path, data) => {
    if (!isDataLoaded) return; 
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

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
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
        
        setIsDataLoaded(true);
        setLoading(false);
      } catch (e) {
        console.error("Load Error", e);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      // UID included in history for admin tracking
      const newHistory = [{ id: Date.now(), amount, status: 'Pending', user_uid: APP_CONFIG.MY_UID }, ...withdrawHistory];
      
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, withdrawHistory: newHistory });
      
      alert("Withdraw successful! Pending approval.");
      setWithdrawAmount('');
    } else { 
      alert("Insufficient Balance! Minimum withdrawal is 0.1 TON."); 
    }
  };

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return;
    window.open(link, '_blank');

    const giveReward = () => {
      const newBalance = Number((balance + 0.0005).toFixed(5));
      const newCompleted = [...completed, id];
      setBalance(newBalance);
      setCompleted(newCompleted);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
      alert("Success! +0.0005 TON rewarded.");
    };

    // Adsgram Integration
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then(() => { giveReward(); })
        .catch((result) => {
          console.log("Ad Error:", result);
          setTimeout(giveReward, 3000); 
        });
    } else {
      setTimeout(giveReward, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px', wordBreak: 'break-all' },
    warning: { background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '10px', fontSize: '11px', marginBottom: '10px', border: '1px solid #f87171' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>ENCRYPTING CONNECTION...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>AVAILABLE BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot" },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot" }
            ].concat(customTasks.filter(t => t.type === 'bot')).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{...styles.yellowBtn, width: '90px', backgroundColor: completed.includes(t.id) ? '#ccc' : '#000'}}>
                  {completed.includes(t.id) ? 'DONE' : 'START'}
                </button>
              </div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
            ].concat(customTasks.filter(t => t.type === 'social')).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{...styles.yellowBtn, width: '90px', backgroundColor: completed.includes(t.id) ? '#ccc' : '#000'}}>
                  {completed.includes(t.id) ? 'DONE' : 'JOIN'}
                </button>
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <p style={{fontSize: 12, marginBottom: 10}}>Enter secret code to get bonus TON.</p>
                <input style={styles.input} placeholder="Secret Code" value={rewardInput} onChange={e => setRewardInput(e.target.value)} />
                <button style={styles.yellowBtn} onClick={() => {
                  if(rewardInput === 'EASYTON') {
                    const nb = balance + 0.005; setBalance(nb);
                    syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb });
                    alert("Bonus Claimed!"); setRewardInput('');
                  } else { alert("Invalid Secret Code!"); }
                }}>CLAIM BONUS</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE FRIENDS</h2>
          <div style={styles.warning}>Earn 0.0005 TON for every friend who joins!</div>
          <div style={styles.copyBox}>
            <p style={{fontSize:11}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button style={{...styles.yellowBtn, padding: '10px'}} onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY REFERRAL LINK</button>
          </div>
          <div style={styles.row}><span>Total Referrals:</span><b>{referralCount} Users</b></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>WITHDRAW TON</h3>
          <div style={styles.warning}>Minimum withdrawal: 0.1 TON. Process takes 24-48 hours.</div>
          <input style={styles.input} type="number" placeholder="Enter amount (Min 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>REQUEST WITHDRAWAL</button>
          
          <h4 style={{marginTop:20, borderBottom:'2px solid #000'}}>HISTORY</h4>
          {withdrawHistory.length === 0 ? <p style={{fontSize:12, color:'#666'}}>No history yet.</p> : 
            withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}>
                <div>
                  <div style={{fontSize:13, fontWeight:'bold'}}>{h.amount} TON</div>
                  <div style={{fontSize:10, color:'#888'}}>{new Date(h.id).toLocaleDateString()}</div>
                </div>
                <span style={{color: h.status === 'Pending' ? 'orange' : 'green', fontWeight:'bold'}}>{h.status}</span>
              </div>
            ))
          }
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
          <div style={styles.copyBox}>
            <small>USER UID:</small>
            <div style={{fontWeight:'bold', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              {APP_CONFIG.MY_UID}
              <button onClick={() => handleCopy(APP_CONFIG.MY_UID)} style={{fontSize:10, padding:'5px', background:'#000', color:'#fff', borderRadius:5, border:'none'}}>COPY</button>
            </div>
          </div>
          <div style={styles.row}><span>Account Status:</span><b style={{color:'green'}}>VERIFIED</b></div>
          <div style={styles.row}><span>Current Balance:</span><b>{balance.toFixed(5)} TON</b></div>
          <div style={{marginTop:20, fontSize:10, textAlign:'center', color:'#666'}}>
            Easy TON Free Project v2.0<br/>Securely synced with Firebase Cloud.
          </div>
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
