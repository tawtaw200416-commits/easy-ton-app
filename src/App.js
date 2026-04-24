import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0009,       // Normal User Reward (Changed to 0.0009)
  VIP_WATCH_REWARD: 0.003,   // VIP User Reward
  REFER_REWARD: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
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

  const fetchData = useCallback(async () => {
    try {
      const [u, t, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const allUsers = await all.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(!!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(Array.isArray(userData.referrals) ? userData.referrals : []);
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));

      if (allUsers) {
        const sorted = Object.entries(allUsers)
          .map(([id, data]) => ({ id, balance: data.balance || 0 }))
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        setLeaderboard(sorted);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    // Only watch_ad reward is modified based on VIP status
    const finalReward = (id === 'watch_ad') ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then((result) => {
          if (result.done) {
            const newBal = Number((balance + finalReward).toFixed(5));
            setBalance(newBal);
            const newCompleted = id !== 'watch_ad' ? [...completed, id] : completed;
            if (id !== 'watch_ad') setCompleted(newCompleted);

            fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ balance: newBal, completed: newCompleted })
            });
            alert(`Reward Success: +${finalReward} TON ${isVip ? '(VIP)' : ''}`);
            fetchData();
          } else {
            alert("Reward failed. You must watch the full ad.");
          }
        })
        .catch(() => alert("Ads failed to load."));
    } else {
      alert("Ads system is not ready.");
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) {
      tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    }
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
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
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
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
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background: 'green', marginBottom: '15px'}} onClick={async () => {
                   const id = 't_'+Date.now();
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                   alert("Task Saved!"); fetchData();
                }}>SAVE TASK</button>
                <input style={styles.input} placeholder="New Promo Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={async () => {
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method: 'PUT', body: JSON.stringify({ code: adminPromoCode, reward: 0.001 }) });
                   alert("Promo Code Created!");
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'leaderboard' && (
        <div style={styles.card}>
          <h3 style={{textAlign:'center', marginBottom:15}}>🏆 Top 10 Earners</h3>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #000'}}>
                <th style={{padding:8, textAlign:'left'}}>Rank</th>
                <th style={{padding:8, textAlign:'left'}}>User</th>
                <th style={{padding:8, textAlign:'right'}}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? leaderboard.map((u, i) => (
                <tr key={i} style={{borderBottom:'1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                  <td style={{padding:10}}>{i+1}</td>
                  <td style={{padding:10, fontSize:12}}>{u.id.slice(0,8)}...</td>
                  <td style={{padding:10, textAlign:'right', fontWeight:'bold'}}>{Number(u.balance).toFixed(4)}</td>
                </tr>
              )) : <tr><td colSpan="3" style={{textAlign:'center', padding:20}}>No users yet. Be the first!</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          {/* Upgrade to VIP section replacing Deposit section */}
          {!isVip && (
            <div style={styles.card}>
              <h3 style={{color: '#0ea5e9'}}>🚀 Upgrade to VIP</h3>
              <p style={{fontSize: '13px', margin: '10px 0'}}>
                Become a VIP to earn <b>0.003 TON</b> per ad!
              </p>
              <div style={{background: '#f0f9ff', padding: '10px', borderRadius: '10px', border: '1px solid #0ea5e9', marginBottom: '15px'}}>
                <p style={{fontSize: '11px', margin: '5px 0'}}>Admin Wallet: <b>{APP_CONFIG.ADMIN_WALLET}</b></p>
                <button style={{...styles.btn, background: '#0ea5e9', padding: '8px', fontSize: '12px'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Wallet Copied!"); }}>COPY WALLET</button>
                <p style={{fontSize: '11px', margin: '10px 0 5px 0'}}>Memo (Your ID): <b>{APP_CONFIG.MY_UID}</b></p>
                <button style={{...styles.btn, background: '#0ea5e9', padding: '8px', fontSize: '12px'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Memo Copied!"); }}>COPY MEMO</button>
              </div>
              <button style={{...styles.btn, background: '#0ea5e9'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>BUY VIP (Send Screenshot)</button>
            </div>
          )}

          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="TON Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
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
                window.open(APP_CONFIG.SUPPORT_BOT, '_blank');
            }}>WITHDRAW</button>
          </div>
          <div style={styles.card}>
            <h4>Withdraw History</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{fontSize:11}}><b>{h.amount} TON</b><br/>{h.date}</div>
                <div style={{ color: checkStatus(h.timestamp) === 'Success' ? 'green' : 'orange', fontWeight: 'bold', fontSize: '12px' }}>{checkStatus(h.timestamp)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Refer & Earn</h3>
          <p style={{fontSize: '14px', marginBottom: '10px'}}>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
          <button style={styles.btn} onClick={() => { 
            navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
            alert("Referral Link Copied!"); 
          }}>COPY REFERRAL LINK</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Status: <b>{isVip ? "VIP USER ⭐" : "ACTIVE ✅"}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT, '_blank')}>SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'leaderboard', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n === 'leaderboard' ? 'RANK' : n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
