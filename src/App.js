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

// Updated VIP list including 5020977059
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
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [extraTasks, setExtraTasks] = useState({ bot: [], social: [] });

  const fetchData = useCallback(async () => {
    try {
      const [uRes, allRes, tasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_tasks.json`)
      ]);
      
      const userData = await uRes.json();
      const allUsers = await allRes.json();
      const adminTasks = await tasksRes.json();

      // FIXED: Only update state if data exists, do NOT overwrite with initial values
      if (userData) {
        setBalance(userData.balance !== undefined ? parseFloat(userData.balance) : 0);
        setCompleted(Array.isArray(userData.completed) ? userData.completed : []);
        setWithdrawHistory(Array.isArray(userData.withdrawHistory) ? userData.withdrawHistory : []);
        setReferrals(userData.referrals ? Object.entries(userData.referrals) : []);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
      } else {
        // Only run for first-time users
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
        setIsVip(initialData.isVip);
      }

      // FIXED: Better leaderboard sorting and data validation
      if (allUsers) {
        const sorted = Object.entries(allUsers)
          .filter(([id, data]) => data && typeof data === 'object')
          .map(([id, data]) => ({ 
            id: id, 
            username: data.username || "User",
            balance: parseFloat(data.balance) || 0 
          }))
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        setLeaderboard(sorted);
      }

      if (adminTasks) {
        setExtraTasks({
          bot: adminTasks.bot ? Object.values(adminTasks.bot) : [],
          social: adminTasks.social ? Object.values(adminTasks.social) : []
        });
      }
    } catch (e) { 
      console.error("Fetch error:", e); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const saveToFirebase = async (newBal, newComp) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
    });
  };

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    if (id.startsWith('c_')) {
      finalReward = APP_CONFIG.CODE_REWARD;
    } else if (id === 'watch_ad') {
      finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    }

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
          if (result.done) {
            const newBal = parseFloat((balance + finalReward).toFixed(5));
            const newCompleted = id !== 'watch_ad' && !completed.includes(id) ? [...completed, id] : completed;
            
            setBalance(newBal);
            if (id !== 'watch_ad') setCompleted(newCompleted);
            saveToFirebase(newBal, newCompleted);
            alert(`Reward: +${finalReward} TON`);
          }
        });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 2000);
  };

  const rewardPrizes = ["1 TON", "0.8 TON", "0.6 TON", "0.4 TON", "0.3 TON", "0.2 TON", "0.2 TON", "0.1 TON", "0.1 TON", "0.1 TON"];

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
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Ad - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...extraTasks[activeTab]].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'leaderboard' && (
        <div style={styles.card}>
          <div style={{background: '#000', color: '#facc15', padding: '10px', borderRadius: '10px', textAlign: 'center', marginBottom: '15px'}}>
             <h4 style={{margin: 0}}>RANKING SEASON ENDS ON</h4>
             <h2 style={{margin: '5px 0'}}>30.5.2026</h2>
          </div>
          <h3 style={{textAlign:'center', marginBottom:15}}>🏆 Top 10 Earners</h3>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #000'}}>
                <th style={{padding:8, textAlign:'left'}}>Rank</th>
                <th style={{padding:8, textAlign:'left'}}>User Info</th>
                <th style={{padding:8, textAlign:'right'}}>Prize</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? leaderboard.map((u, i) => (
                <tr key={i} style={{borderBottom:'1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                  <td style={{padding:10}}>{i+1}</td>
                  <td style={{padding:10, fontSize:11}}>
                    {APP_CONFIG.MY_UID === "1793453606" ? (
                      <div><b>{u.id}</b><br/><small>@{u.username}</small></div>
                    ) : (
                      <b>{u.id === APP_CONFIG.MY_UID ? u.id : u.id.slice(0,8) + "..."}</b>
                    )}
                  </td>
                  <td style={{padding:10, textAlign:'right', fontWeight:'bold', color: '#059669'}}>{rewardPrizes[i]}</td>
                </tr>
              )) : <tr><td colSpan="3" style={{textAlign:'center', padding:20}}>Loading Ranks...</td></tr>}
            </tbody>
          </table>
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
