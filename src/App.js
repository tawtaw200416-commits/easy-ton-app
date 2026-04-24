import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.001,
  REFER_REWARD: 0.001 
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');

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

  // အဟောင်းတွေမပျက်အောင် fetchData logic ကို အသေပြင်ဆင်ထားသည်
  const fetchData = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();

      if (userData) {
        // Balance ရှိမှ Update လုပ်မည်၊ မရှိလျှင် လက်ရှိ Balance အတိုင်းထားမည်
        if (userData.balance !== undefined) {
          setBalance(Number(userData.balance));
        }
        
        // Task List ရှိမှ Update လုပ်မည်
        if (userData.completed && Array.isArray(userData.completed)) {
          setCompleted(userData.completed);
        }

        // Withdraw History ရှိမှသာ Update လုပ်မည်၊ မရှိလျှင် အဟောင်းမပျက်စေရ
        if (userData.withdrawHistory && Array.isArray(userData.withdrawHistory) && userData.withdrawHistory.length > 0) {
          setWithdrawHistory(userData.withdrawHistory);
        }

        // Referral ရှိမှသာ Update လုပ်မည်၊ မရှိလျှင် အဟောင်းမပျက်စေရ
        if (userData.referrals && Array.isArray(userData.referrals) && userData.referrals.length > 0) {
          setReferrals(userData.referrals);
        }
      }

      if (tasksData) setCustomTasks(Object.values(tasksData));
    } catch (e) { 
      console.error("Data fetch error:", e); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then((result) => {
          if (result.done) {
            const newBal = Number((balance + rewardAmount).toFixed(5));
            setBalance(newBal);
            const newCompleted = id !== 'watch_ad' ? [...completed, id] : completed;
            if (id !== 'watch_ad') setCompleted(newCompleted);

            fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ balance: newBal, completed: newCompleted })
            });
            alert(`Reward Success: +${rewardAmount} TON`);
          } else {
            alert("Reward failed. You must watch the full ad.");
          }
        })
        .catch(() => alert("Ads failed to load. Please try again."));
    } else {
      alert("Ads system is not ready.");
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) {
      tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    }
    setTimeout(() => {
      processReward(id, reward);
    }, 1500);
  };

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', APP_CONFIG.WATCH_REWARD)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && socialTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, 0.001)}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>Admin Control</h4>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background: 'green'}} onClick={async () => {
                   const id = 't_'+Date.now();
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                   alert("Task Saved!"); fetchData();
                }}>SAVE TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Deposit Verification</h3>
            <div style={{background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #ef4444'}}>⚠️ Pay 1 TON for Verification</div>
            <p style={{fontSize: '11px', margin: '5px 0'}}>Wallet: <b>{APP_CONFIG.ADMIN_WALLET}</b></p>
            <button style={{...styles.btn, padding: '8px'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Wallet Copied!"); }}>COPY WALLET</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="TON Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw is ${APP_CONFIG.MIN_WITHDRAW}`);
                if(amt > balance) return alert(`Insufficient balance!`);

                const entry = { amount: withdrawAmount, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString() };
                const newHistory = [entry, ...withdrawHistory];
                const newBal = Number((balance - amt).toFixed(5));

                setWithdrawHistory(newHistory);
                setBalance(newBal);

                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                  method: 'PATCH',
                  body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
                });
                alert("Withdrawal Pending.");
            }}>WITHDRAW</button>
          </div>
          <div style={styles.card}>
            <h4>History</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{fontSize:11}}><b>{h.amount} TON</b><br/>{h.date}</div>
                <div style={{ color: checkStatus(h.timestamp) === 'Success' ? 'green' : 'orange', fontWeight: 'bold' }}>{checkStatus(h.timestamp)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Refer & Earn</h3>
          <button style={styles.btn} onClick={() => { 
            navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
            alert("Referral Link Copied!"); 
          }}>COPY LINK</button>
          <h4 style={{marginTop: '20px'}}>Invite History</h4>
          {referrals.length === 0 ? <p style={{fontSize:12}}>No referrals yet.</p> : 
            referrals.map((r, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>User ID: {r.id || r} (+{APP_CONFIG.REFER_REWARD} TON)</div>
            ))
          }
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
