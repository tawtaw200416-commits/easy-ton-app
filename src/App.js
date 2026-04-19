import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY3",
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });

  // Persistent storage logic
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await userRes.json();
      const tasksData = await tasksRes.json();
      
      if (userData) {
        if (userData.balance !== undefined) setBalance(Number(userData.balance));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals || []);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key })));
      }
    } catch (e) { console.error("Sync Error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); tg.setHeaderColor('#000000'); }
    fetchData();
  }, [fetchData]);

  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch(() => alert("Ad view required!"));
    } else { onSuccess(); }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;
    runWithAd(() => {
      let finalLink = link.startsWith('@') ? `https://t.me/${link.replace('@', '')}` : link;
      
      tg.openTelegramLink(finalLink);

      setTimeout(() => {
        const newBal = Number((balance + reward).toFixed(5));
        const newComp = [...completed, id];
        setBalance(newBal);
        setCompleted(newComp);
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newComp })
        });
      }, 5000);
    });
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW || amt > balance || !withdrawAddress) return alert("Invalid entry");

    runWithAd(() => {
      const newBal = Number((balance - amt).toFixed(5));
      const newEntry = { amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: "Pending" };
      const newHistory = [newEntry, ...withdrawHistory];
      setBalance(newBal);
      setWithdrawHistory(newHistory);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
      });
      setWithdrawAmount(''); setWithdrawAddress('');
    });
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
    { id: 'soc_1', name: "Grow Tea News", link: "@GrowTeaNews" },
    { id: 'soc_2', name: "Golden Miner News", link: "@GoldenMinerNews" },
    { id: 'soc_3', name: "Official Crypto Gold", link: "@cryptogold_online_official" },
    { id: 'soc_4', name: "M9460 News", link: "@M9460" },
    { id: 'soc_5', name: "USDT Cloud Miner", link: "@USDTcloudminer_channel" },
    { id: 'soc_6', name: "ADS TON Channel", link: "@ADS_TON1" },
    { id: 'soc_7', name: "Goblin Crypto", link: "@goblincrypto" },
    { id: 'soc_8', name: "World Best Crypto", link: "@WORLDBESTCRYTO" },
    { id: 'soc_9', name: "Kombo Crypta", link: "@kombo_crypta" },
    { id: 'soc_10', name: "Easy TON Free", link: "@easytonfree" },
    { id: 'soc_11', name: "World Best Crypto 1", link: "@WORLDBESTCRYTO1" },
    { id: 'soc_12', name: "Money Hub 9", link: "@MONEYHUB9_69" },
    { id: 'soc_13', name: "ZRBTUA Official", link: "@zrbtua" },
    { id: 'soc_14', name: "Perviu 1 Million", link: "@perviu1million" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', backgroundColor: '#000', padding: '30px 15px', borderRadius: '25px', marginBottom: '20px', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0', zIndex: 100 },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #000', marginBottom: '10px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '40px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:14, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981'}}>● SYSTEM ACTIVE</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} 
                  onClick={() => setActiveTab(t.toLowerCase())} 
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', border:'2px solid #000', fontSize:'12px', fontWeight:'bold'}}>
                  {t}
                </button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '80px', padding: '6px'}}>START</button></div>
            ))}
            {activeTab === 'social' && socialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '80px', padding: '6px'}}>JOIN</button></div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => { if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, 0.001, APP_CONFIG.HELP_BOT); }}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <input style={styles.input} placeholder="Task Name" onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <button style={styles.btn} onClick={async () => {
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method: 'POST', body: JSON.stringify({...adminTask, id: 'c_'+Date.now()}) });
                   fetchData();
                }}>ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p style={{fontSize:12}}>Earn {APP_CONFIG.REF_REWARD} TON per referral</p>
          <div style={{background:'#eee', padding:'10px', borderRadius:'8px', wordBreak:'break-all', fontSize:10, marginBottom:10}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</div>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied"); }}>COPY LINK</button>
          <h4 style={{marginTop:20}}>History</h4>
          {referrals.map((r, i) => (<div key={i} style={styles.row}><span>ID: {r.id}</span><span style={{color:'#10b981'}}>+0.001</span></div>))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdraw}>WITHDRAW</button>
          <h4 style={{marginTop:20}}>History</h4>
          {withdrawHistory.map((h, i) => (<div key={i} style={styles.row}><div><b>{h.amount}</b><br/><small>{h.date}</small></div><div style={{color:'#f59e0b'}}>{h.status}</div></div>))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <p>ID: {APP_CONFIG.MY_UID}</p>
          <p>Balance: {balance.toFixed(5)} TON</p>
          <button style={{...styles.btn, background:'#24A1DE'}} onClick={() => tg.openTelegramLink(APP_CONFIG.HELP_BOT)}>SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:10, fontWeight:'bold'}}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
