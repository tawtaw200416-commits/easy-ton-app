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
  REFER_REWARD: 0.001
};

const VIP_IDS = ["5020977059", "1793453606"];

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [extraTasks, setExtraTasks] = useState({ bot: [], social: [] });

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

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await response.json();

      const [allRes, tasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_tasks.json`)
      ]);
      
      const allUsers = await allRes.json();
      const adminTasks = await tasksRes.json();

      setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || (userData && !!userData.isVip));

      // DATA PERSISTENCE CHECK
      if (userData !== null && typeof userData === 'object') {
        // If user exists, load existing data
        setBalance(userData.balance !== undefined ? parseFloat(userData.balance) : 0);
        setCompleted(Array.isArray(userData.completed) ? userData.completed : []);
        setWithdrawHistory(Array.isArray(userData.withdrawHistory) ? userData.withdrawHistory : []);
        setReferrals(userData.referrals ? Object.entries(userData.referrals) : []);
      } else {
        // Only create new profile if user doesn't exist (Prevent 0 reset)
        const initialData = { 
          balance: 0, 
          username: APP_CONFIG.MY_USERNAME,
          isVip: VIP_IDS.includes(APP_CONFIG.MY_UID), 
          completed: [], 
          withdrawHistory: [] 
        };
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PUT',
          body: JSON.stringify(initialData)
        });
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
            username: (data && data.username) ? data.username : "No Name",
            balance: (data && typeof data === 'object') ? (parseFloat(data.balance) || 0) : 0 
          }))
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        setLeaderboard(sorted);
      }
    } catch (e) { console.error("Fetch error:", e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    if (id.startsWith('c_')) finalReward = APP_CONFIG.CODE_REWARD;
    else if (id === 'watch_ad') finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then((result) => {
          if (result.done) {
            setBalance(prev => {
                const newBal = parseFloat((prev + finalReward).toFixed(5));
                const newCompleted = (id !== 'watch_ad' && !completed.includes(id)) ? [...completed, id] : completed;
                
                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                    method: 'PATCH',
                    body: JSON.stringify({ balance: newBal, completed: newCompleted })
                });
                if (id !== 'watch_ad') setCompleted(newCompleted);
                return newBal;
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

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' },
    blueBox: { background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: '10px', padding: '15px', marginBottom: '15px' },
    blueBtn: { width: '100%', padding: '12px', backgroundColor: '#60a5fa', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer', marginBottom: '10px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
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
                <hr/>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="Promo Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={async () => {
                   if(!adminPromoCode) return alert("Enter code name!");
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { 
                     method: 'PUT', 
                     body: JSON.stringify({ code: adminPromoCode, reward: APP_CONFIG.CODE_REWARD }) 
                   });
                   alert("Promo Code Created!"); setAdminPromoCode('');
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 10}}>💎 BUY VIP</h3>
            <p style={{fontSize: 14, margin: '10px 0'}}>Top up 1TON to get VIP</p>
            
            <div style={styles.blueBox}>
                <p style={{fontSize: 12, marginBottom: 5}}>Admin Wallet: <b>{APP_CONFIG.ADMIN_WALLET}</b></p>
                <button style={styles.blueBtn} onClick={() => {
                    navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET);
                    alert("Admin Wallet Copied!");
                }}>COPY WALLET</button>
                
                <p style={{fontSize: 12, marginBottom: 5, marginTop: 10}}>Memo (Your ID): <b>{APP_CONFIG.MY_UID}</b></p>
                <button style={styles.blueBtn} onClick={() => {
                    navigator.clipboard.writeText(APP_CONFIG.MY_UID);
                    alert("Memo (ID) Copied!");
                }}>COPY MEMO</button>
            </div>
            
            <button style={{...styles.blueBtn, marginTop: 5}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>VERIFY PAYMENT</button>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <p style={{fontSize:12, color:'#666', marginBottom:10}}>Min Withdrawal: 0.1 TON (No VIP required)</p>
            <input style={styles.input} placeholder="Amount (Min 0.1 TON)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
                const amt = parseFloat(withdrawAmount);
                if(isNaN(amt) || amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdrawal is ${APP_CONFIG.MIN_WITHDRAW} TON`);
                if(amt > balance) return alert(`Insufficient balance! Your balance: ${balance.toFixed(5)}`);
                if(!withdrawAddress) return alert("Enter TON Address!");

                const newBal = parseFloat((balance - amt).toFixed(5));
                const entry = { 
                  amount: amt, 
                  address: withdrawAddress, 
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
                alert("Withdrawal Request Sent! Balance Deducted.");
                setWithdrawAmount(''); setWithdrawAddress('');
            }}>WITHDRAW</button>
          </div>

          <div style={styles.card}>
            <h4>History</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{fontSize:11}}>
                  <b>{h.amount} TON</b><br/>{h.date}
                </div>
                <div style={{ color: checkStatus(h.timestamp) === 'Success' ? 'green' : 'orange', fontWeight: 'bold', fontSize: '12px' }}>{checkStatus(h.timestamp)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'leaderboard' && (
        <div style={styles.card}>
          <div style={{background: '#000', color: '#facc15', padding: '10px', borderRadius: '10px', textAlign: 'center', marginBottom: '15px'}}>
             <h4 style={{margin: 0}}>RANKING SEASON ENDS ON</h4>
             <h2 style={{margin: '5px 0'}}>30.5.2026</h2>
          </div>
          <h3 style={{textAlign:'center', marginBottom:5}}>🏆 Top 10 Earners & Prizes</h3>
          <p style={{textAlign:'center', fontSize: '14px', fontWeight: 'bold', marginBottom: 15, color: '#444'}}>For VIP customers</p>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #000'}}>
                <th style={{padding:8, textAlign:'left'}}>Rank</th>
                <th style={{padding:8, textAlign:'left'}}>User Info</th>
                <th style={{padding:8, textAlign:'right'}}>Prize</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={i} style={{borderBottom:'1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                  <td style={{padding:10}}>{i+1}</td>
                  <td style={{padding:10, fontSize:11}}>
                    {APP_CONFIG.MY_UID === "1793453606" ? (
                      <div>
                        <div style={{fontWeight:'bold', color:'#000'}}>{u.id}</div>
                        <div style={{color:'#666', fontSize: '10px'}}>@{u.username}</div>
                      </div>
                    ) : (
                      <div style={{fontWeight:'bold'}}>
                         {u.id === APP_CONFIG.MY_UID ? u.id : (u.id.slice(0,8) + "...")}
                      </div>
                    )}
                  </td>
                  <td style={{padding:10, textAlign:'right', fontWeight:'bold', color: '#059669'}}>{rewardPrizes[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeNav === 'invite' && (
        <>
          <div style={styles.card}>
              <h3>Refer & Earn</h3>
              <p style={{fontSize: '14px', marginBottom: '10px'}}>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
              <button style={styles.btn} onClick={() => { 
                  navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
                  alert("Referral Link Copied!"); 
              }}>COPY REFERRAL LINK</button>
          </div>
          <div style={styles.card}>
              <h4>Invite History</h4>
              {referrals.length === 0 ? <p style={{fontSize:12, color:'#999'}}>No referrals yet.</p> : 
                referrals.map(([uid, data], i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:12}}>
                    <span>User ID: <b>{uid}</b></span>
                    <span style={{color:'green'}}>+{APP_CONFIG.REFER_REWARD} TON</span>
                  </div>
                ))
              }
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Status: <b>{isVip ? "VIP ⭐" : "ACTIVE ✅"}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Username: <b>@{APP_CONFIG.MY_USERNAME}</b></div>
          <div style={{padding: '12px 0', borderBottom: '1px solid #eee'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
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
