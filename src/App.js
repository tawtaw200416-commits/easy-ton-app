import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  MY_USERNAME: tg?.initDataUnsafe?.user?.username || "Unknown",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0009,
  VIP_WATCH_REWARD: 0.0025,
  CODE_REWARD: 0.0008,     
  VIP_CODE_REWARD: 0.0008, 
  REFER_REWARD: 0.001
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawMemo, setWithdrawMemo] = useState(''); // Memo State အသစ်
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  
  const [extraTasks, setExtraTasks] = useState({ bot: [], social: [] });

  const checkStatus = (timestamp) => {
    if (!timestamp) return "Pending";
    return (Date.now() - timestamp >= 300000) ? "Success" : "Pending";
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, all, tasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_tasks.json`)
      ]);
      const userData = await u.json();
      const allUsers = await all.json();
      const adminTasks = await tasksRes.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        const vipStatus = !!userData.isVip || APP_CONFIG.MY_UID === "5020977059" || APP_CONFIG.MY_UID === "1793453606";
        setIsVip(vipStatus);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.entries(userData.referrals) : []);
      }

      if (adminTasks) {
        setExtraTasks({
          bot: adminTasks.bot ? Object.values(adminTasks.bot) : [],
          social: adminTasks.social ? Object.values(adminTasks.social) : []
        });
      }

      if (allUsers) {
        const sorted = Object.entries(allUsers)
          .map(([id, data]) => ({ 
            id: id, 
            username: data.username || "No Name",
            balance: typeof data === 'object' ? (data.balance || 0) : 0 
          }))
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        setLeaderboard(sorted);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    if (id.startsWith('c_')) finalReward = APP_CONFIG.CODE_REWARD;
    else if (id === 'watch_ad') finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newCompleted = id !== 'watch_ad' ? [...completed, id] : completed;
          setBalance(newBal);
          if (id !== 'watch_ad') setCompleted(newCompleted);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted })
          });
          alert(`Reward Success: +${finalReward} TON`);
        }
      });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const botTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=3f47e34c" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    { id: 'b7', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    ...extraTasks.bot
  ];

  const socialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" },
    ...extraTasks.social
  ];

  const rewardPrizes = ["1 TON", "0.8 TON", "0.6 TON", "0.4 TON", "0.3 TON", "0.2 TON", "0.2 TON", "0.1 TON", "0.1 TON", "0.1 TON"];

  // STYLE ပြောင်းလဲမှုများ
  const styles = {
    main: { backgroundColor: '#1a237e', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #3f51b5' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    vipCard: { background: '#3f51b5', color: '#fff', border: '2px solid #fff', textAlign: 'center', padding: '20px', borderRadius: '20px', marginBottom: '15px' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', background:'#f9f9f9', fontSize:'14px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '2px solid #3f51b5' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#3f51b5', fontWeight:'bold'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#3f51b5', color:'#fff', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center', border:'2px solid #3f51b5'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#3f51b5', color: '#fff'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
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
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>Create Task</h4>
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">Bot Task</option>
                    <option value="social">Social Task</option>
                </select>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background: 'green', marginBottom: 15}} onClick={async () => {
                    if(!adminTaskName || !adminTaskLink) return alert("Fill all!");
                    const id = 'ext_' + Date.now();
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_tasks/${adminTaskType}/${id}.json`, {
                        method: 'PUT',
                        body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink })
                    });
                    alert("Task Added!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData();
                }}>ADD NEW TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'leaderboard' && (
        <div style={styles.card}>
          <div style={{background: '#000', color: '#3f51b5', padding: '10px', borderRadius: '10px', textAlign: 'center', marginBottom: '15px', border:'1px solid #3f51b5'}}>
             <h4 style={{margin: 0, color:'#fff'}}>RANKING SEASON ENDS ON</h4>
             <h2 style={{margin: '5px 0', color:'#fff'}}>30.5.2026</h2>
             <small style={{color: '#3f51b5'}}>VIP members can withdraw</small>
          </div>
          <h3 style={{textAlign:'center', marginBottom:15}}>🏆 Top 10 Earners</h3>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={i} style={{borderBottom:'1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#e8eaf6' : 'transparent'}}>
                  <td style={{padding:10, fontWeight:'bold'}}>{i+1}</td>
                  <td style={{padding:10, fontSize:11}}>User ID: {u.id.slice(0,10)}...</td>
                  <td style={{padding:10, textAlign:'right', fontWeight:'bold', color: '#1a237e'}}>{rewardPrizes[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.vipCard}>
             <h3 style={{margin: '0 0 10px 0'}}>GET VIP ACCESS ⭐</h3>
             <p style={{fontSize: '12px', margin: '0 0 15px 0'}}>Withdraw instantly and earn 3x more rewards!</p>
             <button style={{...styles.btn, background: '#fff', color: '#1a237e'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>UPGRADE NOW</button>
          </div>

          <div style={styles.card}>
            <h3 style={{marginTop:0}}>Withdraw TON</h3>
            <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>AMOUNT</label>
            <input style={styles.input} placeholder="Min 0.1 TON" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            
            <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>TON ADDRESS</label>
            <input style={styles.input} placeholder="Paste your TON address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            
            <label style={{fontSize:'12px', fontWeight:'bold', display:'block', marginBottom:'5px'}}>MEMO (OPTIONAL)</label>
            <input style={styles.input} placeholder="Enter memo if needed" value={withdrawMemo} onChange={e => setWithdrawMemo(e.target.value)} />
            
            <button style={{...styles.btn, background: '#1a237e'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdrawal is ${APP_CONFIG.MIN_WITHDRAW} TON`);
                if(amt > balance) return alert(`Insufficient balance!`);
                if(!withdrawAddress) return alert("Please enter TON address!");
                
                const newBal = Number((balance - amt).toFixed(5));
                const entry = { 
                  amount: withdrawAmount, 
                  address: withdrawAddress, 
                  memo: withdrawMemo || "None",
                  timestamp: Date.now(), 
                  date: new Date().toLocaleString() 
                };
                const newHistory = [entry, ...withdrawHistory];
                setBalance(newBal);
                setWithdrawHistory(newHistory);
                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                  method: 'PATCH',
                  body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
                });
                alert("Withdrawal Request Sent!");
            }}>CONFIRM WITHDRAW</button>
          </div>
          <div style={styles.card}>
            <h4 style={{marginTop:0}}>Recent History</h4>
            {withdrawHistory.length === 0 ? <p style={{fontSize:12, color:'#999'}}>No history yet.</p> : 
              withdrawHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{fontSize:11}}><b>{h.amount} TON</b><br/>{h.date}</div>
                  <div style={{ color: checkStatus(h.timestamp) === 'Success' ? 'green' : 'orange', fontWeight: 'bold', fontSize: '12px' }}>{checkStatus(h.timestamp)}</div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <>
          <div style={{...styles.card, background:'#000', color:'#fff', border:'2px solid #3f51b5', textAlign:'center'}}>
              <h3 style={{margin:'0 0 10px 0'}}>Invite Friends</h3>
              <p style={{fontSize: '14px', marginBottom: '15px'}}>Earn <b style={{color:'#3f51b5'}}>{APP_CONFIG.REFER_REWARD} TON</b> per referral!</p>
              <button style={{...styles.btn, background:'#3f51b5'}} onClick={() => { 
                  navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
                  alert("Referral Link Copied!"); 
              }}>COPY LINK</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>Profile Settings</h3>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Account: <b style={{color:'#1a237e'}}>{isVip ? "VIP Member ⭐" : "Standard User"}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'leaderboard', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#3f51b5' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n === 'leaderboard' ? 'RANK' : n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
