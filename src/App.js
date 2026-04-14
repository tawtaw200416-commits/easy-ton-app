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

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert("Success! +0.0005 TON Added.");
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
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    promoBox: { backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px', border: '2px dashed #000', margin: '15px 0' }
  };

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
  ];

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ].map((name, index) => ({ id: `s_${index}`, name, link: `https://t.me/${name.replace('@','')}` }));

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>LOADING DATA...</b></div>;

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
            {['BOT', 'SOCIAL', 'PROMOTE'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}

            {activeTab === 'social' && socialChannels.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
            ))}

            {activeTab === 'promote' && (
              <div>
                <h3 style={{marginTop:0, textAlign:'center'}}>PROMOTE YOUR CHANNEL</h3>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Link (https://t.me/...)" />
                <select style={styles.input}>
                  <option>100 Views - 0.2 TON</option>
                  <option>200 Views - 0.4 TON</option>
                  <option>300 Views - 0.5 TON</option>
                </select>
                <div style={styles.promoBox}>
                  <small><b>PAY TO TON ADDRESS:</b></small>
                  <p style={{fontSize:9, wordBreak:'break-all', margin:'5px 0'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                  <small><b>REQUIRED MEMO (YOUR UID):</b></small>
                  <p style={{fontSize:18, fontWeight:'bold', color:'#e11d48', margin:'5px 0'}}>{APP_CONFIG.MY_UID}</p>
                </div>
                <button style={styles.btn} onClick={() => window.open(`https://t.me/GrowTeaNews`)}>SEND PAYMENT PROOF</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL SYSTEM</h2>
          <p style={{textAlign:'center', fontSize:14}}>Earn <b>0.0005 TON</b> for every friend joined.</p>
          <div style={styles.promoBox}>
            <small>YOUR INVITE LINK:</small>
            <p style={{fontSize:11, fontWeight:'bold', wordBreak:'break-all', margin:'10px 0'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}} style={styles.btn}>COPY LINK</button>
          </div>
          <div style={styles.row}><span>Total Referrals:</span><strong>{referralCount} Users</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAWAL</h3>
          <input style={styles.input} type="number" placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => alert("Min balance 0.1 TON required!")}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.length === 0 ? <small>No records found.</small> : withdrawHistory.map((h,i) => <div key={i} style={styles.row}><span>{h.amount} TON</span><span>{h.status}</span></div>)}
        </div>
      )}

      {activeNav === 'profile' && (
        <div>
          <div style={styles.card}>
            <h2 style={{textAlign:'center', marginTop:0}}>USER PROFILE</h2>
            <div style={styles.row}><span>User ID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
            <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
            <div style={styles.row}><span>Status:</span><strong style={{color:'#10b981'}}>ACTIVE</strong></div>
          </div>
          <div style={{...styles.card, backgroundColor:'#fff1f2', border:'2px solid #e11d48'}}>
            <b style={{color:'#e11d48'}}>⚠️ SECURITY WARNING:</b>
            <p style={{fontSize:12, margin:'5px 0', lineHeight:'1.4'}}>Fake referrals, multiple accounts, or bot automation are strictly prohibited. Violators will be <b>PERMANENTLY BANNED</b> and funds will be confiscated.</p>
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
