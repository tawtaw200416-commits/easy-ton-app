import React, { useState, useEffect, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: '', link: '', package: '100 Views - 0.2 TON' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const syncToFirebase = (path, data, method = 'PATCH') => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: method,
      body: JSON.stringify(data)
    });
  };

  const sendAdminNotify = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  const runTaskWithAd = (callback) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => callback())
        .catch(() => alert("Ad failed! Please try again."));
    } else {
      alert("Adsgram not connected.");
    }
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
          setBalance(Number(userData.balance));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;
    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      if (link) window.open(link);
      alert(`Claimed! +${reward} TON`);
    });
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
    promoBox: { backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '12px', border: '1px dashed #000', margin: '10px 0' },
    badge: { background: '#facc15', border: '1px solid #000', borderRadius: '5px', padding: '2px 5px', fontSize: '10px', cursor:'pointer' }
  };

  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b_wt', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b_eb', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b_td', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b_pb', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const defaultSocials = ["@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"];

  const allBotTasks = [...defaultBots, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [...defaultSocials.map(name => ({id: name, name, link: `https://t.me/${name.replace('@','')}`})), ...customTasks.filter(t => t.type === 'social')];

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => runTaskWithAd(() => {
               const newBal = Number((balance + 0.0001).toFixed(5));
               setBalance(newBal);
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert("Watched! +0.0001 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+0.0001 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.0005, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo ? (
                  <div style={{marginBottom:'20px'}}>
                    <input style={styles.input} placeholder="Channel Name" onChange={e => setPromoForm({...promoForm, name: e.target.value})} />
                    <input style={styles.input} placeholder="Channel Link (https://...)" onChange={e => setPromoForm({...promoForm, link: e.target.value})} />
                    <select style={styles.input} onChange={e => setPromoForm({...promoForm, package: e.target.value})}>
                      <option value="100 Views - 0.2 TON">100 Views - 0.2 TON</option>
                      <option value="200 Views - 0.4 TON">200 Views - 0.4 TON</option>
                      <option value="300 Views - 0.5 TON">300 Views - 0.5 TON</option>
                    </select>
                    <div style={styles.promoBox}>
                      <div style={styles.row}><small>Admin Wallet:</small><b style={styles.badge} onClick={()=>{navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");}}>COPY WALLET</b></div>
                      <div style={styles.row}><small>Your UID:</small><b style={styles.badge} onClick={()=>{navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");}}>COPY UID</b></div>
                    </div>
                    <button style={{...styles.btn, backgroundColor:'#3b82f6'}} onClick={() => {
                      sendAdminNotify(`📢 PROMO REQUEST\nUID: ${APP_CONFIG.MY_UID}\nName: ${promoForm.name}\nPackage: ${promoForm.package}`);
                      window.open(APP_CONFIG.HELP_BOT);
                    }}>SEND ADMIN (PAYMENT PROOF)</button>
                  </div>
                ) : null}
                {allSocialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.0005, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{textAlign:'center'}}>
                <h4>🎁 REDEEM REWARD CODE</h4>
                <input style={styles.input} placeholder="Enter Code Here" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardCode.toLowerCase() === 'gift2026' && !completed.includes('code_gift2026')){
                    handleTaskReward('code_gift2026', 0.001, null);
                    setRewardCode('');
                  } else alert("Invalid or already claimed!");
                }}>CLAIM 0.001 TON</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{marginTop:0}}>ADMIN PANEL</h3>
                <input style={styles.input} placeholder="Task Name" onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={styles.btn} onClick={() => {
                  const id = 'task_'+Date.now();
                  syncToFirebase(`global_tasks/${id}`, {...newTask, id}, 'PUT').then(()=>alert("Task Added!"));
                }}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL</h2>
          <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY INVITE LINK</button>
          <h4 style={{marginTop:20}}>History</h4>
          {referrals.map((r, i) => <div key={i} style={styles.row}><span>User ID: {r.id}</span><b style={{color:'#10b981'}}>+0.0005</b></div>)}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if(amt >= 0.1 && balance >= amt && withdrawAddress.length > 5) {
              const newBal = Number((balance - amt).toFixed(5));
              const newEntry = { id: Date.now(), amount: amt, status: 'Pending', date: Date.now() };
              const newHist = [newEntry, ...withdrawHistory];
              
              setBalance(newBal);
              setWithdrawHistory(newHist);
              setWithdrawAmount(''); setWithdrawAddress('');
              
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHist });
              sendAdminNotify(`💰 WITHDRAWAL\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amt}\nWallet: ${withdrawAddress}`);
              alert("Submitted! Processing within 24h.");
            } else alert("Invalid amount, address or insufficient balance!");
          }}>WITHDRAW NOW</button>

          <h4 style={{marginTop:'25px', marginBottom:'10px'}}>Withdraw History</h4>
          {withdrawHistory.length === 0 ? <p style={{fontSize:12, color:'#666'}}>No history yet.</p> : 
            withdrawHistory.map((h, i) => {
              const isSuccess = Date.now() - h.date > 86400000; // 24 hours
              return (
                <div key={i} style={styles.row}>
                  <div style={{fontSize:12}}><b>{h.amount} TON</b><br/><small>{new Date(h.date).toLocaleDateString()}</small></div>
                  <b style={{color: isSuccess ? '#10b981' : '#f59e0b', fontSize:12}}>{isSuccess ? 'SUCCESS' : 'PENDING'}</b>
                </div>
              );
            })
          }
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.btn, marginTop:20, backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>SUPPORT</button>
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
