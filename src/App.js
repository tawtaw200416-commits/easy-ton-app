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
  
  // Safety Lock to prevent data overwriting
  const isInitialLoadFinished = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

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
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);

        let userData = await userRes.json();
        const tasksData = await tasksRes.json();

        // Check if user is new or existing
        if (!userData) {
          const startParam = tg?.initDataUnsafe?.start_param;
          userData = { balance: 0, completed: [], withdrawHistory: [], referrals: [], uid: APP_CONFIG.MY_UID };
          
          // Referral Logic: Reward Inviter
          if (startParam && startParam !== APP_CONFIG.MY_UID) {
            await handleReferral(startParam);
            userData.balance = APP_CONFIG.REF_REWARD; // Reward the new user too
          }

          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify(userData)
          });
        }

        setBalance(userData.balance || 0);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals || []);
        if (tasksData) setCustomTasks(Object.values(tasksData));

        isInitialLoadFinished.current = true;
      } catch (e) { console.error("Init Error:", e); }
      setLoading(false);
    };

    initializeApp();
  }, []);

  const handleReferral = async (inviterId) => {
    try {
      const inviterRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${inviterId}.json`);
      const inviterData = await inviterRes.json();
      if (inviterData) {
        const newRefList = [...(inviterData.referrals || []), { uid: APP_CONFIG.MY_UID, date: new Date().toLocaleDateString() }];
        const newBal = (inviterData.balance || 0) + APP_CONFIG.REF_REWARD;
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${inviterId}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, referrals: newRefList })
        });
      }
    } catch (e) { console.error("Ref Reward Error:", e); }
  };

  const handleCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Copied successfully!");
  };

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
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '20px', marginBottom: '15px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '12px 0', zIndex: 100 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    badge: { background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '10px', fontSize: '10px' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', fontWeight:'bold'}}>SYNCING SECURE DATA...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:18, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981'}}>● DATA ENCRYPTED & SECURED</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
            ].map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '8px 15px', borderRadius: '8px', border: 'none'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.btn, backgroundColor: '#facc15', color: '#000', marginBottom: '15px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" }
                ].concat(customTasks.filter(t => t.type === 'social')).map(t => (
                  <div key={t.id} style={styles.row}>
                    <b>{t.name}</b>
                    <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '8px 15px', borderRadius: '8px', border: 'none'}}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
                  </div>
                ))}
              </>
            )}

            {showAddTask && (
              <div>
                <h3 style={{marginTop:0}}>Promote Channel</h3>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Channel Link" />
                <div style={{display:'flex', gap:5, marginBottom:10}}>
                  {['100','200','500'].map(v => (
                    <button key={v} onClick={() => setSelectedPlan(v)} style={{flex:1, padding:8, borderRadius:8, border: '2px solid #000', backgroundColor: selectedPlan === v ? '#000' : '#fff', color: selectedPlan === v ? '#fff' : '#000', fontSize:10}}>{v} Views</button>
                  ))}
                </div>
                <div style={{background: '#f1f5f9', padding: 10, borderRadius: 10, fontSize: 10, border: '1px dashed #000', marginBottom: 10}}>
                   <b>ADMIN WALLET:</b><br/>{APP_CONFIG.ADMIN_WALLET}<br/>
                   <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET)} style={{marginTop:5}}>COPY WALLET</button>
                </div>
                <button style={styles.btn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{marginTop:0}}>Referral Program</h2>
          <div style={{background: '#f8fafc', padding: 15, borderRadius: 15, border: '1px dashed #000'}}>
            <p style={{margin: 0, fontSize: 13}}><b>Reward:</b> 0.0005 TON per friend</p>
            <p style={{margin: '5px 0', fontSize: 13, color: '#059669'}}><b>Bonus:</b> 10% from friend's mission</p>
            <div style={{marginTop: 15}}>
              <small>Your Invitation Link:</small>
              <div style={{display: 'flex', gap: 5, marginTop: 5}}>
                <input readOnly style={{...styles.input, marginBottom: 0, flex: 1}} value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
                <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)} style={{...styles.btn, width: '70px', padding: '5px'}}>COPY</button>
              </div>
            </div>
          </div>
          <h4 style={{marginBottom: 10, marginTop: 20}}>My Referrals ({referrals.length})</h4>
          {referrals.map((r, idx) => (
            <div key={idx} style={styles.row}><span>User ID: {r.uid}</span><span style={{color: '#059669'}}>+0.0005 TON</span></div>
          ))}
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
              const nh = [{id: Date.now(), amount: amt, status: 'Pending', date: new Date().toLocaleDateString()}, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb, withdrawHistory: nh });
              alert("Submitted successfully!");
            } else { alert("Insufficient balance (Min 0.1)"); }
          }}>WITHDRAW NOW</button>
          <div style={{marginTop: 20}}>
            <h4>History</h4>
            {withdrawHistory.map(h => (
              <div key={h.id} style={styles.row}><span>{h.amount} TON</span><span style={{color: 'orange'}}>{h.status}</span></div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', marginBottom: 20}}>
            <div style={{width: 80, height: 80, background: '#facc15', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #000', fontSize: 30}}>👤</div>
            <h2 style={{margin: 0}}>USER PROFILE</h2>
            <span style={styles.badge}>PREMIUM MEMBER</span>
          </div>
          <div style={styles.row}><span>User ID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Wallet:</span><span style={{fontSize: 10}}>TON Network</span></div>
          <div style={styles.row}><span>Balance:</span><b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>Total Invites:</span><b>{referrals.length}</b></div>
          <p style={{fontSize: 10, color: 'red', textAlign: 'center', marginTop: 20}}>⚠️ Multiple accounts detected will be banned.</p>
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
