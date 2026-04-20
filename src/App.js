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

  // Adsgram logic
  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess()) 
        .catch(() => alert("Please watch the full ad to proceed!"));
    } else { onSuccess(); }
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

  // Bot နဲ့ Social အတွက် Task logic
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    
    runWithAd(() => {
      // ၁။ Ads ကြည့်ပြီးမှ Link ကိုသွားမယ်
      if (link) {
        if (tg && link.includes('t.me/')) { 
          tg.openTelegramLink(link); 
        } else { 
          window.open(link, '_blank'); 
        }
      }
      
      // ၂။ ပြီးမှ Ton ပေါင်းမယ်
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

  const handleWithdrawRequest = () => {
    const amount = Number(withdrawAmount);
    if (amount < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amount > balance) return alert("Insufficient balance!");
    if (!withdrawAddress || withdrawAddress.length < 10) return alert("Please enter a valid TON wallet address.");

    runWithAd(() => {
      const newBal = Number((balance - amount).toFixed(5));
      const requestData = {
        amount,
        address: withdrawAddress,
        date: new Date().toLocaleString(),
        status: "Pending"
      };
      
      const newHistory = [requestData, ...withdrawHistory];
      setBalance(newBal);
      setWithdrawHistory(newHistory);
      setWithdrawAmount('');
      setWithdrawAddress('');

      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
      });

      const logData = btoa(unescape(encodeURIComponent(`Withdraw: ${amount} TON to ${withdrawAddress}`)));
      if (tg) tg.openTelegramLink(`${APP_CONFIG.HELP_BOT}?start=wd_${logData}`);
      alert("Withdrawal request sent!");
    });
  };

  const handleUserAddChannel = () => {
    if (!userChannelName || !userChannelLink) return alert("Please fill both Name and Link!");
    
    runWithAd(() => {
      const logData = btoa(unescape(encodeURIComponent(`User Task Submission:\nName: ${userChannelName}\nLink: ${userChannelLink}`)));
      if (tg) tg.openTelegramLink(`${APP_CONFIG.HELP_BOT}?start=addtask_${logData}`);
      alert("Submitted to support!");
      setUserChannelName('');
      setUserChannelLink('');
    });
  };

  const handleAdminAddTask = async () => {
    if (!adminTaskName || !adminTaskLink) return alert("Please fill Admin fields!");
    runWithAd(async () => {
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
    { id: 'bot_new_5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_new_6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
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
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video & Get 0.0005 TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAd}>WATCH VIDEO</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => runWithAd(() => setActiveTab(t.toLowerCase()))} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
               )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && (
              <>
                <div style={{paddingBottom: 15, borderBottom: '2px solid #eee', marginBottom: 15}}>
                   <h4 style={{marginTop:0}}>+ Add Your Channel Task</h4>
                   <input style={styles.input} placeholder="Channel Name" value={userChannelName} onChange={e => setUserChannelName(e.target.value)} />
                   <input style={styles.input} placeholder="Channel Link" value={userChannelLink} onChange={e => setUserChannelLink(e.target.value)} />
                   <button style={{...styles.btn, background: '#24A1DE'}} onClick={handleUserAddChannel}>SUBMIT TO SUPPORT</button>
                </div>
                {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div><input style={styles.input} placeholder="Enter Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
              <button style={styles.btn} onClick={() => {
                // Code တစ်ခါသုံး Logic
                if(completed.includes('code_'+APP_CONFIG.REWARD_CODE)) return alert("Reward code already used!");
                
                if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                   // Claim ကို Ads မထည့်ဘဲ တိုက်ရိုက် Reward ပေးမယ် (Bro တောင်းဆိုချက်အရ)
                   const newBal = Number((balance + 0.001).toFixed(5));
                   const newComp = [...completed, 'code_'+APP_CONFIG.REWARD_CODE];
                   setBalance(newBal);
                   setCompleted(newComp);
                   fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                     method: 'PATCH',
                     body: JSON.stringify({ balance: newBal, completed: newComp })
                   });
                   alert('Success! +0.001 TON Added');
                   setRewardCode('');
                } else { 
                   alert('Invalid Code!'); 
                }
              }}>CLAIM</button></div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                 <h4 style={{marginTop:0}}>Admin: Add Global Task</h4>
                 <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                 <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                 <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">BOT</option>
                    <option value="social">SOCIAL</option>
                 </select>
                 <button style={{...styles.btn, background: '#10b981'}} onClick={handleAdminAddTask}>ADD GLOBAL TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>Referral Program</h3>
          <p style={{fontSize:14}}>Share your link and earn <b>0.001 TON</b>!</p>
          <div style={{background:'#eee', padding:10, borderRadius:10, fontSize:12, wordBreak:'break-all', border:'1px dashed #000'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</div>
          <button style={{...styles.btn, marginTop:10}} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!"); }}>COPY LINK</button>
          
          <h4 style={{marginBottom:10, marginTop:25}}>Invite History</h4>
          {referrals.length === 0 ? <p style={{color:'#999', fontSize:12}}>No friends invited yet.</p> : 
            referrals.map((r, i) => (<div key={i} style={styles.row}><span>User ID: {r.id}</span><span style={{color:'#10b981'}}>Complete +0.001 TON</span></div>))
          }
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={handleWithdrawRequest}>WITHDRAW NOW</button>
          
          <h4 style={{marginTop:25, marginBottom:10}}>Withdraw History</h4>
          {withdrawHistory.length === 0 ? <p style={{color:'#999', fontSize:12}}>No history.</p> : 
            withdrawHistory.map((h, i) => (
              <div key={i} style={{...styles.row, fontSize:12}}>
                <div><b>{h.amount} TON</b><br/><small>{h.date}</small></div>
                <div style={{color: '#f59e0b'}}>● {h.status}</div>
              </div>
            ))
          }
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>My Profile</h3>
          <div style={styles.row}><span>Status:</span> <b style={{color:'#10b981'}}>Active</b></div>
          <div style={styles.row}><span>Balance:</span> <b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>User ID:</span> <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Support:</span> <b style={{color:'#3b82f6', cursor:'pointer'}} onClick={() => runWithAd(() => { if(tg) tg.openTelegramLink(APP_CONFIG.HELP_BOT); else window.open(APP_CONFIG.HELP_BOT); })}>@EasyTonHelp_Bot</b></div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n))} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;

