import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", // အစ်ကို့ ID
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODES: [
    "EASYTON1", "EASYTON2", "EASYTON3", "EASYTON4", "EASYTON5",
    "EASYTON6", "EASYTON7", "EASYTON8", "EASYTON9", "EASYTON10"
  ],
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

  const [userChannelName, setUserChannelName] = useState('');
  const [userChannelLink, setUserChannelLink] = useState('');

  // ၅ မိနစ်ပြည့်မပြည့် စစ်ဆေးပေးမည့် logic
  const checkStatus = (timestamp) => {
    if (!timestamp) return "Pending";
    const fiveMinutes = 5 * 60 * 1000;
    return (Date.now() - timestamp >= fiveMinutes) ? "Success" : "Pending";
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
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => { onSuccess(); })
        .catch((error) => { alert("Please watch full ad!"); });
    } else { alert("Ad network error."); }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) {
      if (tg && link.includes('t.me/')) { tg.openTelegramLink(link); } 
      else { window.open(link, '_blank'); }
    }
    alert("Verification in progress... Balance will be added in 5 mins.");
    runWithAd(() => {
        setTimeout(() => {
            const newBal = Number((balance + reward).toFixed(5));
            const newComp = [...completed, id];
            setBalance(newBal);
            setCompleted(newComp);
            fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ balance: newBal, completed: newComp })
            });
            alert("Reward Verified!");
        }, 300000); // 5 mins
    });
  };

  const handleWithdrawRequest = () => {
    const amount = Number(withdrawAmount);
    if (amount < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw: ${APP_CONFIG.MIN_WITHDRAW}`);
    if (amount > balance) return alert("Insufficient balance!");
    if (!withdrawAddress || withdrawAddress.length < 10) return alert("Enter valid address.");

    const newBal = Number((balance - amount).toFixed(5));
    const requestData = { amount, address: withdrawAddress, date: new Date().toLocaleString(), timestamp: Date.now(), status: "Pending" };
    
    setBalance(newBal);
    setWithdrawHistory([requestData, ...withdrawHistory]);
    setWithdrawAmount('');
    setWithdrawAddress('');

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: [requestData, ...withdrawHistory] })
    });
    alert("Request sent! Will show Success after 5 mins.");
  };

  const handleAdminAddTask = async () => {
    if (!adminTaskName || !adminTaskLink) return alert("Fill all fields!");
    const newTask = { id: 'task_' + Date.now(), name: adminTaskName, link: adminTaskLink, type: adminTaskType };
    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method: 'POST', body: JSON.stringify(newTask) });
    alert("Task Added!");
    setAdminTaskName(''); setAdminTaskLink(''); fetchData();
  };

  const handleAdminAddPromo = async () => {
    if (!adminNewPromoCode) return alert("Enter Code!");
    await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`, { method: 'POST', body: JSON.stringify({ code: adminNewPromoCode.toUpperCase(), reward: 0.001 }) });
    alert("Code Added!");
    setAdminNewPromoCode(''); fetchData();
  };

  const botTasks = [
    { id: 'bot1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
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
    alertBox: { background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '10px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }
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
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            {activeTab === 'social' && socialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {if(rewardCode) handleTaskReward('code_'+rewardCode, 0.001, null); setRewardCode('');}}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">BOT</option>
                    <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background:'#10b981', marginBottom:10}} onClick={handleAdminAddTask}>ADD TASK</button>
                <input style={styles.input} placeholder="New Promo Code" value={adminNewPromoCode} onChange={e => setAdminNewPromoCode(e.target.value)} />
                <button style={{...styles.btn, background:'#a855f7'}} onClick={handleAdminAddPromo}>ADD CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Deposit TON</h3>
            <div style={styles.alertBox}>⚠️ You must top up 1 TON to withdraw</div>
            <p style={{fontSize:12}}>Wallet: <br/><b>{APP_CONFIG.ADMIN_WALLET}</b></p>
            <button style={{...styles.btn, padding:8, marginBottom:10}} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");}}>COPY ADDRESS</button>
            <p style={{fontSize:12}}>Memo (User ID): <br/><b>{APP_CONFIG.MY_UID}</b></p>
            <button style={{...styles.btn, padding:8}} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");}}>COPY MEMO</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdrawRequest}>WITHDRAW NOW</button>
            <h4 style={{marginTop:20}}>History</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}>
                <div style={{fontSize:12}}><b>{h.amount} TON</b><br/>{h.date}</div>
                <div style={{color: checkStatus(h.timestamp) === 'Success' ? '#10b981' : '#f59e0b', fontWeight:'bold'}}>● {checkStatus(h.timestamp)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <div style={styles.row}><span>Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Referrals:</span> <b>{referrals.length}</b></div>
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
