import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
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
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
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

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      const cacheBuster = `?t=${Date.now()}`;
      const [u, t, p, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json${cacheBuster}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json${cacheBuster}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json${cacheBuster}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json${cacheBuster}`)
      ]);
      
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();
      const allData = await all.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setAdsWatched(userData.adsWatched || 0);
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      if (allData) setAllUsers(Object.keys(allData).map(key => ({ id: key, ...allData[key] })));
      
      setIsLoading(false);
    } catch (e) { 
      console.error("Connection Error", e);
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerAds = useCallback(() => {
    if (APP_CONFIG.MY_UID === "1793453606") {
      setLastActionTime(Date.now()); 
      return;
    }
    const adToOpen = Math.random() < 0.5 ? APP_CONFIG.ADVERTICA_URL : APP_CONFIG.ADSTERRA_URL;
    window.open(adToOpen, '_blank');
    setLastActionTime(Date.now()); 
  }, []);

  const handleAction = (callback) => {
    if (APP_CONFIG.MY_UID === "1793453606") { callback(); return; }
    const elapsed = (Date.now() - lastActionTime) / 1000;
    if (lastActionTime === 0 || elapsed < 15) {
      alert(`Please stay on the ad for 15s to continue!`);
      triggerAds();
      return;
    }
    callback();
    setLastActionTime(0);
  };

  const processReward = async (id, amt) => {
    const elapsed = (Date.now() - lastActionTime) / 1000;
    const timeLimit = id === 'watch_ad' ? 30 : 15;

    if (APP_CONFIG.MY_UID !== "1793453606" && (lastActionTime === 0 || elapsed < timeLimit)) {
      alert(`Stay on the ad for ${timeLimit}s to claim reward!`);
      triggerAds();
      return;
    }

    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    const newAdsWatched = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    
    setBalance(newBal);
    if (id === 'watch_ad') setAdsWatched(newAdsWatched);

    const updateData = { balance: newBal, adsWatched: newAdsWatched };

    if (id !== 'watch_ad' && !id.startsWith('spin_')) {
        const newComp = [...completed, id];
        setCompleted(newComp);
        updateData.completedTasks = newComp;
        setShowClaimId(null);
    }

    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH', 
        body: JSON.stringify(updateData)
      });
      alert(`Success! +${rewardAmt} TON.`);
    } catch (err) { alert("Network Error. UI Updated!"); }
    
    setLastActionTime(0);
    fetchData(true);
  };

  const handleSpin = () => {
    const now = Date.now();
    if (now - lastSpinTime < 7200000) {
        const remaining = Math.ceil((7200000 - (now - lastSpinTime)) / 60000);
        return alert(`Wait ${remaining} mins!`);
    }
    handleAction(() => {
        setIsSpinning(true);
        const newDeg = spinDeg + 1800 + Math.random() * 360;
        setSpinDeg(newDeg);
        setTimeout(() => {
            setIsSpinning(false);
            const spinTime = Date.now();
            setLastSpinTime(spinTime);
            localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, spinTime); 
            processReward('spin_' + spinTime, 0.0001);
        }, 4000);
    });
  };

  const startTask = (id, link) => {
    handleAction(() => {
        window.open(link, '_blank');
        setTimeout(() => setShowClaimId(id), 2000);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: (bg) => ({ padding: '8px 12px', background: bg || '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }),
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    wheelContainer: { position: 'relative', width: '240px', height: '240px', margin: '20px auto' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff' }
  };

  if (isLoading) return <div style={styles.main}><h2>Connecting to Server...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>AVAILABLE BALANCE</small>
        <h1 style={{fontSize: '32px'}}>{balance.toFixed(5)} TON</h1>
        <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAds(); setTimeout(() => processReward('watch_ad', 0), 1000); }}>
          WATCH ADS
        </button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        {['EARN', 'RANK', 'INVITE', 'WITHDRAW', 'PROFILE'].map(n => (
          <button key={n} onClick={() => handleAction(() => setActiveNav(n.toLowerCase()))} style={{ flex: 1, padding: '10px', background: activeNav === n.toLowerCase() ? '#000' : '#fff', color: activeNav === n.toLowerCase() ? '#fff' : '#000', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{n}</button>
        ))}
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <div style={{display:'flex', gap:5, marginBottom:15}}>
            {['BOT', 'SOCIAL', 'SPIN', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
               <button key={t} onClick={()=>setActiveTab(t.toLowerCase())} style={{flex:1, padding:8, background:activeTab===t.toLowerCase()?'#000':'#eee', color:activeTab===t.toLowerCase()?'#fff':'#000', borderRadius:5, fontSize:12}}>{t}</button>
            ))}
          </div>

          {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
              <span>{t.name}</span>
              {completed.includes(t.id || t.firebaseKey) ? <b style={{color:'green'}}>DONE ✅</b> : 
                (showClaimId === (t.id || t.firebaseKey) ? 
                <button onClick={() => processReward(t.id || t.firebaseKey, 0.001)} style={styles.smBtn('#22c55e')}>CLAIM</button> :
                <button onClick={() => startTask(t.id || t.firebaseKey, t.link)} style={styles.smBtn()}>START</button>)
              }
            </div>
          ))}

          {activeTab === 'spin' && (
            <div style={{textAlign:'center'}}>
                <div style={styles.wheelContainer}>
                   <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                      {[...Array(6)].map((_, i) => <div key={i} style={{position:'absolute', width:'100%', height:'100%', transform:`rotate(${i*60}deg)`, background: i%2?'#000':'#facc15', clipPath:'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)'}}></div>)}
                   </div>
                </div>
                <button disabled={isSpinning} style={styles.btn} onClick={handleSpin}>{isSpinning ? "SPINNING..." : "SPIN NOW"}</button>
            </div>
          )}

          {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
            <div style={{marginTop: 10}}>
              <h4>Admin Management</h4>
              <input style={styles.input} placeholder="Search User UID" value={searchUserId} onChange={e=>setSearchUserId(e.target.value)} />
              <button style={styles.btn} onClick={async()=>{
                const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                const data = await res.json();
                if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); setNewVipStatus(data.isVip); } else alert("User not found");
              }}>SEARCH USER</button>
              
              {searchedUser && (
                <div style={{marginTop: 15, padding: 10, background: '#f0f0f0', borderRadius: 10, border: '1px solid #000'}}>
                  <p>Current Balance: {searchedUser.balance}</p>
                  <input style={styles.input} type="number" value={newBalanceInput} onChange={e=>setNewBalanceInput(e.target.value)} />
                  <label><input type="checkbox" checked={newVipStatus} onChange={e=>setNewVipStatus(e.target.checked)} /> Set VIP</label>
                  <button style={{...styles.btn, marginTop: 10, background: '#22c55e'}} onClick={async()=>{
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, {
                      method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput), isVip: newVipStatus })
                    });
                    alert("Updated!"); fetchData(true);
                  }}>SAVE CHANGES</button>
                </div>
              )}
              <hr />
              <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e=>setAdminTaskName(e.target.value)} />
              <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e=>setAdminTaskLink(e.target.value)} />
              <select style={styles.input} value={adminTaskType} onChange={e=>setAdminTaskType(e.target.value)}>
                <option value="bot">Bot Task</option>
                <option value="social">Social Task</option>
              </select>
              <button style={{...styles.btn, background: '#3b82f6'}} onClick={async()=>{
                if(!adminTaskName || !adminTaskLink) return alert("Fill all!");
                await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, {
                  method: 'POST', body: JSON.stringify({ name: adminTaskName, link: adminTaskLink, type: adminTaskType })
                });
                alert("Task Added!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData(true);
              }}>ADD GLOBAL TASK</button>
            </div>
          )}
        </div>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <h3>Leaderboard</h3>
          {allUsers.sort((a,b) => b.balance - a.balance).slice(0, 10).map((u, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
              <span>{i+1}. {u.id.substring(0,6)}...</span>
              <b>{Number(u.balance).toFixed(5)} TON</b>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Get <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={()=>{
             navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
             alert("Referral Link Copied!");
          }}>COPY MY LINK</button>
          <div style={{marginTop: 15}}>
             <small>Your Referrals: {referrals.length}</small>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw History</h3>
          <div style={{maxHeight: 120, overflowY: 'auto', marginBottom: 10}}>
            {withdrawHistory.length > 0 ? withdrawHistory.map((h, i) => (
              <div key={i} style={{fontSize: 11, borderBottom: '1px solid #eee', padding: 5, display: 'flex', justifyContent: 'space-between'}}>
                <span>{h.amount} TON</span><span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status}</span>
              </div>
            )) : <p style={{fontSize: 11, textAlign: 'center'}}>No history yet.</p>}
          </div>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e=>setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
             const amt = Number(withdrawAmount);
             if(amt < 0.1 || amt > balance) return alert("Invalid amount!");
             if(!withdrawAddress) return alert("Enter address!");
             const newH = [{amount: amt, status: 'Pending', date: new Date().toLocaleString()}, ...withdrawHistory];
             await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
               method: 'PATCH', body: JSON.stringify({ balance: (balance - amt).toFixed(5), withdrawHistory: newH })
             });
             alert("Withdrawal Requested!"); fetchData(true); setWithdrawAmount(''); setWithdrawAddress('');
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Ads Watched: <b>{adsWatched}</b></p>
          <p>VIP Status: <b>{isVip ? "Active ⭐" : "Standard"}</b></p>
          <button style={{...styles.btn, background: '#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'rank', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
