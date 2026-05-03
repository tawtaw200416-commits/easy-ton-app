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

  // Input states
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

  // Concurrent Fetch with cache busting to handle VPN/Network delays
  const fetchData = useCallback(async () => {
    try {
      const ts = new Date().getTime();
      const [u, t, p, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json?cb=${ts}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json?cb=${ts}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json?cb=${ts}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json?cb=${ts}`)
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
      } else {
        // First time user registration to prevent null issues
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: 0, adsWatched: 0, completedTasks: [], isVip: VIP_IDS.includes(APP_CONFIG.MY_UID) })
        });
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      if (allData) setAllUsers(Object.keys(allData).map(key => ({ id: key, ...allData[key] })));
      
      setIsLoading(false);
    } catch (e) { 
      console.error("Sync Error:", e);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(fetchData, 4000); // 4-second sync
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

  // CRITICAL: Safety Reward Process (No Overwrites)
  const processReward = async (id, amt) => {
    if (isLoading) return; // Wait for initial data

    const elapsed = (Date.now() - lastActionTime) / 1000;
    const timeLimit = id === 'watch_ad' ? 30 : 15;

    if (APP_CONFIG.MY_UID !== "1793453606" && (lastActionTime === 0 || elapsed < timeLimit)) {
      alert(`Stay on the ad for ${timeLimit}s to claim reward!`);
      triggerAds();
      return;
    }

    try {
      // Step 1: Re-fetch latest server state to prevent overwriting with stale local state
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json?cb=${Date.now()}`);
      const freshData = await res.json();
      
      if (!freshData) throw new Error("Data retrieval failed");

      const serverBalance = Number(freshData.balance || 0);
      const serverAds = Number(freshData.adsWatched || 0);
      const serverCompleted = freshData.completedTasks || [];

      // Task uniqueness check
      if (id !== 'watch_ad' && !id.startsWith('spin_') && serverCompleted.includes(id)) {
        alert("Task already completed!");
        return;
      }

      // Step 2: Calculate new values
      const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
      const newBal = Number((serverBalance + rewardAmt).toFixed(6));
      const newAdsCount = id === 'watch_ad' ? serverAds + 1 : serverAds;

      // Step 3: Build update payload
      let updatePayload = { 
        balance: newBal, 
        adsWatched: newAdsCount 
      };

      if (id !== 'watch_ad' && !id.startsWith('spin_')) {
        updatePayload.completedTasks = [...serverCompleted, id];
      }

      // Step 4: Patch to Firebase
      const patchRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH', 
        body: JSON.stringify(updatePayload)
      });

      if (patchRes.ok) {
        alert(`Success! +${rewardAmt} TON.`);
        setLastActionTime(0);
        setShowClaimId(null);
        fetchData(); // Immediate UI Sync
      }
    } catch (e) {
      alert("Reward Sync Failed. Check Network/VPN.");
    }
  };

  const handleSpin = () => {
    const now = Date.now();
    if (now - lastSpinTime < 7200000) { // 2 Hours
        const remaining = Math.ceil((7200000 - (now - lastSpinTime)) / 60000);
        return alert(`Wait ${remaining} mins for next spin!`);
    }
    
    if (APP_CONFIG.MY_UID !== "1793453606") {
      const elapsed = (Date.now() - lastActionTime) / 1000;
      if (lastActionTime === 0 || elapsed < 15) {
        alert(`Watch ad for 15s to spin!`);
        triggerAds();
        return;
      }
    }

    setIsSpinning(true);
    const newDeg = spinDeg + 1800 + Math.floor(Math.random() * 360);
    setSpinDeg(newDeg);
    
    setTimeout(() => {
        setIsSpinning(false);
        const spinTime = Date.now();
        setLastSpinTime(spinTime);
        localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, spinTime); 
        processReward('spin_' + spinTime, 0.0001);
    }, 4000);
  };

  const approveWithdraw = async (userId, historyIndex) => {
    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`);
    const user = await res.json();
    if (!user || !user.withdrawHistory) return;
    const updatedH = [...user.withdrawHistory];
    updatedH[historyIndex].status = "Success";
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ withdrawHistory: updatedH })
    });
    alert("Withdrawal Approved!");
    fetchData();
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: (bg) => ({ padding: '8px 12px', background: bg || '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }),
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', background: '#fff' },
    wheelContainer: { position: 'relative', width: '260px', height: '260px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff' },
    wheelPointer: { position: 'absolute', top: '-15px', zIndex: 10, width: '30px', height: '40px', background: 'red', clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }
  };

  if (isLoading) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#000'}}>SYNCING REAL-TIME DATA...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>SAFE BALANCE</small>
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
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => {
              const tid = t.id || t.firebaseKey;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{opacity: completed.includes(tid) ? 0.5 : 1}}>{t.name}</span>
                  {completed.includes(tid) ? <span style={{color:'green', fontWeight:'bold', fontSize:12}}>DONE ✅</span> : (
                      <div style={{display:'flex', gap:5}}>
                          {showClaimId === tid ? <button onClick={() => processReward(tid, 0.001)} style={styles.smBtn('#22c55e')}>CLAIM</button> : 
                          <button onClick={() => { window.open(t.link, '_blank'); setShowClaimId(tid); }} style={styles.smBtn()}>START</button>}
                      </div>
                  )}
                </div>
              )
            })}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={{...styles.btn, marginBottom: 20}} onClick={() => {
                  const f = promoCodes.find(c => c.code === rewardCodeInput);
                  if(f) processReward(`promo_${rewardCodeInput}`, f.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
                <div style={{borderTop: '2px solid #eee', paddingTop: 20}}>
                    <h3>Lucky Spin</h3>
                    <div style={styles.wheelContainer}>
                        <div style={styles.wheelPointer}></div>
                        <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                            {['0.1 TON', '0.2 TON', '0.3 TON', '0.0001', '0.001', '0.01'].map((s, i) => (
                                <div key={i} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${i * 60}deg)`, clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)', background: i%2===0?'#facc15':'#000', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                                    <span style={{ color: i%2===0?'#000':'#fff', fontSize: '9px', fontWeight: 'bold', marginTop: '40px', transform: 'rotate(30deg)' }}>{s}</span>
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
                <h4 style={{margin:'0 0 10px 0', borderBottom: '2px solid #000'}}>Admin Control</h4>
                <h5>Search User</h5>
                <input style={styles.input} placeholder="Enter UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const d = await r.json();
                  if(d) { setSearchedUser(d); setNewBalanceInput(d.balance); } else alert("Not found");
                }}>SEARCH</button>
                {searchedUser && (
                  <div style={{marginTop:10, padding:10, background:'#eee', borderRadius:10}}>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.btn} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)}) });
                        alert("Updated!"); fetchData();
                    }}>SAVE BALANCE</button>
                    {searchedUser.withdrawHistory?.map((h, idx) => h.status === 'Pending' && (
                        <button key={idx} onClick={() => approveWithdraw(searchUserId, idx)} style={{...styles.btn, background:'green', marginTop:5}}>APPROVE {h.amount} TON</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center'}}>TOP 30 RANK</h2>
          <div style={{maxHeight: 400, overflowY: 'auto'}}>
              <table style={{width: '100%', fontSize: 12}}>
                  <thead style={{background: '#f3f4f6'}}>
                      <tr><th style={{padding: 10, textAlign:'left'}}>RANK</th><th style={{textAlign:'left'}}>UID</th><th style={{textAlign:'right'}}>BALANCE</th></tr>
                  </thead>
                  <tbody>
                      {allUsers.sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 30).map((u, i) => (
                          <tr key={i} style={{borderBottom: '1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fef08a' : 'transparent'}}>
                              <td style={{padding: 10}}>#{i+1}</td>
                              <td>{u.id} {u.isVip && '⭐'}</td>
                              <td style={{textAlign: 'right'}}>{(u.balance || 0).toFixed(4)}</td>
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
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          <h4 style={{marginTop: 20}}>Referrals ({referrals.length})</h4>
          <div style={{maxHeight: 150, overflowY: 'auto'}}>
            {referrals.map((r, i) => <div key={i} style={{fontSize:12, padding:5, borderBottom:'1px solid #eee'}}>User: {r.id || "Verified"} ✅</div>)}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw History</h3>
          <div style={{maxHeight: 100, overflowY: 'auto', background:'#f9f9f9', padding:5, borderRadius:8, marginBottom:10}}>
              {withdrawHistory.map((h, i) => <div key={i} style={{fontSize:11, display:'flex', justifyContent:'space-between', padding:5}}>{h.amount} TON <span style={{color: h.status==='Success'?'green':'orange'}}>{h.status}</span></div>)}
          </div>
          <h3>New Withdrawal</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Invalid amount!");
              
              // SAFETY: Re-fetch latest balance before request
              const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json?cb=${Date.now()}`);
              const d = await r.json();
              const latestBal = Number(d.balance || 0);
              if(latestBal < amt) return alert("Sync Error. Refreshing...");

              const newH = [{ amount: amt, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((latestBal - amt).toFixed(5)), withdrawHistory: newH })
              });
              alert("Requested!"); fetchData(); setWithdrawAmount('');
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center'}}>Account</h2>
          <div style={{padding: 20, background: '#f3f4f6', borderRadius: 15}}>
              <p>User UID: <b>{APP_CONFIG.MY_UID}</b></p>
              <p>Type: <b>{isVip ? "VIP Member ⭐" : "Standard"}</b></p>
              <p>Real-time Balance: <b>{balance.toFixed(5)} TON</b></p>
              <p>Total Ads: <b>{adsWatched} 📺</b></p>
          </div>
          <button style={{...styles.btn, background:'#ef4444', marginTop: 20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
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
