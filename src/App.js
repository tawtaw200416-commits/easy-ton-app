import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODES: ["EASYTON1", "EASYTON2", "EASYTON3", "EASYTON4", "EASYTON5"],
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001,
  WATCH_REWARD: 0.0005 
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [dynamicCodes, setDynamicCodes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminNewPromoCode, setAdminNewPromoCode] = useState(''); 

  const checkStatus = (timestamp) => {
    if (!timestamp) return "Pending";
    return (Date.now() - timestamp >= 300000) ? "Success" : "Pending";
  };

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes, codesRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await userRes.json();
      const tasksData = await tasksRes.json();
      const codesData = await codesRes.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals || []);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key })));
      }
      if (codesData) {
        setDynamicCodes(Object.keys(codesData).map(key => ({ code: codesData[key].code, reward: codesData[key].reward })));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) { tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank'); }
    
    setTimeout(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      alert(`Success! +${reward} TON`);
    }, 2000); 
  };

  const botTasks = [
    { id: 'bot_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 's_1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's_2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's_3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's_4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's_5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's_6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 's_7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 's_8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's_9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 's_10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 's_11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 's_12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 's_13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 's_14', name: "@perviu1million", link: "https://t.me/perviu1million" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    alert: { background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '10px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
               )
            ))}
          </div>
          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '8px', background: completed.includes(t.id) ? '#ccc' : '#000'}} disabled={completed.includes(t.id)}>{completed.includes(t.id) ? 'DONE' : 'START'}</button></div>
            ))}
            {activeTab === 'social' && socialTasks.map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '8px', background: completed.includes(t.id) ? '#ccc' : '#000'}} disabled={completed.includes(t.id)}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button></div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {if(rewardCode) handleTaskReward('c_'+rewardCode, 0.001); setRewardCode('');}}>CLAIM REWARD</button>
              </div>
            )}
            {activeTab === 'admin' && (
               <div>
                  <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                  <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                  <button style={{...styles.btn, background: '#10b981'}} onClick={async () => {
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method: 'POST', body: JSON.stringify({ name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                    alert("Added!"); fetchData();
                  }}>ADD TASK</button>
               </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Deposit TON</h3>
            <div style={styles.alert}>⚠️ You must top up 1 TON to withdraw</div>
            <div style={{fontSize:12, marginBottom:10}}>Address: <b>{APP_CONFIG.ADMIN_WALLET}</b></div>
            <button style={{...styles.btn, padding:8, marginBottom:10}} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied Address!");}}>COPY ADDRESS</button>
            <div style={{fontSize:12, marginBottom:10}}>Memo (UID): <b>{APP_CONFIG.MY_UID}</b></div>
            <button style={{...styles.btn, padding:8}} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied Memo!");}}>COPY MEMO</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw History</h3>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}>
                <div><b>{h.amount} TON</b><br/><small>{h.date}</small></div>
                <div style={{color: checkStatus(h.timestamp) === 'Success' ? '#10b981' : '#f59e0b', fontWeight:'bold'}}>● {checkStatus(h.timestamp)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <button style={styles.btn} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!");}}>COPY INVITE LINK</button>
          <h4 style={{marginTop:20}}>Invite History</h4>
          {referrals.map((r, i) => (
            <div key={i} style={styles.row}><span>User: {r.id || r}</span> <b style={{color:'#10b981'}}>Complete</b></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>Profile</h3>
          <div style={styles.row}>Status: <b style={{color:'#10b981'}}>Active</b></div>
          <div style={styles.row}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}>Balance: <b>{balance.toFixed(5)} TON</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
