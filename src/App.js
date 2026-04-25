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

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  // Admin States
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot'); // 'bot' or 'social'
  const [adminPromoCode, setAdminPromoCode] = useState('');

  // Firebase Tasks State
  const [dbTasks, setDbTasks] = useState({ bot: [], social: [] });

  const fetchData = useCallback(async () => {
    try {
      const [u, all, tasks] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/tasks.json`)
      ]);
      
      const userData = await u.json();
      const allUsers = await all.json();
      const fetchedTasks = await tasks.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(!!userData.isVip || APP_CONFIG.MY_UID === "5020977059" || APP_CONFIG.MY_UID === "1793453606");
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        // Invite History အတွက် referrals list ကိုယူခြင်း
        setReferrals(userData.referrals ? Object.entries(userData.referrals) : []);
      }

      if (allUsers) {
        const sorted = Object.entries(allUsers)
          .map(([id, data]) => ({ 
            id, 
            username: data.username || "No Name",
            balance: data.balance || 0 
          }))
          .sort((a, b) => b.balance - a.balance).slice(0, 10);
        setLeaderboard(sorted);
      }

      if (fetchedTasks) {
        setDbTasks({
          bot: fetchedTasks.bot ? Object.values(fetchedTasks.bot) : [],
          social: fetchedTasks.social ? Object.values(fetchedTasks.social) : []
        });
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Admin: Task သစ်ထည့်ရန် Function
  const handleCreateTask = async () => {
    if(!adminTaskName || !adminTaskLink) return alert("Fill all fields!");
    const taskId = `t_${Date.now()}`;
    const newTask = { id: taskId, name: adminTaskName, link: adminTaskLink, type: adminTaskType };
    
    await fetch(`${APP_CONFIG.FIREBASE_URL}/tasks/${adminTaskType}/${taskId}.json`, {
      method: 'PUT',
      body: JSON.stringify(newTask)
    });
    alert(`${adminTaskType.toUpperCase()} Task Created!`);
    setAdminTaskName(''); setAdminTaskLink('');
    fetchData();
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.main}>
      {/* Header balance section remains same */}

      {activeNav === 'earn' && (
        <>
          {/* Watch Ads Card */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && (
              <div>
                <h4>Create New Task</h4>
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <input style={styles.input} placeholder="Task Name (e.g. GrowTea Bot)" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background: 'green', marginBottom: 20}} onClick={handleCreateTask}>ADD TASK</button>
                <hr/>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="Promo Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={() => {/* Existing promo logic */}}>CREATE CODE</button>
              </div>
            )}
            {/* Display tasks from dbTasks.bot and dbTasks.social here */}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <>
          <div style={styles.card}>
            <h3>Refer & Earn</h3>
            <p>Earn {APP_CONFIG.REFER_REWARD} TON per friend!</p>
            <button style={styles.btn} onClick={() => { 
                navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
                alert("Link Copied!"); 
            }}>COPY REFERRAL LINK</button>
          </div>
          
          <div style={styles.card}>
            <h4>Invite History</h4>
            {referrals.length > 0 ? referrals.map(([id, time], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: 12 }}>
                <span>User ID: <b>{id}</b></span>
                <span style={{color: 'green'}}>+0.001 TON</span>
              </div>
            )) : <p style={{fontSize: 12, textAlign: 'center'}}>No referrals yet.</p>}
          </div>
        </>
      )}
      
      {/* Other sections (Withdraw, Profile, Nav) remain same but ensure 'RANK' is used for leaderboard */}
    </div>
  );
}

export default App;
