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
const STORAGE_KEY = `easyton_data_${APP_CONFIG.MY_UID}`;

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
  const loadSavedData = (key, fallback) => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  };

  const [balance, setBalance] = useState(() => Number(loadSavedData('balance', 0)));
  const [completed, setCompleted] = useState(() => loadSavedData('completed', []));
  const [adsWatched, setAdsWatched] = useState(() => Number(loadSavedData('adsWatched', 0)));
  const [withdrawHistory, setWithdrawHistory] = useState(() => loadSavedData('history', []));
  const [isVip, setIsVip] = useState(() => loadSavedData('isVip', VIP_IDS.includes(APP_CONFIG.MY_UID)));
  
  const [isLoading, setIsLoading] = useState(true);
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

  // Form states
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
      const [u, t, p, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();
      const allData = await all.json();

      if (userData) {
        const b = Number(userData.balance || 0);
        const vip = userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID);
        const ads = userData.adsWatched || 0;
        const hist = userData.withdrawHistory || [];
        const comp = userData.completedTasks || [];

        setBalance(b);
        setIsVip(vip);
        setAdsWatched(ads);
        setWithdrawHistory(hist);
        setCompleted(comp);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);

        localStorage.setItem(`${STORAGE_KEY}_balance`, JSON.stringify(b));
        localStorage.setItem(`${STORAGE_KEY}_isVip`, JSON.stringify(vip));
        localStorage.setItem(`${STORAGE_KEY}_adsWatched`, JSON.stringify(ads));
        localStorage.setItem(`${STORAGE_KEY}_history`, JSON.stringify(hist));
        localStorage.setItem(`${STORAGE_KEY}_completed`, JSON.stringify(comp));
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      if (allData) setAllUsers(Object.keys(allData).map(key => ({ id: key, ...allData[key] })));
      
      setIsLoading(false);
    } catch (e) { setIsLoading(false); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(() => fetchData(true), 3000);
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
    if (APP_CONFIG.MY_UID === "1793453606") {
      callback();
      return;
    }
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
    const newComp = [...completed, id];

    setBalance(newBal);
    localStorage.setItem(`${STORAGE_KEY}_balance`, JSON.stringify(newBal));

    if (id === 'watch_ad') {
      setAdsWatched(newAdsWatched);
      localStorage.setItem(`${STORAGE_KEY}_adsWatched`, JSON.stringify(newAdsWatched));
    }

    if (id !== 'watch_ad' && !id.startsWith('spin_')) {
        setCompleted(newComp);
        localStorage.setItem(`${STORAGE_KEY}_completed`, JSON.stringify(newComp));
        setShowClaimId(null);
    }

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', 
      body: JSON.stringify({ 
        balance: newBal, 
        adsWatched: newAdsWatched,
        completedTasks: (id !== 'watch_ad' && !id.startsWith('spin_')) ? newComp : completed 
      })
    });
    
    alert(`Success! +${rewardAmt} TON.`);
    setLastActionTime(0);
    fetchData(true);
  };

  const handleSpin = () => {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    if (now - lastSpinTime < twoHours) {
        const remaining = Math.ceil((twoHours - (now - lastSpinTime)) / 60000);
        return alert(`Wait ${remaining} mins for next spin!`);
    }
    handleAction(() => {
        setIsSpinning(true);
        const extraSpin = 180 + (360 * 5); 
        const newDeg = spinDeg + extraSpin;
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
        setTimeout(() => setShowClaimId(id), 1500);
    });
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert("Copied: " + text));
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Copied: " + text);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: (bg) => ({ padding: '8px 12px', background: bg || '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', background: '#fff' },
    wheelContainer: { position: 'relative', width: '260px', height: '260px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff' },
    wheelPointer: { position: 'absolute', top: '-15px', zIndex: 10, width: '30px', height: '40px', background: 'red', clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }
  };

  if (isLoading && balance === 0) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#000'}}>Syncing Profile...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>AVAILABLE BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <div style={{background:'#facc15', color:'#000', padding:'2px 10px', borderRadius:20, display:'inline-block', fontSize:12, fontWeight:'bold', marginBottom: 10}}>VIP ⭐</div>}
        <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAds(); setTimeout(() => processReward('watch_ad', 0), 1000); }}>
          WATCH ADS (30s)
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize: '11px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id || t.firebaseKey) ? 0.5 : 1, fontSize: '13px'}}>{t.name}</span>
                {completed.includes(t.id || t.firebaseKey) ? (
                    <span style={{color:'green', fontWeight:'bold', fontSize:12}}>DONE ✅</span>
                ) : (
                    <div style={{display:'flex', gap:5}}>
                        {showClaimId === (t.id || t.firebaseKey) ? (
                            <button onClick={() => processReward(t.id || t.firebaseKey, 0.001)} style={styles.smBtn('#22c55e')}>CLAIM</button>
                        ) : (
                            <button onClick={() => startTask(t.id || t.firebaseKey, t.link)} style={styles.smBtn()}>START</button>
                        )}
                    </div>
                )}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={{...styles.btn, marginBottom: '20px'}} onClick={() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
                <div style={{borderTop: '2px solid #eee', paddingTop: '20px'}}>
                    <h3>Lucky Spin</h3>
                    <p style={{fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '15px'}}>Try your luck for 2 hours💎</p>
                    <div style={styles.wheelContainer}>
                        <div style={styles.wheelPointer}></div>
                        <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                            {[
                                { t: '0.1 TON', c: '#facc15' }, { t: '0.2 TON', c: '#000' }, { t: '0.3 TON', c: '#facc15' }, { t: '0.0001 TON', c: '#000' }, { t: '0.001 TON', c: '#facc15' }, { t: '0.01 TON', c: '#000' }
                            ].map((s, i) => (
                                <div key={i} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${i * 60}deg)`, clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)', background: s.c, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                                    <span style={{ color: s.c === '#000' ? '#fff' : '#000', fontSize: '9px', fontWeight: 'bold', marginTop: '40px', transform: 'rotate(30deg)', width: '80px', textAlign: 'center' }}>{s.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button disabled={isSpinning} style={{...styles.btn, background: isSpinning ? '#666' : '#000'}} onClick={handleSpin}>{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{margin:'0 0 10px 0', borderBottom: '2px solid #000', paddingBottom: 5}}>ADMIN DASHBOARD</h4>
                
                <h5 style={{marginTop: 15, marginBottom: 5}}>Global Task Management</h5>
                <div style={{maxHeight: '120px', overflowY: 'auto', marginBottom: 15, padding: 5, background: '#f0f0f0', borderRadius: 8, border: '1px solid #ccc'}}>
                    {customTasks.length > 0 ? customTasks.map((ct, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px', borderBottom: '1px solid #ddd', fontSize: 11}}>
                            <span style={{maxWidth: '80%'}}><b>[{ct.type.toUpperCase()}]</b> {ct.name}</span>
                            <button onClick={async () => { if(window.confirm(`Delete ${ct.name}?`)) { await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${ct.firebaseKey}.json`, { method: 'DELETE' }); fetchData(true); } }} style={{color: 'red', border: '1px solid red', background: '#fff', borderRadius: 4, padding: '2px 5px', fontSize: 10, cursor: 'pointer'}}>Delete</button>
                        </div>
                    )) : <p style={{fontSize: 10, textAlign: 'center', opacity: 0.6}}>No custom tasks</p>}
                </div>

                <div style={{background: '#fff9e6', padding: '10px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eab308'}}>
                  <h6 style={{margin: '0 0 10px 0'}}>Add New Task</h6>
                  <input style={styles.input} placeholder="Task Name (e.g. Join Channel)" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                  <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                  <select style={styles.select} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}><option value="bot">Telegram Bot</option><option value="social">Social Media</option></select>
                  <button style={{...styles.btn, background: '#22c55e'}} onClick={async () => {
                      if(!adminTaskName || !adminTaskLink) return alert("Please fill all fields!");
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method:'POST', body: JSON.stringify({name: adminTaskName, link: adminTaskLink, type: adminTaskType}) });
                      alert("Task Published!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData(true);
                  }}>PUBLISH TASK</button>
                </div>

                <h5>Promo Codes</h5>
                <div style={{maxHeight: '100px', overflowY: 'auto', marginBottom: 10, padding: 5, background: '#f0f0f0', borderRadius: 8, border: '1px solid #ccc'}}>
                    {promoCodes.length > 0 ? promoCodes.map((pc, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px', borderBottom: '1px solid #ddd', fontSize: 10}}>
                            <span><b>{pc.code}</b> ({pc.reward} TON)</span>
                            <button onClick={async () => { if(window.confirm(`Delete code ${pc.code}?`)) { await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${pc.code}.json`, { method: 'DELETE' }); fetchData(true); } }} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}>Del</button>
                        </div>
                    )) : <p style={{fontSize: 10, textAlign: 'center', opacity: 0.6}}>No promo codes</p>}
                </div>
                <input style={styles.input} placeholder="New Promo Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} placeholder="Reward Amount" type="number" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background: '#8b5cf6', marginBottom: 20}} onClick={async () => {
                    if(!adminPromoCode || !adminPromoReward) return alert("Fill all!");
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method:'PUT', body: JSON.stringify(Number(adminPromoReward)) });
                    alert("Promo Created!"); setAdminPromoCode(''); setAdminPromoReward(''); fetchData(true);
                }}>CREATE CODE</button>

                <h5>Manage Users</h5>
                <input style={styles.input} placeholder="Search by Telegram UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  if(!searchUserId) return;
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); setNewVipStatus(data.isVip || false); } else alert("User not found!");
                }}>SEARCH USER</button>
                {searchedUser && (
                  <div style={{marginTop:10, padding:12, background:'#fff', borderRadius:10, border:'2px solid #000'}}>
                    <p style={{fontSize:11, marginBottom: 10}}>Editing UID: <b>{searchUserId}</b></p>
                    <label style={{fontSize: 10}}>Edit Balance:</label>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <label style={{fontSize: 10}}>VIP Status:</label>
                    <select style={styles.select} value={newVipStatus.toString()} onChange={e => setNewVipStatus(e.target.value === 'true')}><option value="false">Standard User</option><option value="true">VIP Member ⭐</option></select>
                    <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => { 
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput), isVip: newVipStatus}) }); 
                        alert("User Data Saved!"); fetchData(true); 
                    }}>UPDATE USER</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', background: '#000', color: '#facc15', padding: '15px', borderRadius: '15px', marginBottom: '15px'}}>
              <h2 style={{margin: 0}}>🏆 TOP 30 RANKING</h2>
              <p style={{fontSize: '11px', margin: '5px 0', opacity: 0.8}}>Prize Pool: <b>10 TON</b> distributed among winners!</p>
          </div>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead style={{background: '#f3f4f6', fontSize: '11px'}}>
                      <tr>
                          <th style={{padding: '12px 10px', textAlign: 'left'}}>RANK</th>
                          <th style={{padding: '12px 10px', textAlign: 'left'}}>UID</th>
                          <th style={{padding: '12px 10px', textAlign: 'right'}}>BAL</th>
                          <th style={{padding: '12px 10px', textAlign: 'right'}}>PRIZE</th>
                      </tr>
                  </thead>
                  <tbody>
                      {allUsers.sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 30).map((user, index) => {
                          let prize = 0;
                          if (index === 0) prize = 5.0;
                          else if (index === 1) prize = 3.0;
                          else if (index === 2) prize = 1.0;
                          else prize = (1/27); // Distributed 1 TON to the rest 27 users

                          return (
                          <tr key={index} style={{borderBottom: '1px solid #eee', fontSize: '11px', background: user.id === APP_CONFIG.MY_UID ? '#fff9e6' : 'transparent'}}>
                              <td style={{padding: '12px 10px', fontWeight: 'bold'}}>#{index + 1}</td>
                              <td style={{padding: '12px 10px'}}>{user.id} {user.isVip && '⭐'}</td>
                              <td style={{padding: '12px 10px', textAlign: 'right'}}>{(user.balance || 0).toFixed(3)}</td>
                              <td style={{padding: '12px 10px', textAlign: 'right', color: 'green', fontWeight: 'bold'}}>{prize.toFixed(2)} TON</td>
                          </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{marginTop: 0}}>Invite Friends</h3>
          <p style={{fontSize: 14}}>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> for every friend you invite!</p>
          <div style={{background: '#f3f4f6', padding: 10, borderRadius: 10, border: '1px solid #ccc', marginBottom: 15}}>
            <small style={{fontSize: 9, display: 'block', marginBottom: 5}}>YOUR REFERRAL LINK:</small>
            <code style={{fontSize: 11, wordBreak: 'break-all'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</code>
          </div>
          <button style={styles.btn} onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          
          <div style={{marginTop: 25}}>
              <h4>Referral List ({referrals.length})</h4>
              <div style={{maxHeight: 150, overflowY: 'auto', background: '#fafafa', borderRadius: 10, border: '1px solid #eee', padding: 10}}>
                  {referrals.length > 0 ? referrals.map((r, i) => (
                      <div key={i} style={{fontSize: 11, padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                        <span>UID: {r.id || "User"}</span>
                        <span style={{color: 'green'}}>Active</span>
                      </div>
                  )) : <p style={{fontSize: 12, opacity: 0.6, textAlign: 'center'}}>No one invited yet. Start sharing!</p>}
              </div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{marginTop: 0}}>VIP Membership ⭐</h3>
            <p style={{fontSize:12, marginBottom: 15}}>Get double rewards for ads and exclusive perks for <b>1.0 TON</b>.</p>
            
            <div style={{background: '#f9fafb', padding: 12, borderRadius: 10, border: '1px dashed #000'}}>
                <p style={{fontSize:10, margin: '0 0 5px 0', fontWeight: 'bold'}}>DEPOSIT ADDRESS (TON):</p>
                <div style={{display:'flex', gap: 5, marginBottom: 12}}>
                    <input style={{...styles.input, marginBottom: 0, flex: 1, fontSize: 10, padding: 8}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                    <button style={{...styles.smBtn(), whiteSpace: 'nowrap'}} onClick={()=> copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>Copy Address</button>
                </div>
                
                <p style={{fontSize:10, margin: '0 0 5px 0', fontWeight: 'bold'}}>REQUIRED MEMO (YOUR UID):</p>
                <div style={{display:'flex', gap: 5}}>
                    <input style={{...styles.input, marginBottom: 0, flex: 1, padding: 8}} readOnly value={APP_CONFIG.MY_UID} />
                    <button style={{...styles.smBtn(), whiteSpace: 'nowrap'}} onClick={()=> copyToClipboard(APP_CONFIG.MY_UID)}>Copy Memo</button>
                </div>
                <small style={{fontSize: 9, color: 'red', marginTop: 10, display: 'block'}}>* Important: You must include the Memo during transfer!</small>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{marginTop: 0}}>Withdraw TON</h3>
            <div style={{background: '#eef2ff', padding: 10, borderRadius: 8, marginBottom: 15, fontSize: 11}}>
                Min: 0.1 TON | Fee: 0%
            </div>
            <input style={styles.input} placeholder="Withdraw Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => handleAction(async () => {
                const amt = Number(withdrawAmount);
                if(amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum withdrawal is ${APP_CONFIG.MIN_WITHDRAW} TON`);
                if(amt > balance) return alert("Insufficient balance!");
                if(!withdrawAddress || withdrawAddress.length < 10) return alert("Enter valid TON address!");

                const newH = [{ amount: amt, status: 'Pending', date: new Date().toLocaleString(), address: withdrawAddress }, ...withdrawHistory];
                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                  method:'PATCH', body: JSON.stringify({ balance: Number((balance - amt).toFixed(5)), withdrawHistory: newH })
                });
                alert("Withdrawal request sent for review!"); 
                fetchData(true); setWithdrawAmount(''); setWithdrawAddress('');
            })}>SUBMIT WITHDRAWAL</button>

            <div style={{marginTop: 20}}>
                <small style={{fontWeight: 'bold'}}>Recent History:</small>
                <div style={{maxHeight: 100, overflowY: 'auto', marginTop: 5}}>
                    {withdrawHistory.length > 0 ? withdrawHistory.map((h, i) => (
                        <div key={i} style={{fontSize: 10, padding: '5px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                            <span>{h.amount} TON ({h.date.split(',')[0]})</span>
                            <span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status}</span>
                        </div>
                    )) : <p style={{fontSize: 10, opacity: 0.5}}>No transactions yet.</p>}
                </div>
            </div>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center', marginBottom: 20}}>My Profile</h2>
          <div style={{padding: '15px', background: '#f3f4f6', borderRadius: '15px', marginBottom: '20px', border: '1px solid #ddd'}}>
              <p style={{margin: '5px 0', fontSize: 13}}>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
              <p style={{margin: '5px 0', fontSize: 13}}>Status: <b>{isVip ? <span style={{color: '#eab308'}}>VIP Member ⭐</span> : "Standard User"}</b></p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
              <div style={{flex: 1, background: '#000', color: '#fff', padding: '15px', borderRadius: '15px', textAlign: 'center'}}>
                  <small style={{display: 'block', opacity: 0.7, fontSize: 10}}>Main Balance</small>
                  <span style={{fontSize: '20px', fontWeight: 'bold'}}>{balance.toFixed(4)}</span>
                  <small style={{display: 'block', fontSize: 9}}>TON</small>
              </div>
              <div style={{flex: 1, background: '#facc15', color: '#000', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '2px solid #000'}}>
                  <small style={{display: 'block', opacity: 0.7, fontSize: 10}}>Ads Viewed</small>
                  <span style={{fontSize: '20px', fontWeight: 'bold'}}>{adsWatched}</span>
                  <small style={{display: 'block', fontSize: 9}}>Times</small>
              </div>
          </div>
          
          <div style={{marginTop: 20, textAlign: 'center'}}>
              <p style={{fontSize: 11, opacity: 0.6, marginBottom: 15}}>If you have any issues with payments or tasks, please contact our official support bot.</p>
              <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>OPEN SUPPORT BOT</button>
          </div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'rank', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{fontSize: 14}}>{n === 'earn' ? '💰' : n === 'rank' ? '🏆' : n === 'invite' ? '👥' : n === 'withdraw' ? '💳' : '👤'}</span>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
