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
  WATCH_REWARD: 0.001 
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
        setDynamicCodes(Object.keys(codesData).map(key => ({ 
            code: codesData[key].code, 
            reward: codesData[key].reward 
        })));
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
        .catch((error) => { alert("Please watch the full ad to proceed!"); });
    } else { alert("Ad network not loaded."); }
  };

  const handleWatchAd = () => {
    runWithAd(() => {
      const newBal = Number((balance + APP_CONFIG.WATCH_REWARD).toFixed(5));
      setBalance(newBal);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal })
      });
      alert(`Success! +${APP_CONFIG.WATCH_REWARD} TON`);
    });
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    if (link) {
      if (tg && link.includes('t.me/')) { tg.openTelegramLink(link); } 
      else { window.open(link, '_blank'); }
    }
    runWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      alert(`Task Success! +${reward} TON`);
    });
  };

  const handleClaimCode = () => {
    const input = rewardCode.toUpperCase().trim();
    if (!input) return;
    const isHardcoded = APP_CONFIG.REWARD_CODES.includes(input);
    const dynamicMatch = dynamicCodes.find(c => c.code === input);
    if (isHardcoded || dynamicMatch) {
      const rewardId = 'code_' + input;
      if (completed.includes(rewardId)) return alert("Already used!");
      const rewardAmt = dynamicMatch ? dynamicMatch.reward : 0.001;
      handleTaskReward(rewardId, rewardAmt, null);
      setRewardCode('');
    } else { alert('Invalid Code!'); }
  };

  // အသစ်ပြင်ဆင်ထားသော Withdraw Function (Data ကို "withdrawals" node ထဲ ပို့ပေးမည်)
  const handleWithdrawRequest = () => {
    const amount = Number(withdrawAmount);
    if (amount < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amount > balance) return alert("Insufficient balance!");
    if (!withdrawAddress) return alert("Enter wallet address.");

    runWithAd(async () => {
      const newBal = Number((balance - amount).toFixed(5));
      const requestData = { 
        uid: APP_CONFIG.MY_UID, 
        amount, 
        address: withdrawAddress, 
        timestamp: Date.now(), 
        date: new Date().toLocaleString(), 
        status: "Pending" 
      };

      try {
        // ၁။ User ဆီက balance ကို နှုတ်မယ်
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal })
        });

        // ၂။ Withdrawals ဆိုတဲ့ နေရာမှာ အချက်အလက်တွေ စုသိမ်းမယ်
        await fetch(`${APP_CONFIG.FIREBASE_URL}/withdrawals.json`, {
          method: 'POST',
          body: JSON.stringify(requestData)
        });

        setBalance(newBal);
        setWithdrawAmount('');
        setWithdrawAddress('');
        alert("Withdrawal request sent!");
        fetchData(); 
      } catch (e) {
        alert("Network Error.");
      }
    });
  };

  const handleAdminAddPromo = async () => {
    if (!adminNewPromoCode) return alert("Enter code!");
    const newCode = adminNewPromoCode.toUpperCase().trim();
    runWithAd(async () => {
      try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`, { method: 'POST', body: JSON.stringify({ code: newCode, reward: 0.001 }) });
        alert("Promo Code Added!");
        setAdminNewPromoCode('');
        fetchData(); 
      } catch (e) { alert("Failed to add code."); }
    });
  };

  const handleAdminAddTask = async () => {
    if (!adminTaskName || !adminTaskLink) return alert("Fill all fields!");
    runWithAd(async () => {
      const newTask = { id: 'task_' + Date.now(), name: adminTaskName, link: adminTaskLink, type: adminTaskType };
      try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method: 'POST', body: JSON.stringify(newTask) });
        alert("Task Added!");
        setAdminTaskName(''); setAdminTaskLink('');
        fetchData(); 
      } catch (e) { alert("Error."); }
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
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    copyBtn: { padding: '4px 8px', background: '#000', color: '#fff', fontSize: '10px', borderRadius: '5px', border: 'none', marginLeft: '5px', cursor: 'pointer' },
    alertBox: { background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '10px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video & Get 0.001 TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAd}>WATCH VIDEO</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
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
              <div>
                <input style={styles.input} placeholder="Enter Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={handleClaimCode}>CLAIM</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                 <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                 <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                 <button style={{...styles.btn, background: '#10b981', marginBottom: 15}} onClick={handleAdminAddTask}>ADD TASK</button>
                 <input style={styles.input} placeholder="Promo Code" value={adminNewPromoCode} onChange={e => setAdminNewPromoCode(e.target.value)} />
                 <button style={{...styles.btn, background: '#a855f7'}} onClick={handleAdminAddPromo}>ADD CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
             <button style={{...styles.btn, flex:1, background: activeTab === 'withdraw' ? '#000' : '#eee', color: activeTab === 'withdraw' ? '#fff' : '#000'}} onClick={() => setActiveTab('withdraw')}>WITHDRAW</button>
             <button style={{...styles.btn, flex:1, background: activeTab === 'deposit' ? '#000' : '#eee', color: activeTab === 'deposit' ? '#fff' : '#000'}} onClick={() => setActiveTab('deposit')}>DEPOSIT</button>
          </div>

          {activeTab === 'deposit' ? (
            <div>
              <div style={styles.alertBox}>⚠️ You must top up 1 TON to withdraw</div>
              <p style={{fontSize: '12px'}}><b>TON Address:</b></p>
              <div style={styles.row}><small style={{wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</small><button style={styles.copyBtn} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");}}>copy</button></div>
              <p style={{fontSize: '12px', marginTop: '10px'}}><b>MEMO (User ID):</b></p>
              <div style={styles.row}><b>{APP_CONFIG.MY_UID}</b><button style={styles.copyBtn} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");}}>copy</button></div>
              <p style={{fontSize: '10px', color: 'red', marginTop: '10px'}}>* Send TON with MEMO to credit your account manually.</p>
            </div>
          ) : (
            <>
              <input style={styles.input} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
              <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdrawRequest}>WITHDRAW NOW</button>
              
              <h4 style={{marginTop:25, marginBottom:10}}>Withdraw History</h4>
              {withdrawHistory.map((h, i) => {
                const isSuccess = Date.now() - (h.timestamp || 0) >= 600000;
                return (
                  <div key={i} style={{...styles.row, fontSize:12}}>
                    <div><b>{h.amount} TON</b><br/><small>{h.date}</small></div>
                    <div style={{color: isSuccess ? '#10b981' : '#f59e0b'}}>● {isSuccess ? "Success" : "Pending"}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Referral Program</h3>
          <p style={{fontSize:12}}>Share link & earn <b>{APP_CONFIG.REF_REWARD} TON</b></p>
          <div style={{background:'#eee', padding:10, borderRadius:10, fontSize:11, border:'1px dashed #000'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</div>
          <button style={{...styles.btn, marginTop:10}} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <div style={styles.row}><span>Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'withdraw', 'invite', 'profile'].map(n => (
          <div key={n} onClick={() => {setActiveNav(n); if(n==='withdraw') setActiveTab('withdraw');}} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'11px', fontWeight:'bold'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
