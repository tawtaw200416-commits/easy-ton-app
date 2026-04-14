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
  const [referrals, setReferrals] = useState([]); // Invite History အတွက်
  const [loading, setLoading] = useState(true);
  const isDataLoaded = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const syncToFirebase = (path, data) => {
    if (!isDataLoaded.current) return; 
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
          setReferrals(userData.referrals || []);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
        
        isDataLoaded.current = true;
        setLoading(false);
      } catch (e) { setLoading(false); }
    };
    initApp();
  }, []);

  const handleTaskAction = (id, link, reward = 0.0005) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + reward).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert(`Success! +${reward} TON Added.`);
      }
    };
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show().then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
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
    promoBox: { backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '15px', border: '2px dashed #000', margin: '15px 0' },
    badge: { background: '#facc15', color: '#000', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }
  };

  const botList = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialList = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ].map((tag, i) => ({ id: `s_${i}`, name: tag, link: `https://t.me/${tag.replace('@','')}` }));

  const allSocial = [...socialList, ...customTasks.filter(t => t.type === 'social')];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED USER</div>
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
            {activeTab === 'bot' && botList.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && (
              <>
                {!showAddPromo ? (
                  <>
                    {allSocial.filter(t => !completed.includes(t.id)).map(t => (
                      <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                    ))}
                    <button style={{...styles.btn, background:'#facc15', color:'#000', border:'2px solid #000', marginTop:15}} onClick={() => setShowAddPromo(true)}>+ ADD TASK (PROMOTE)</button>
                  </>
                ) : (
                  <div>
                    <h3 style={{marginTop:0}}>PROMOTE YOUR CHANNEL</h3>
                    <input style={styles.input} placeholder="Task Name (e.g. My Channel)" />
                    <input style={styles.input} placeholder="Link (https://t.me/...)" />
                    <select style={styles.input}>
                        <option>100 Views - 0.2 TON</option>
                        <option>200 Views - 0.4 TON</option>
                        <option>300 Views - 0.5 TON</option>
                    </select>
                    <div style={styles.promoBox}>
                       <small><b>PAY TON TO:</b></small>
                       <p style={{fontSize:9, wordBreak:'break-all', fontWeight:'bold'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                       <small><b>REQUIRED MEMO (UID):</b></small>
                       <p style={{fontSize:22, fontWeight:'bold', color:'#e11d48'}}>{APP_CONFIG.MY_UID}</p>
                    </div>
                    <button style={styles.btn} onClick={() => window.open(`https://t.me/GrowTeaNews`)}>I PAID (SEND PROOF)</button>
                    <button style={{...styles.btn, background:'none', color:'#000', marginTop:10}} onClick={() => setShowAddPromo(false)}>BACK</button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardInput === 'EASY2' && !completed.includes('CODE_EASY2')) {
                     const newBal = Number((balance + 0.001).toFixed(5));
                     setBalance(newBal);
                     syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: [...completed, 'CODE_EASY2'] });
                     alert("Success! +0.001 TON Added."); setRewardInput('');
                  } else { alert("Invalid or Used Code!"); }
                }}>CLAIM</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h3 style={{marginTop:0}}>PUBLISH GLOBAL TASK</h3>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                    <option value="bot">BOT TASK</option>
                    <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.btn} onClick={() => {
                   const id = 'gt_' + Date.now();
                   syncToFirebase(`global_tasks/${id}`, {...newTask, id}).then(() => {
                       alert("Task Published!"); window.location.reload();
                   });
                }}>PUBLISH TO ALL USERS</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRALS</h2>
          <p style={{textAlign:'center', fontSize:13}}>Earn <b>0.0005 TON</b> for every friend you invite!</p>
          <div style={styles.promoBox}>
            <small>YOUR INVITE LINK:</small>
            <p style={{fontSize:11, fontWeight:'bold', wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY LINK</button>
          </div>
          <h4>INVITE HISTORY</h4>
          {referrals.length === 0 ? <small>No friends invited yet.</small> : referrals.map((ref, i) => (
              <div key={i} style={styles.row}><span>User ID: {ref}</span> <span style={styles.badge}>SUCCESS</span></div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => alert("Insufficient balance or check minimum limit.")}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div>
          <div style={styles.card}>
            <h2 style={{textAlign:'center', marginTop:0}}>MY ACCOUNT</h2>
            <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
            <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          </div>
          <div style={{backgroundColor:'#fee2e2', color:'#b91c1c', padding:'15px', borderRadius:'15px', fontSize:'12px', border:'1px solid #f87171'}}>
            <b>⚠️ SECURITY NOTICE:</b><br/>
            Fake referrals or bot automation are strictly prohibited. If detected, your account will be <b>PERMANENTLY BANNED</b> and your balance will be confiscated.
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
