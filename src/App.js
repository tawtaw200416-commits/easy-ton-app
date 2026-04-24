import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
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

  // Status Checking Logic (၅ မိနစ်ပြည့်လျှင် Success ပြမည်)
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

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) {
      if (tg && link.includes('t.me/')) { tg.openTelegramLink(link); } 
      else { window.open(link, '_blank'); }
    }
    alert("Reward will be added after confirmation (5 mins).");
    setTimeout(async () => {
        const newBal = Number((balance + reward).toFixed(5));
        const newComp = [...completed, id];
        setBalance(newBal);
        setCompleted(newComp);
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newComp })
        });
        alert(`Success! +${reward} TON added.`);
    }, 10000); // Demo အနေနဲ့ ၁၀ စက္ကန့်ထားပါတယ်၊ ၅ မိနစ်အတွက် 300000 ပြောင်းပါ
  };

  const handleWithdrawRequest = () => {
    const amount = Number(withdrawAmount);
    if (amount < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amount > balance) return alert("Insufficient balance!");
    if (!withdrawAddress || withdrawAddress.length < 10) return alert("Valid TON address required.");

    const newBal = Number((balance - amount).toFixed(5));
    const requestData = { 
      amount, 
      address: withdrawAddress, 
      date: new Date().toLocaleString(), 
      timestamp: Date.now(), 
      status: "Pending" 
    };
    
    setBalance(newBal);
    setWithdrawHistory([requestData, ...withdrawHistory]);
    setWithdrawAmount('');
    setWithdrawAddress('');

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: [requestData, ...withdrawHistory] })
    });
    alert("Withdrawal submitted! Processed in 5 mins.");
  };

  const copyToClipboard = (text, msg) => {
    navigator.clipboard.writeText(text);
    alert(msg);
  };

  // Task Data ဟောင်းများ
  const botTasks = [
    { id: 'bot_new_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
    { id: 'bot_new_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMiner" }
  ];

  const socialTasks = [
    { id: 's_10', name: "@easytonfree", link: "https://t.me/easytonfree" }
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    copyBox: { background: '#f3f4f6', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px', border: '1px dashed #000', wordBreak: 'break-all' },
    alertBox: { background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '10px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.map(task => (
              <div key={task.id} style={styles.row}><b>{task.name}</b><button onClick={() => handleTaskReward(task.id, 0.001, task.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            {activeTab === 'social' && socialTasks.map(task => (
              <div key={task.id} style={styles.row}><b>{task.name}</b><button onClick={() => handleTaskReward(task.id, 0.001, task.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          {/* Deposit Section */}
          <div style={styles.card}>
            <h3 style={{marginTop:0}}>Deposit TON</h3>
            
            {/* အနီရောင် Alert Box */}
            <div style={styles.alertBox}>⚠️ You must top up 1 TON to withdraw</div>
            
            <label style={{fontSize:12, fontWeight:'bold'}}>Admin Wallet Address:</label>
            <div style={styles.copyBox}>{APP_CONFIG.ADMIN_WALLET}</div>
            <button style={{...styles.btn, padding:'8px', marginBottom:'15px'}} onClick={() => copyToClipboard(APP_CONFIG.ADMIN_WALLET, "Wallet Address Copied!")}>COPY ADDRESS</button>

            <label style={{fontSize:12, fontWeight:'bold'}}>Comment / Memo (User ID):</label>
            <div style={styles.copyBox}>{APP_CONFIG.MY_UID}</div>
            <button style={{...styles.btn, padding:'8px'}} onClick={() => copyToClipboard(APP_CONFIG.MY_UID, "Memo (UID) Copied!")}>COPY MEMO</button>
          </div>

          {/* Withdraw Section */}
          <div style={styles.card}>
            <h3 style={{marginTop:0}}>Withdraw TON</h3>
            <input style={styles.input} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdrawRequest}>WITHDRAW NOW</button>
            
            <h4 style={{marginTop:25, marginBottom:10}}>History</h4>
            {withdrawHistory.map((h, i) => (
                <div key={i} style={styles.row}>
                  <div style={{fontSize:12}}><b>-{h.amount} TON</b><br/><small>{h.date}</small></div>
                  <div style={{color: checkStatus(h.timestamp) === 'Success' ? '#10b981' : '#f59e0b', fontSize:12, fontWeight:'bold'}}>
                    ● {checkStatus(h.timestamp)}
                  </div>
                </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>Invite Link: https://t.me/Bot?start={APP_CONFIG.MY_UID}</div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>User ID: {APP_CONFIG.MY_UID}</div>
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
