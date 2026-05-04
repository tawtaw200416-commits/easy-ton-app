import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  // Using direct REST URL for better reliability without VPN/Proxy
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  VIP_PRICE: 1.0,
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

// PRIZE CALCULATION LOGIC
const getPrize = (index) => {
  const rank = index + 1;
  if (rank === 1) return "5.00";
  if (rank === 2) return "3.00";
  if (rank === 3) return "1.00";
  if (rank >= 4 && rank <= 5) return "0.9";
  if (rank >= 6 && rank <= 8) return "0.8";
  if (rank >= 9 && rank <= 12) return "0.7";
  if (rank >= 13 && rank <= 14) return "0.5";
  if (rank === 15) return "0.4";
  if (rank >= 16 && rank <= 19) return "0.3";
  if (rank >= 20 && rank <= 24) return "0.2";
  if (rank >= 25 && rank <= 30) return "0.1";
  return "0.0";
};

// PRESERVED TASKS
const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  { id: 'b3', name: "Workers On Ton", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
  { id: 'b4', name: "Easy Bonus Code", link: "https://t.me/easybonuscode_bot?start=1793453606" },
  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
];

const fixedSocialTasks = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
  { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
];

function App() {
  // CRITICAL: Initialize from LocalStorage to prevent Balance 0 during load
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastActionTime, setLastActionTime] = useState(0);
  const [showClaimId, setShowClaimId] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [lastSpinTime, setLastSpinTime] = useState(() => Number(localStorage.getItem(`last_spin_${APP_CONFIG.MY_UID}`)) || 0);
  const [dynamicAds, setDynamicAds] = useState({ advertica: APP_CONFIG.ADVERTICA_URL, adsterra: APP_CONFIG.ADSTERRA_URL });

  // Admin states
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [newVipStatus, setNewVipStatus] = useState(false);
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // VPN-Free Direct Fetcher
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null
      });
      return response.ok ? await response.json() : null;
    } catch (e) {
      console.error("Connection Error (VPN might be needed if your region blocks Firebase):", e);
      return null;
    }
  };

  const syncData = useCallback(async () => {
    const [userData, tasksData, promoData, usersData, adsData] = await Promise.all([
      apiCall(`/users/${APP_CONFIG.MY_UID}.json`),
      apiCall(`/global_tasks.json`),
      apiCall(`/promo_codes.json`),
      apiCall(`/users.json`),
      apiCall(`/adsterra_links.json`)
    ]);

    if (userData) {
      const dbBal = Number(userData.balance || 0);
      const dbComp = userData.completedTasks || [];
      const dbAds = userData.adsWatched || 0;

      setBalance(dbBal);
      setCompleted(dbComp);
      setAdsWatched(dbAds);
      setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
      setWithdrawHistory(userData.withdrawHistory || []);
      setReferrals(userData.referrals ? Object.values(userData.referrals) : []);

      // Update LocalStorage to keep data safe for next reload
      localStorage.setItem(`bal_${APP_CONFIG.MY_UID}`, dbBal);
      localStorage.setItem(`comp_${APP_CONFIG.MY_UID}`, JSON.stringify(dbComp));
      localStorage.setItem(`ads_${APP_CONFIG.MY_UID}`, dbAds);
    }
    
    if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
    if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    if (adsData) setDynamicAds(prev => ({ ...prev, ...adsData }));
    if (usersData) {
      setAllUsers(Object.keys(usersData).map(key => ({
        id: key, 
        balance: Number(usersData[key].balance || 0),
        isVip: usersData[key].isVip || false
      })));
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    syncData();
    const interval = setInterval(syncData, 15000); 
    return () => clearInterval(interval);
  }, [syncData]);

  const handleAction = (callback) => {
    if (APP_CONFIG.MY_UID === "1793453606") return callback();
    const elapsed = (Date.now() - lastActionTime) / 1000;
    if (lastActionTime === 0 || elapsed < 15) {
      alert("Security Check: Stay on ad for 15s to proceed.");
      window.open(Math.random() > 0.5 ? dynamicAds.advertica : dynamicAds.adsterra, '_blank');
      setLastActionTime(Date.now());
      return;
    }
    callback();
    setLastActionTime(0);
  };

  const processReward = async (id, amt) => {
    const reward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + reward).toFixed(5));
    const newAds = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    
    let newComp = [...completed];
    if (id !== 'watch_ad' && !id.startsWith('spin_') && !completed.includes(id)) {
        newComp.push(id);
    }

    // Update Local First (No Zero Balance)
    setBalance(newBal);
    setAdsWatched(newAds);
    setCompleted(newComp);
    setShowClaimId(null);
    localStorage.setItem(`bal_${APP_CONFIG.MY_UID}`, newBal);

    // Sync to Firebase
    await apiCall(`/users/${APP_CONFIG.MY_UID}.json`, 'PATCH', { 
        balance: newBal, 
        adsWatched: newAds, 
        completedTasks: newComp 
    });
    
    alert(`Success! +${reward} TON added.`);
    syncData();
  };

  const handleSpin = () => {
    const now = Date.now();
    if (now - lastSpinTime < 7200000) {
        const mins = Math.ceil((7200000 - (now - lastSpinTime)) / 60000);
        return alert(`Locked: Wait ${mins} mins.`);
    }
    handleAction(() => {
        setIsSpinning(true);
        const rotation = spinDeg + (1800 + Math.random() * 360);
        setSpinDeg(rotation);
        setTimeout(() => {
            setIsSpinning(false);
            setLastSpinTime(Date.now());
            localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, Date.now());
            processReward(`spin_${Date.now()}`, 0.0001);
        }, 4000);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  // Only show full loader if local balance is 0 and syncing
  if (isLoading && balance === 0) return <div style={{...styles.main, display:'flex', justifyContent:'center', alignItems:'center'}}><h2>CONNECTING...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>MY BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <div style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:'bold'}}>VIP MEMBER</div>}
        <button style={{...styles.btn, background: '#facc15', color: '#000', marginTop: 10}} onClick={() => processReward('watch_ad', 0)}>
          WATCH AD REWARD
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id || t.firebaseKey) ? 0.5 : 1}}>{t.name}</span>
                {completed.includes(t.id || t.firebaseKey) ? <b style={{color:'green', fontSize:12}}>COMPLETED</b> : 
                 (showClaimId === (t.id || t.firebaseKey) ? 
                 <button onClick={() => processReward(t.id || t.firebaseKey, 0.001)} style={{background:'green', color:'#fff', border:'none', borderRadius:5, padding:'5px 10px'}}>CLAIM</button> :
                 <button onClick={() => { window.open(t.link, '_blank'); setShowClaimId(t.id || t.firebaseKey); }} style={{background:'#000', color:'#fff', border:'none', borderRadius:5, padding:'5px 10px'}}>START</button>)}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                   const found = promoCodes.find(c => c.code === rewardCodeInput);
                   if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
                <h3 style={{marginTop:30}}>Lucky Spin</h3>
                <div style={{width:220, height:220, borderRadius:'50%', border:'6px solid #000', margin:'auto', transform:`rotate(${spinDeg}deg)`, transition:'transform 4s cubic-bezier(0.1, 0, 0.1, 1)', background:'repeating-conic-gradient(#facc15 0 60deg, #000 0 120deg)'}}></div>
                <button disabled={isSpinning} onClick={handleSpin} style={{...styles.btn, marginTop:20}}>{isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4>Admin Control</h4>
                <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="User UID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const data = await apiCall(`/users/${searchUserId}.json`);
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("Not found");
                }}>AUDIT USER</button>
                {searchedUser && (
                  <div style={{marginTop:15, padding:10, background:'#eee', borderRadius:10}}>
                    <input type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} style={{width:'100%', padding:10}} />
                    <button onClick={async () => {
                       await apiCall(`/users/${searchUserId}.json`, 'PATCH', { balance: Number(newBalanceInput) });
                       alert("Saved!"); syncData();
                    }} style={{...styles.btn, marginTop:5}}>UPDATE BALANCE</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <h3 style={{textAlign:'center'}}>🏆 Leaderboard</h3>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize: 12}}>
            <thead><tr style={{background:'#f0f0f0'}}><th>Rank</th><th>UID</th><th>Balance</th><th>Prize</th></tr></thead>
            <tbody>
              {allUsers.sort((a,b) => b.balance - a.balance).slice(0, 30).map((u, i) => (
                <tr key={i} style={{textAlign:'center', borderBottom:'1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff59d' : 'none'}}>
                  <td style={{padding:8}}>#{i+1}</td><td>{u.id}</td><td>{u.balance.toFixed(4)}</td><td style={{color:'green'}}>{getPrize(i)} TON</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Payouts</h3>
          <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="TON Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="TON Wallet Address" onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Check Balance (Min 0.1)");
              const newH = [{amount: amt, status: 'Pending', date: new Date().toLocaleString()}, ...withdrawHistory];
              await apiCall(`/users/${APP_CONFIG.MY_UID}.json`, 'PATCH', { balance: Number((balance - amt).toFixed(5)), withdrawHistory: newH });
              alert("Requested Successfully!"); syncData();
          }}>WITHDRAW TON</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
           <h3 style={{textAlign:'center'}}>Profile</h3>
           <div style={{background:'#f9f9f9', padding:10, borderRadius:10}}>
             <p>UID: <b>{APP_CONFIG.MY_UID}</b></p>
             <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
             <p>Account: <b>{isVip ? "VIP Member" : "Standard"}</b></p>
           </div>
           <button style={{...styles.btn, background:'red', marginTop:20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'rank', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize:11 }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
