import React, { useState, useEffect } from 'react';

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
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

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
        } else {
          await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {
            balance: 0, completed: [], withdrawHistory: [], referralCount: 0, uid: APP_CONFIG.MY_UID
          });
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error("Sync Error:", e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    window.open(link, '_blank');
    
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert("Reward Received! +0.0005 TON");
      }
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else {
      setTimeout(completeTask, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    promoBox: { backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', margin: '10px 0' },
    copyBtnSmall: { backgroundColor: '#facc15', border: '1px solid #000', borderRadius: '5px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', marginLeft: '5px' }
  };

  // 14 Social Tasks အပြည့်
  const staticSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
  ];

  // 6 Bot Tasks အပြည့်
  const staticBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
  ];

  const allSocialTasks = [...staticSocialTasks, ...customTasks.filter(t => t.type === 'social')];
  const allBotTasks = [...staticBotTasks, ...customTasks.filter(t => t.type === 'bot')];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED ACCOUNT</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo ? (
                  <div>
                    <input style={styles.input} placeholder="Channel Name" />
                    <input style={styles.input} placeholder="Channel Link (https://...)" />
                    <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                      {['100 Views - 0.2T', '200 Views - 0.4T', '300 Views - 0.5T'].map(p => (
                        <button key={p} style={{...styles.btn, fontSize:'9px', padding:'8px'}}>{p}</button>
                      ))}
                    </div>
                    <div style={styles.promoBox}>
                      <small><b>TON ADDRESS:</b></small>
                      <div style={{display:'flex', alignItems:'center'}}>
                        <p style={{fontSize:'9px', wordBreak:'break-all', margin:'5px 0'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                        <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET)} style={styles.copyBtnSmall}>COPY</button>
                      </div>
                      <small><b>MEMO (UID):</b></small>
                      <div style={{display:'flex', alignItems:'center'}}>
                        <p style={{fontSize:'18px', fontWeight:'900', color:'#e11d48', margin:0}}>{APP_CONFIG.MY_UID}</p>
                        <button onClick={() => handleCopy(APP_CONFIG.MY_UID)} style={styles.copyBtnSmall}>COPY</button>
                      </div>
                    </div>
                    <button style={styles.btn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PAYMENT PROOF</button>
                  </div>
                ) : (
                  allSocialTasks.map(t => (
                    <div key={t.id} style={styles.row}>
                      <b>{t.name}</b>
                      <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{...styles.btn, width: '80px', padding: '8px', opacity: completed.includes(t.id) ? 0.5 : 1}}>
                        {completed.includes(t.id) ? 'DONE' : 'JOIN'}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'bot' && allBotTasks.map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{...styles.btn, width: '80px', padding: '8px', opacity: completed.includes(t.id) ? 0.5 : 1}}>
                  {completed.includes(t.id) ? 'DONE' : 'START'}
                </button>
              </div>
            ))}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(completed.includes('CODE_EASY2')) return alert("Already used!");
                  if(rewardInput === 'EASY2') {
                     const newBal = Number((balance + 0.001).toFixed(5));
                     const newComp = [...completed, 'CODE_EASY2'];
                     setBalance(newBal); setCompleted(newComp);
                     syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
                     alert("Success! +0.001 TON"); setRewardInput('');
                  } else { alert("Invalid!"); }
                }}>CLAIM CODE</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4 style={{textAlign:'center', margin:'0 0 10px 0'}}>ADMIN TASK MANAGER</h4>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.btn} onClick={() => {
                  if(!newTask.name || !newTask.link) return alert("Fill all fields!");
                  const taskId = 'task_' + Date.now();
                  syncToFirebase(`global_tasks/${taskId}`, {...newTask, id: taskId}).then(() => {
                    alert("Task Published!");
                    window.location.reload();
                  });
                }}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL PROGRAM</h2>
          <div style={styles.promoBox}>
            <small>YOUR INVITE LINK:</small>
            <p style={{fontSize:11, fontWeight:'bold', wordBreak:'break-all', margin:'10px 0'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)} style={styles.btn}>COPY LINK</button>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', padding:'10px'}}>
             <span>Total Referrals:</span><strong>{referralCount} Users</strong>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW FUNDS</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            if(parseFloat(withdrawAmount) >= 0.1 && balance >= withdrawAmount) {
              const nb = Number((balance - parseFloat(withdrawAmount)).toFixed(5));
              const nh = [{id: Date.now(), amount: withdrawAmount, status: 'Pending'}, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {balance: nb, withdrawHistory: nh});
              alert("Withdrawal submitted!"); setWithdrawAmount('');
            } else { alert("Insufficient or Min 0.1 required!"); }
          }}>WITHDRAW NOW</button>
          <div style={{marginTop: 20}}>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange', fontWeight:'bold'}}>{h.status}</span></div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
          <div style={{textAlign:'center', marginBottom:20}}><span style={{background:'#10b981', color:'#fff', padding:'5px 15px', borderRadius:20, fontSize:12, fontWeight:'bold'}}>● ACTIVE STATUS</span></div>
          <div style={styles.row}><span>User UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Account Level:</span><strong style={{color:'#facc15'}}>PREMIUM</strong></div>
          <div style={styles.row}><span>Wallet Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <p style={{fontSize:11, color:'red', marginTop:15}}>⚠️ Warning: Automation or multiple accounts will result in a permanent ban.</p>
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
