import React, { useState, useEffect, useCallback, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  REF_REWARD: 0.0005,
  TASK_REWARD: 0.0005
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const isInitialLoadFinished = useRef(false);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Native Copy Fix
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
    if (!isInitialLoadFinished.current) return; 
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (e) { console.error("Sync Error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    const initializeApp = async () => {
      try {
        const userRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
        let userData = await userRes.json();

        if (userData) {
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        isInitialLoadFinished.current = true;
      } catch (e) { console.error("Init Error:", e); }
      setLoading(false);
    };
    initializeApp();
  }, []);

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return;
    window.open(link, '_blank');
    setTimeout(() => {
      const newBalance = Number((balance + APP_CONFIG.TASK_REWARD).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBalance);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newComp });
      alert("Reward +0.0005 TON Received!");
    }, 5000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '12px 0', borderTop: '3px solid #fff' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' })
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '40px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" },
              { id: 'b4', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot" },
              { id: 'b5', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot" }
            ].map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '8px 15px', borderRadius: 8, border: 'none'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button></div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
              { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
              { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
              { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
              { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
              { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
              { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
              { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
              { id: 's11', name: "Join Sponsor 1", link: "https://t.me/easytonfree" },
              { id: 's12', name: "Join Sponsor 2", link: "https://t.me/easytonfree" },
              { id: 's13', name: "Join Sponsor 3", link: "https://t.me/easytonfree" },
              { id: 's14', name: "Join Sponsor 4", link: "https://t.me/easytonfree" }
            ].map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '8px 15px', borderRadius: 8, border: 'none'}}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button></div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <h4 style={{marginTop:0}}>Enter Secret Code</h4>
                <input style={styles.input} placeholder="Secret Code Here" value={rewardInput} onChange={e => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardInput === 'EASY100') {
                    const nb = balance + 0.005; setBalance(nb);
                    syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb });
                    alert("Code Applied! +0.005 TON"); setRewardInput('');
                  } else { alert("Invalid Code!"); }
                }}>CLAIM REWARD</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>Invite Friends</h3>
          <div style={{background:'#f1f5f9', padding:15, borderRadius:15, border:'1px dashed #000'}}>
             <p style={{margin:0, fontSize:13}}>Reward: 0.0005 TON per Friend</p>
             <p style={{margin:'5px 0', fontSize:13, color:'green'}}>Bonus: 10% from friend tasks</p>
             <button style={{...styles.btn, marginTop:10}} onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY INVITE LINK</button>
          </div>
          <h4 style={{marginTop:20}}>Referral History ({referrals.length})</h4>
          {referrals.map((r, i) => <div key={i} style={styles.row}><span>User: {r.uid}</span><span style={{color:'green'}}>+0.0005</span></div>)}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if (amt >= 0.1 && amt <= balance) {
              const nb = Number((balance - amt).toFixed(5));
              // UID is saved here inside each history record
              const nh = [{id: Date.now(), amount: amt, status: 'Pending', user_uid: APP_CONFIG.MY_UID}, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb, withdrawHistory: nh });
              alert("Withdraw Requested!");
            } else { alert("Insufficient Balance!"); }
          }}>WITHDRAW NOW</button>
          <div style={{marginTop:20}}>
            <h4>History</h4>
            {withdrawHistory.map((h, i) => <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>)}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{textAlign:'center', marginBottom:20}}>
            <div style={{width:80, height:80, background:'#facc15', borderRadius:'50%', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #000', fontSize:30}}>👤</div>
            <h2 style={{margin:0}}>USER PROFILE</h2>
          </div>
          <div style={styles.row}><span>Your UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Balance:</span><b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>Status:</span><b style={{color:'green'}}>VERIFIED</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['EARN', 'INVITE', 'WITHDRAW', 'PROFILE'].map(n => (
          <div key={n} onClick={() => setActiveNav(n.toLowerCase())} style={styles.navBtn(activeNav === n.toLowerCase())}>{n}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
