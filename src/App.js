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
  // Ads links
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

  const fetchData = useCallback(async () => {
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
      console.error("Data Fetch Error:", e);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(() => fetchData(), 5000);
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
    if (id === 'watch_ad') setAdsWatched(newAdsWatched);

    const updateData = { 
        balance: newBal, 
        adsWatched: newAdsWatched 
    };

    if (id !== 'watch_ad' && !id.toString().startsWith('spin_')) {
        setCompleted(newComp);
        updateData.completedTasks = newComp;
        setShowClaimId(null);
    }

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', 
      body: JSON.stringify(updateData)
    });
    
    alert(`Success! +${rewardAmt} TON.`);
    setLastActionTime(0);
    fetchData();
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
    select: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', background: '#fff' },
    wheelContainer: { position: 'relative', width: '260px', height: '260px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff' },
    wheelPointer: { position: 'absolute', top: '-15px', zIndex: 10, width: '30px', height: '40px', background: 'red', clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }
  };

  if (isLoading) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#000'}}>Syncing Profile...</h2></div>;

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
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id || t.firebaseKey) ? 0.5 : 1}}>{t.name}</span>
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
                <button style={{...styles.btn, marginBottom: '20px'}} onClick={() => handleAction(() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                })}>CLAIM CODE</button>
                <div style={{borderTop: '2px solid #eee', paddingTop: '20px'}}>
                    <h3>Lucky Spin</h3>
                    <p style={{fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '15px'}}>Try your luck every 2 hours💎</p>
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

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4 style={{margin:'0 0 10px 0', borderBottom: '2px solid #000'}}>Admin Control Panel</h4>
                <h5>Search User UID</h5>
                <input style={styles.input} placeholder="User UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); setNewVipStatus(data.isVip || false); } else alert("User not found!");
                }}>SEARCH</button>

                {searchedUser && (
                  <div style={{marginTop:15, padding:10, background:'#e5e7eb', borderRadius:10, border:'2px solid #000'}}>
                    <p style={{fontSize:11}}>Editing UID: {searchUserId}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <select style={styles.select} value={newVipStatus.toString()} onChange={e => setNewVipStatus(e.target.value === 'true')}>
                        <option value="false">Standard</option>
                        <option value="true">VIP ⭐</option>
                    </select>
                    <button style={styles.btn} onClick={async () => { 
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput), isVip: newVipStatus}) }); 
                        alert("User Updated!"); fetchData(); 
                    }}>UPDATE USER</button>
                  </div>
                )}

                <h5 style={{marginTop: 20}}>Add Global Task</h5>
                <input style={styles.input} placeholder="Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.select} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">Bot</option>
                    <option value="social">Social</option>
                </select>
                <button style={{...styles.btn, background:'#22c55e'}} onClick={async () => {
                    if(!adminTaskName || !adminTaskLink) return alert("Fill all!");
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method:'POST', body: JSON.stringify({name: adminTaskName, link: adminTaskLink, type: adminTaskType}) });
                    alert("Task Added!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData();
                }}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', background: '#000', color: '#facc15', padding: '10px', borderRadius: '10px', marginBottom: '15px'}}>
              <h2 style={{margin: 0}}>🏆 TOP 30 RANKING</h2>
              <p style={{fontSize: '12px', margin: '5px 0'}}>Season 1 - Active Leaderboard</p>
          </div>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead style={{background: '#f3f4f6', fontSize: '12px'}}>
                      <tr>
                          <th style={{padding: '10px', textAlign: 'left'}}>RANK</th>
                          <th style={{padding: '10px', textAlign: 'left'}}>USER ID</th>
                          <th style={{padding: '10px', textAlign: 'right'}}>BALANCE</th>
                      </tr>
                  </thead>
                  <tbody>
                      {allUsers.sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 30).map((user, index) => (
                          <tr key={index} style={{borderBottom: '1px solid #eee', fontSize: '11px', background: user.id === APP_CONFIG.MY_UID ? '#fef08a' : 'transparent'}}>
                              <td style={{padding: '10px', fontWeight: 'bold'}}>#{index + 1}</td>
                              <td style={{padding: '10px'}}>{user.id} {user.isVip && '⭐'}</td>
                              <td style={{padding: '10px', textAlign: 'right'}}>{(user.balance || 0).toFixed(4)} TON</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per verified referral!</p>
          <div style={{background: '#f0f0f0', padding: 10, borderRadius: 10, marginBottom: 15}}>
              <small>Your Invitation Link:</small>
              <p style={{fontSize: 10, wordBreak: 'break-all', fontWeight: 'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
          </div>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          
          <h4 style={{marginTop: 20}}>Referral History ({referrals.length})</h4>
          <div style={{maxHeight: 150, overflowY: 'auto'}}>
            {referrals.length === 0 ? <p style={{fontSize: 12, opacity: 0.5}}>No referrals yet.</p> : referrals.map((r, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:12}}>
                    <span>User: {r.id || "Verified User"}</span><span style={{color:'green'}}>+0.01 TON ✅</span>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <p style={{fontSize: 12, color: '#666'}}>Minimum Withdrawal: 0.1 TON</p>
          <input style={styles.input} placeholder="Amount (e.g. 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => handleAction(async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Insufficient balance or invalid amount!");
              if(!withdrawAddress) return alert("Please enter wallet address!");
              
              const newHistory = [{ amount: amt, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((balance - amt).toFixed(5)), withdrawHistory: newHistory })
              });
              alert("Withdrawal request sent!"); fetchData(); setWithdrawAmount(''); setWithdrawAddress('');
          })}>WITHDRAW NOW</button>

          <h4 style={{marginTop: 25}}>Withdrawal History</h4>
          <div style={{maxHeight: 150, overflowY: 'auto'}}>
            {withdrawHistory.length === 0 ? <p style={{fontSize: 12, opacity: 0.5}}>No history available.</p> : withdrawHistory.map((h, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee', fontSize:11}}>
                    <span><b>{h.amount} TON</b></span>
                    <span style={{color: h.status === 'Success' ? 'green' : 'orange', fontWeight: 'bold'}}>{h.status}</span>
                    <span style={{opacity:0.5}}>{h.date.split(',')[0]}</span>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center', marginBottom: 20}}>Profile</h2>
          <div style={{padding: '12px', background: '#f3f4f6', borderRadius: '10px', marginBottom: '15px', border: '1px solid #ddd'}}>
              <p style={{margin: '5px 0'}}>User UID: <b>{APP_CONFIG.MY_UID}</b></p>
              <p style={{margin: '5px 0'}}>Account: <b>{isVip ? "VIP Member ⭐" : "Standard"}</b></p>
          </div>
          
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
              <div style={{flex: 1, background: '#000', color: '#fff', padding: '15px', borderRadius: '15px', textAlign: 'center'}}>
                  <small style={{display: 'block', opacity: 0.7}}>Balance</small>
                  <span style={{fontSize: '18px', fontWeight: 'bold'}}>{balance.toFixed(5)} TON</span>
              </div>
              <div style={{flex: 1, background: '#facc15', color: '#000', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '2px solid #000'}}>
                  <small style={{display: 'block', opacity: 0.7}}>Ads Watched</small>
                  <span style={{fontSize: '20px', fontWeight: 'bold'}}>{adsWatched} 📺</span>
              </div>
          </div>

          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'rank', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
