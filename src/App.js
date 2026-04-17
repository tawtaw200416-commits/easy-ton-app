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
  REWARD_CODE: "EASY3", 
  REWARD_AMT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoLink, setPromoLink] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [isAdLoading, setIsAdLoading] = useState(false);

  // Load Adsgram Script Dynamically
  useEffect(() => {
    if (!document.getElementById('adsgram-sdk')) {
      const script = document.createElement('script');
      script.id = 'adsgram-sdk';
      script.src = "https://adsgram.ai/sdk/v1/adsgram-sdk.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
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

  const runTaskWithAd = (callback, isNav = false) => {
    if (isAdLoading) return;

    if (!window.Adsgram) {
      if (isNav) return callback();
      return alert("Ads system loading error. Please check your internet or VPN.");
    }

    const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });

    setIsAdLoading(true);
    AdController.show()
      .then(() => { 
          setIsAdLoading(false); 
          if (callback) callback(); 
      })
      .catch((err) => { 
          setIsAdLoading(false); 
          console.error("Ad Error:", err);
          if(isNav) {
              callback();
          } else {
              // Detailed error messages based on Adsgram documentation
              const msg = err.error === 'no_ads' ? "No ads available right now." : "Ad was skipped or blocked.";
              alert(msg);
          }
      });
  };

  const handleNavChange = (newNav) => {
    if (newNav === activeNav) return;
    runTaskWithAd(() => setActiveNav(newNav), true);
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      .then(res => res.json())
      .then(data => { if (data) setCustomTasks(Object.values(data)); });
  }, []);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      if (link) window.open(link, '_blank');
      alert(`Success! +${reward} TON earned.`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', opacity: isAdLoading ? 0.7 : 1 },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold', cursor:'pointer' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' }
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

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color: isAdLoading ? '#fbbf24' : '#10b981'}}>● {isAdLoading ? "LOADING AD..." : "SYSTEM READY"}</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => runTaskWithAd(() => {
               const newBal = Number((balance + 0.0002).toFixed(5));
               setBalance(newBal);
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert("Video Reward Added! +0.0002 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+0.0002 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...defaultBots, ...customTasks.filter(ct => ct.type === 'bot')].filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo && (
                  <div style={{marginBottom:'20px'}}>
                    <input style={styles.input} placeholder="Channel/Group Link" value={promoLink} onChange={e => setPromoLink(e.target.value)} />
                    <button style={{...styles.btn, backgroundColor:'#3b82f6'}} onClick={() => {
                        if(!promoLink) return alert("Please enter a link!");
                        sendAdminNotify(`📢 NEW PROMO REQ\nUID: ${APP_CONFIG.MY_UID}\nLink: ${promoLink}`);
                        window.open(APP_CONFIG.HELP_BOT);
                    }}>SUBMIT PROOF</button>
                  </div>
                )}
                {[...defaultSocials.map(name => ({id: 's_'+name, name, link: `https://t.me/${name.replace('@','')}`})), ...customTasks.filter(ct => ct.type === 'social')].filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{textAlign:'center'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                   if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                       handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, APP_CONFIG.REWARD_AMT, null);
                   } else alert("Invalid Reward Code!");
                }}>CLAIM REWARD</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
                <div>
                    <h4 style={{marginTop:0}}>SYSTEM MANAGEMENT</h4>
                    <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                    <input style={styles.input} placeholder="Task Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                    <select style={styles.input} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                        <option value="bot">BOT TASK</option>
                        <option value="social">SOCIAL TASK</option>
                    </select>
                    <button style={{...styles.btn, backgroundColor:'#22c55e'}} onClick={() => {
                        const id = "task_" + Date.now();
                        syncToFirebase(`global_tasks/${id}`, {...newTask, id}).then(() => { alert("Task Published!"); setNewTask({name:'', link:'', type:'bot'}); });
                    }}>PUBLISH TASK</button>
                </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>INVITE FRIENDS</h2>
          <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Invite Link Copied!");}} style={styles.btn}>COPY INVITE LINK</button>
          <p style={{fontSize:12, textAlign:'center', marginTop:10}}>Earn 0.001 TON for every successful referral!</p>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <p style={{fontSize:12, color:'#666'}}>Minimum withdrawal amount is 0.1 TON.</p>
          <input style={styles.input} type="number" placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if(amt >= 0.1 && balance >= amt) {
              runTaskWithAd(() => {
                const newBal = Number((balance - amt).toFixed(5));
                const newHist = [{ id: Date.now(), amount: amt, status: 'Pending', date: Date.now() }, ...withdrawHistory];
                setBalance(newBal); setWithdrawHistory(newHist);
                syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHist });
                sendAdminNotify(`💰 WITHDRAWAL REQ\nAMT: ${amt} TON\nUID: ${APP_CONFIG.MY_UID}`);
                alert("Withdrawal request submitted!");
              });
            } else alert("Insufficient balance or amount too low.");
          }}>SUBMIT WITHDRAWAL</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>USER PROFILE</h2>
          <div style={styles.row}><span>USER ID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>CURRENT BALANCE:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.btn, marginTop:20, backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>GET SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => handleNavChange(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
