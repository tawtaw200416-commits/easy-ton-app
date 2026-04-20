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
  TASK_REWARD: 0.001,
  WATCH_REWARD: 0.0005 
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
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');

  const [userChannelName, setUserChannelName] = useState('');
  const [userChannelLink, setUserChannelLink] = useState('');

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
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals || []);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key })));
      }
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  // Adsgram Helper (Wait until finish)
  const showAd = (callback) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { if(callback) callback(); })
        .catch(() => { 
          alert("Please watch the full ad!"); 
          // Optional: callback() here if you want to skip penalty
        });
    } else { if(callback) callback(); }
  };

  // Nav & Tab Switch: Ads အရင်ပြပြီးမှ ရွှေ့ပေးမယ်
  const handleNavSwitch = (nav) => {
    showAd(() => setActiveNav(nav)); 
  };

  const handleTabSwitch = (tab) => {
    showAd(() => setActiveTab(tab));
  };

  // Task: Link -> Ads -> TON ပေါင်း
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    
    // ၁။ Link ကို အရင်ပို့
    if (link) {
      if (tg && link.includes('t.me/')) tg.openTelegramLink(link);
      else window.open(link, '_blank');
    }

    // ၂။ Ads ပြ
    setTimeout(() => {
      showAd(() => {
        // ၃။ ပိုက်ဆံပေါင်း
        const newBal = Number((balance + reward).toFixed(5));
        const newComp = [...completed, id];
        setBalance(newBal);
        setCompleted(newComp);
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newComp })
        });
        alert(`Success! +${reward} TON`);
      });
    }, 800);
  };

  // Claim: TON အရင်ပေါင်း -> ပီးမှ Ads
  const handleClaimReward = () => {
    if (completed.includes('code_'+APP_CONFIG.REWARD_CODE)) return alert("Code used!");
    if (rewardCode.toUpperCase() !== APP_CONFIG.REWARD_CODE) return alert('Invalid Code!');

    const reward = 0.001;
    const newBal = Number((balance + reward).toFixed(5));
    const newComp = [...completed, 'code_'+APP_CONFIG.REWARD_CODE];
    
    // TON အရင်ပေါင်း
    setBalance(newBal);
    setCompleted(newComp);
    setRewardCode('');
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, completed: newComp })
    });
    alert(`Reward Claimed! +${reward} TON`);

    // ပီးမှ Ads ပြ
    setTimeout(() => showAd(), 500);
  };

  const handleWatchAd = () => {
    showAd(() => {
      const newBal = Number((balance + APP_CONFIG.WATCH_REWARD).toFixed(5));
      setBalance(newBal);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal })
      });
      alert(`Success! +${APP_CONFIG.WATCH_REWARD} TON`);
    });
  };

  // Admin Function
  const handleAdminAddTask = async () => {
    if (!adminTaskName || !adminTaskLink) return alert("Fill all fields!");
    showAd(async () => {
      const newTask = {
        id: 'task_' + Date.now(),
        name: adminTaskName,
        link: adminTaskLink,
        type: adminTaskType
      };
      try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, {
          method: 'POST',
          body: JSON.stringify(newTask)
        });
        alert("Global Task Added!");
        setAdminTaskName(''); setAdminTaskLink('');
        fetchData();
      } catch (e) { alert("Failed."); }
    });
  };

  const botTasks = [
    { id: 'bot_new_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_new_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_new_3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_new_4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 's_1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's_10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
             <button style={styles.btn} onClick={handleWatchAd}>WATCH VIDEO</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => handleTabSwitch(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
               )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && socialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
            ))}

            {activeTab === 'reward' && (
              <div><input style={styles.input} placeholder="Enter Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
              <button style={styles.btn} onClick={handleClaimReward}>CLAIM</button></div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                 <h4 style={{marginTop:0}}>Admin Panel</h4>
                 <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                 <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                 <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">BOT</option>
                    <option value="social">SOCIAL</option>
                 </select>
                 <button style={{...styles.btn, background: '#10b981'}} onClick={handleAdminAddTask}>ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Other Views (Invite, Withdraw, Profile) - Same Structure as Original */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>Referral Program</h3>
          <p>Earn 0.001 TON per friend!</p>
          <div style={{background:'#eee', padding:10, borderRadius:10, fontSize:12, wordBreak:'break-all'}}>{`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`}</div>
          <button style={{...styles.btn, marginTop:10}} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); showAd(); }}>COPY LINK</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw History</h3>
          {withdrawHistory.length === 0 ? <p>No history</p> : 
            withdrawHistory.map((h, i) => (<div key={i} style={styles.row}><span>{h.amount} TON</span><span>{h.status}</span></div>))
          }
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => handleNavSwitch(n)} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', cursor:'pointer'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
