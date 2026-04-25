import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [extraTasks, setExtraTasks] = useState({ bot: [], social: [] });
  
  // Loading state is CRITICAL to prevent data loss
  const [isLoading, setIsLoading] = useState(true);
  const isFetched = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetched.current) return;
    setIsLoading(true);
    
    try {
      // 1. Check if user exists first
      const uRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await uRes.json();

      if (userData) {
        // Load existing data safely
        setBalance(userData.balance !== undefined ? parseFloat(userData.balance) : 0);
        setCompleted(Array.isArray(userData.completed) ? userData.completed : []);
        setWithdrawHistory(Array.isArray(userData.withdrawHistory) ? userData.withdrawHistory : []);
        setReferrals(userData.referrals ? Object.entries(userData.referrals) : []);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
      } else {
        // ONLY create if user doesn't exist
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
        setBalance(0);
        setIsVip(initialData.isVip);
      }

      // 2. Fetch other global data
      const [allUsersRes, adminTasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_tasks.json`)
      ]);
      
      const allUsers = await allUsersRes.json();
      const adminTasks = await adminTasksRes.json();

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
            username: data?.username || "No Name",
            balance: data?.balance ? parseFloat(data.balance) : 0 
          }))
          .sort((a, b) => b.balance - a.balance)
          .slice(0, 10);
        setLeaderboard(sorted);
      }

      isFetched.current = true;
      setIsLoading(false);
    } catch (e) { 
      console.error("Fetch error:", e);
      // Don't stop loading if there's an error fetching main data 
      // to prevent overwriting with 0s
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    if (isLoading) return; // Block actions during loading

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
                
                // Use PATCH instead of PUT to only update specific fields
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

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  // Prevent UI interaction until balance is correctly loaded
  if (isLoading) {
    return (
      <div style={{...styles.main, display:'flex', justifyContent:'center', alignItems:'center'}}>
        <h2 style={{color:'#000'}}>SYNCING DATA...</h2>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      {/* REST OF YOUR UI COMPONENTS REMAIN THE SAME */}
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
          {/* ... tabs and lists ... */}
        </>
      )}
      
      {/* Include your other sections: withdraw, leaderboard, invite, profile exactly as they were */}

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
