import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  ADMINS: ["1793453606", "5020977059"],
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001,
  BOT_TASK_REWARD: 0.002
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ link: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);

  // Default Tasks
  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b_wt', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b_eb', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b_td', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b_pb', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const defaultSocials = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ];

  const allBotTasks = [...defaultBots, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [
    ...defaultSocials.map(name => ({id: name, name, link: `https://t.me/${name.replace('@','')}`})), 
    ...customTasks.filter(t => t.type === 'social')
  ];

  // Database Sync
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

  // --- Ad Logic: Reward ပေးမည့်နေရာများတွင်သာ ကြော်ငြာတက်စေရန် ---
  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { 
            setIsAdLoading(false); 
            if (callback) callback(); 
        })
        .catch((err) => { 
            setIsAdLoading(false); 
            alert("Please watch the full ad to claim reward!"); 
        });
    } else { 
        // Development mode/Testing
        if (callback) callback(); 
    }
  };

  // Fetch Data on Load
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
          setBalance(Number(userData.balance || 0));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error("Data Fetch Error:", e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    
    // ပုံမှန် link ဖွင့်တာကို အရင်လုပ်ခိုင်းပြီး reward ယူမှ ကြော်ငြာပြမည်
    if (link) window.open(link, '_blank');

    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal); 
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      alert(`Claimed! +${reward} TON`);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #0b0f19, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff', boxShadow: '0px 10px 20px rgba(0,0,0,0.3)' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '3px solid #000', boxShadow: '6px 6px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', transition: '0.2s' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '12px', fontWeight: 'bold', cursor:'pointer' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '2px solid #f1f5f9' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '3px solid #000', marginBottom: '10px', boxSizing: 'border-box', fontSize: '16px' }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'100px', fontWeight:'bold', color: '#000'}}>SYNCING WITH DATABASE...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', fontWeight: 'bold' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:11, color:'#10b981', fontWeight:'bold'}}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => runTaskWithAd(() => {
               const newBal = Number((balance + 0.0002).toFixed(5));
               setBalance(newBal); 
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert("Video Bonus Received! +0.0002 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+0.0002 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.ADMINS.includes(APP_CONFIG.MY_UID)) && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '3px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '11px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b style={{fontSize: '14px'}}>{t.name}</b>
                <button onClick={() => handleTaskReward(t.id, APP_CONFIG.BOT_TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '10px', backgroundColor: '#10b981'}}>START</button>
              </div>
            ))}

            {activeTab === 'social' && (
              <>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'3px solid #000', marginBottom:'15px'}} onClick={() => setShowAddPromo(!showAddPromo)}>+ ADD TASK (PROMOTE)</button>
                {showAddPromo && (
                  <div style={{marginBottom:'20px', padding: '10px', border: '2px dashed #000', borderRadius: '10px'}}>
                    <input style={styles.input} placeholder="Enter Telegram Channel Link" onChange={e => setPromoForm({link: e.target.value})} />
                    <button style={{...styles.btn, backgroundColor:'#3b82f6'}} onClick={() => {
                        if(!promoForm.link) return alert("Enter link first!");
                        sendAdminNotify(`📢 NEW PROMO\nUID: ${APP_CONFIG.MY_UID}\nLink: ${promoForm.link}`);
                        window.open(APP_CONFIG.HELP_BOT);
                    }}>SEND PROOF</button>
                  </div>
                )}
                {allSocialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}>
                    <b style={{fontSize: '14px'}}>{t.name}</b>
                    <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '10px'}}>JOIN</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{textAlign:'center', padding: '10px 0'}}>
                <input style={styles.input} placeholder="Enter Secret Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                   if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                     handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, APP_CONFIG.REWARD_AMT);
                   } else {
                     alert("Invalid Code!");
                   }
                }}>CLAIM CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRALS</h2>
          <div style={{backgroundColor: '#f8fafc', padding: '15px', borderRadius: '15px', border: '2px solid #000', textAlign: 'center'}}>
             <small style={{fontWeight: 'bold', color: '#64748b'}}>YOUR REFERRAL LINK:</small>
             <p style={{fontSize:11, wordBreak:'break-all', margin: '10px 0', fontWeight: 'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
             <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!");}} style={{...styles.btn, padding:'10px', backgroundColor: '#3b82f6'}}>COPY LINK</button>
          </div>
          <h4 style={{marginTop:25, borderBottom: '2px solid #000', paddingBottom: '5px'}}>History ({referrals.length})</h4>
          {referrals.length === 0 ? <p style={{fontSize:13, textAlign:'center', color: '#94a3b8', padding: '20px'}}>No referrals joined yet.</p> : 
            referrals.map((r, i) => (
                <div key={i} style={styles.row}>
                    <div style={{fontSize:13}}>User: <code>{r.id}</code></div>
                    <b style={{color:'#10b981'}}>+0.001 TON</b>
                </div>
            ))
          }
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{marginTop: 0}}>WITHDRAW TON</h3>
          <p style={{fontSize: 12, color: '#ef4444', marginBottom: 15}}>* Minimum withdrawal is 0.1 TON</p>
          <input style={styles.input} type="number" placeholder="Amount (e.g. 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, backgroundColor: '#000'}} onClick={() => {
              const amt = parseFloat(withdrawAmount);
              if(amt >= 0.1 && balance >= amt && withdrawAddress.length > 10) {
                runTaskWithAd(() => {
                  const newBal = Number((balance - amt).toFixed(5));
                  const newHist = [{ id: Date.now(), amount: amt, status: 'Pending', date: new Date().toLocaleDateString() }, ...withdrawHistory];
                  setBalance(newBal); 
                  setWithdrawHistory(newHist);
                  syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHist });
                  sendAdminNotify(`💰 WITHDRAWAL REQUEST\n\nUID: ${APP_CONFIG.MY_UID}\nAmount: ${amt} TON\nAddress: ${withdrawAddress}`);
                  alert("Withdrawal request sent! Pending admin approval.");
                });
              } else {
                alert("Please check your balance, min amount (0.1), or wallet address.");
              }
          }}>SUBMIT REQUEST</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop: 0}}>USER PROFILE</h2>
          <div style={{textAlign: 'center', marginBottom: 20}}>
            <div style={{fontSize: 40}}>👤</div>
          </div>
          <div style={styles.row}><span>USER ID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>TOTAL BALANCE:</span><strong style={{color: '#10b981'}}>{balance.toFixed(5)} TON</strong></div>
          <div style={styles.row}><span>TASKS DONE:</span><strong>{completed.length}</strong></div>
          <button style={{...styles.btn, marginTop:25, backgroundColor:'#3b82f6'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>
            <div style={{fontSize: '18px', marginBottom: '4px'}}>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '🏦' : '👤'}</div>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
