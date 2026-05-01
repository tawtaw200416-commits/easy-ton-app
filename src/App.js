import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0007, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  // Using direct links for better compatibility
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // Safe Initialization
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [isVip, setIsVip] = useState(() => VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []; } catch { return []; }
  });
  const [usedCodes, setUsedCodes] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Admin States
  const [searchUid, setSearchUid] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalInput, setNewBalInput] = useState('');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // Update Database Helper
  const updateDB = async (uid, data) => {
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${uid}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Database connection failed. Please check your internet.");
    }
  };

  // Sync Data with Firebase
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await response.json();
      
      const taskRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
      const tasksData = await taskRes.json();

      if (userData) {
        setBalance(userData.balance ?? balance);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setAdsWatched(userData.adsWatched || 0);
        setUsedCodes(userData.usedCodes || []);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      }
    } catch (e) {
      console.warn("Offline mode: Using local data.");
    }
  }, [balance]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // UI Handlers
  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const triggerAds = () => {
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now());
    alert("Verification started! Please stay on the ad pages for 30 seconds.");
  };

  const handleWatchAds = () => {
    const timePassed = (Date.now() - lastAdClickTime) / 1000;
    if (lastAdClickTime === 0 || timePassed < 30) {
      triggerAds();
    } else {
      const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
      const newBal = Number((balance + reward).toFixed(5));
      const newCount = adsWatched + 1;
      setBalance(newBal);
      setAdsWatched(newCount);
      updateDB(APP_CONFIG.MY_UID, { balance: newBal, adsWatched: newCount });
      alert(`Success! +${reward} TON earned.`);
      setLastAdClickTime(0);
    }
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdrawal is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amt > balance) return alert("Insufficient balance.");
    if (!withdrawAddress) return alert("Please enter TON address.");

    const newBal = Number((balance - amt).toFixed(5));
    const newHist = [{ amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' }, ...withdrawHistory];
    setBalance(newBal);
    setWithdrawHistory(newHist);
    updateDB(APP_CONFIG.MY_UID, { balance: newBal, withdrawHistory: newHist });
    alert("Withdrawal request sent successfully!");
    setWithdrawAmount('');
  };

  // Admin Logic
  const searchUser = async () => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUid}.json`);
      const data = await res.json();
      if (data) setSearchedUser(data); else alert("User ID not found!");
    } catch { alert("Error searching user."); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'Arial, sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', border: '3px solid #fff', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', border: '2px solid #000', boxShadow: '4px 4px 0px #000', marginBottom: '10px' },
    btn: { width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer', marginBottom:'5px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #000', marginBottom: '10px', fontSize: '14px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 1000 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>{isVip ? "⭐ VIP ACCOUNT" : "STANDARD ACCOUNT"}</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
            <p>Reward: {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
            <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAds}>WATCH ADS TO EARN</button>
          </div>

          <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{flex:1, padding:'10px', borderRadius:'10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', fontSize:'11px', border:'1px solid #000'}}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...fixedBotTasks, ...fixedSocialTasks, ...customTasks].filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <span style={{fontSize:'14px', fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{background: completed.includes(t.id) ? '#ccc' : '#000', color:'#fff', padding:'6px 12px', borderRadius:'8px', border:'none', fontSize:'12px'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e=>setRewardCodeInput(e.target.value)} />
                <button style={styles.btn}>CLAIM REWARD</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <p style={{fontWeight:'bold'}}>Admin Dashboard</p>
                <input style={styles.input} placeholder="Search User UID" onChange={e=>setSearchUid(e.target.value)} />
                <button style={styles.btn} onClick={searchUser}>SEARCH</button>
                {searchedUser && (
                  <div style={{background:'#f0f0f0', padding:'10px', borderRadius:'10px', marginTop:'5px'}}>
                    <p>Current: {searchedUser.balance} TON</p>
                    <input style={styles.input} placeholder="New Balance" onChange={e=>setNewBalInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={()=>updateDB(searchUid, {balance: Number(newBalInput)})}>UPDATE</button>
                    <button style={{...styles.btn, background:'blue'}} onClick={()=>updateDB(searchUid, {isVip: true})}>GIVE VIP</button>
                  </div>
                )}
                <hr/>
                <input style={styles.input} placeholder="Promo Code Name" value={adminPromoCode} onChange={e=>setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={async()=>{
                  await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, {method:'PUT', body: JSON.stringify({active:true})});
                  alert("Code Created!");
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Get <b>{APP_CONFIG.REFER_REWARD} TON</b> for every friend you invite.</p>
          <div style={{background:'#f4f4f4', padding:'15px', borderRadius:'10px', wordBreak:'break-all', border:'1px dashed #000', marginBottom:'10px'}}>
            https://t.me/EasyTonFreeBot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={styles.btn} onClick={() => copyToClipboard(`https://t.me/EasyTonFreeBot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color:'#0ea5e9'}}>💎 UPGRADE TO VIP</h3>
            <p style={{fontSize:'13px'}}>Pay 1 TON to enable instant withdrawal and double earnings.</p>
            <div style={{fontSize:'11px', background:'#f8f8f8', padding:'10px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'10px'}}>
              <b>Wallet:</b> {APP_CONFIG.ADMIN_WALLET} <button onClick={()=>copyToClipboard(APP_CONFIG.ADMIN_WALLET)} style={{fontSize:'9px'}}>Copy</button><br/>
              <b>Memo (Required):</b> {APP_CONFIG.MY_UID} <button onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)} style={{fontSize:'9px'}}>Copy</button>
            </div>
            <button style={{...styles.btn, background:'#0ea5e9'}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>VERIFY PAYMENT</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <p style={{fontSize:'12px', color:'red'}}>Min Withdrawal: 0.1 TON</p>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Address" value={withdrawAddress} onChange={e=>setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p><b>ID:</b> {APP_CONFIG.MY_UID}</p>
          <p><b>Balance:</b> {balance.toFixed(5)} TON</p>
          <p><b>Status:</b> {isVip ? "VIP Member ⭐" : "Standard Member"}</p>
          <p><b>Ads Watched:</b> {adsWatched}</p>
          <button style={{...styles.btn, background:'#22c55e', marginTop:'15px'}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT CENTER</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px', textTransform:'uppercase' }}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606", type: 'bot' },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD", type: 'bot' },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606", type: 'bot' },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606", type: 'bot' },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606", type: 'bot' }
];

const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews", type: 'social' },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree", type: 'social' }
];

export default App;
