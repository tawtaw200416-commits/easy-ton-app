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
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isDataLoaded = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
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
          setReferralCount(userData.referralCount || 0);
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
        alert(`Task Completed! +${reward} TON Added.`);
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
    warn: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '15px', fontSize: '12px', border: '1px solid #f87171', marginTop: '10px' }
  };

  const botList = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialList = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ].map((tag, i) => ({ id: `s_${i}`, name: tag, link: `https://t.me/${tag.replace('@','')}` }));

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
            {activeTab === 'bot' && botList.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && (
              <>
                {!showAddPromo ? (
                  <>
                    {socialList.filter(t => !completed.includes(t.id)).map(t => (
                      <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
                    ))}
                    <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginTop:15}} onClick={() => setShowAddPromo(true)}>+ ADD TASK (PROMOTE)</button>
                  </>
                ) : (
                  <div>
                    <h3 style={{marginTop:0}}>PROMOTE CHANNEL</h3>
                    <input style={styles.input} placeholder="Channel Name" />
                    <input style={styles.input} placeholder="Channel Link (https://...)" />
                    <div style={{display:'flex', gap:5, marginBottom:10}}>
                        <button style={{...styles.btn, fontSize:9, padding:5}}>100/0.2T</button>
                        <button style={{...styles.btn, fontSize:9, padding:5}}>200/0.4T</button>
                        <button style={{...styles.btn, fontSize:9, padding:5}}>300/0.5T</button>
                    </div>
                    <div style={styles.promoBox}>
                       <small><b>PAY TO TON ADDRESS:</b></small>
                       <p style={{fontSize:9, wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                       <small><b>REQUIRED MEMO (UID):</b></small>
                       <p style={{fontSize:18, fontWeight:'bold', color:'#e11d48'}}>{APP_CONFIG.MY_UID}</p>
                    </div>
                    <button style={styles.btn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF TO ADMIN</button>
                    <button style={{...styles.btn, background:'none', color:'#000', marginTop:10}} onClick={() => setShowAddPromo(false)}>BACK</button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardInput === 'EASY2' && !completed.includes('REWARD_EASY2')) {
                     const newBal = Number((balance + 0.001).toFixed(5));
                     setBalance(newBal);
                     syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: [...completed, 'REWARD_EASY2'] });
                     alert("Success! +0.001 TON Added."); setRewardInput('');
                  } else { alert("Invalid or Already Used Code!"); }
                }}>CLAIM CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL</h2>
          <div style={styles.promoBox}>
            <small>YOUR INVITE LINK:</small>
            <p style={{fontSize:11, fontWeight:'bold', wordBreak:'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY LINK</button>
          </div>
          <div style={styles.row}><span>Total Friends Joined:</span><strong>{referralCount} Users</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => alert("Insufficient balance or check min amount!")}>WITHDRAW NOW</button>
          <div style={{marginTop:20}}>
            <h4>HISTORY</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div>
          <div style={styles.card}>
            <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
            <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
            <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          </div>
          <div style={styles.warn}>
            <b>⚠️ IMPORTANT NOTICE:</b><br/>
            Fake referrals, using multiple accounts, or any kind of bot automation is strictly forbidden. If detected, your account will be <b>PERMANENTLY BANNED</b> and all balance will be lost.
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
