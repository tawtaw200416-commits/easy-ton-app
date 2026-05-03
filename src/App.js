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
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/pmi0yt9u?key=3580805003ccb6983acba9b61b6cb7e2"
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
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('cache_bal')) || 0);
  const [watchCount, setWatchCount] = useState(() => Number(localStorage.getItem('cache_watch')) || 0);
  const [completed, setCompleted] = useState([]);
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

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      const timestamp = new Date().getTime(); // Prevent Cache
      const [u, t, p, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json?t=${timestamp}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json?t=${timestamp}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json?t=${timestamp}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json?t=${timestamp}`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();
      const allData = await all.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setWatchCount(Number(userData.watchCount || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        
        localStorage.setItem('cache_bal', userData.balance);
        localStorage.setItem('cache_watch', userData.watchCount);
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      if (allData) setAllUsers(Object.keys(allData).map(key => ({ id: key, ...allData[key] })));
      
      setIsLoading(false);
    } catch (e) { 
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000); // 10s fetch for efficiency
    return () => clearInterval(interval);
  }, [fetchData]);

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

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
    const newWatchCount = id === 'watch_ad' ? (watchCount + 1) : watchCount;
    const newComp = [...completed, id];

    setBalance(newBal);
    if (id === 'watch_ad') setWatchCount(newWatchCount);

    if (id !== 'watch_ad' && !id.startsWith('spin_')) {
        setCompleted(newComp);
        setShowClaimId(null);
    }

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', 
      body: JSON.stringify({ 
        balance: newBal, 
        watchCount: newWatchCount,
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
        setTimeout(() => {
            setShowClaimId(id);
        }, 1500);
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
    list: { borderTop: '1px solid #eee', marginTop: 10, paddingTop: 10 },
    badge: { background: '#facc15', color: '#000', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }
  };

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
            {/* Bot & Social Tasks */}
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

            {/* Reward / Promo Section */}
            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={{...styles.btn, marginBottom: '20px'}} onClick={() => {
                  const taskKey = `promo_${rewardCodeInput}`;
                  if (completed.includes(taskKey)) return alert("Already claimed!");
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(taskKey, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
                <h3>Lucky Spin</h3>
                <button disabled={isSpinning} style={{...styles.btn, background: isSpinning ? '#666' : '#000'}} onClick={handleSpin}>{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
              </div>
            )}
            
            {/* Admin Panel */}
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
                <div>
                    <h4 style={{margin:'0 0 10px 0'}}>User Management</h4>
                    <input style={styles.input} placeholder="User UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                    <button style={styles.btn} onClick={async () => {
                        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                        const data = await res.json();
                        if(data) { 
                          setSearchedUser(data); 
                          setNewBalanceInput(data.balance); 
                          setNewVipStatus(data.isVip || false);
                        } else alert("Not found");
                    }}>SEARCH USER</button>
                    
                    {searchedUser && (
                        <div style={{marginTop:10, padding:10, border:'2px solid #000', borderRadius: 10}}>
                            <label style={{fontSize: 12}}>Balance:</label>
                            <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                            <label style={{fontSize: 12}}>VIP Status: </label>
                            <input type="checkbox" checked={newVipStatus} onChange={e => setNewVipStatus(e.target.checked)} />
                            <button style={{...styles.btn, marginTop:10}} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { 
                                  method:'PATCH', 
                                  body: JSON.stringify({balance: Number(newBalanceInput), isVip: newVipStatus}) 
                                });
                                alert("User Updated Successfully!"); fetchData(true);
                            }}>SAVE USER CHANGES</button>
                        </div>
                    )}

                    <hr />
                    <h4 style={{margin:'10px 0'}}>Manage Tasks</h4>
                    <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                    <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                    <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                        <option value="bot">Bot Task</option>
                        <option value="social">Social Task</option>
                    </select>
                    <button style={{...styles.btn, background: 'green'}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, {
                          method: 'POST',
                          body: JSON.stringify({ name: adminTaskName, link: adminTaskLink, type: adminTaskType })
                        });
                        alert("Task Added!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData(true);
                    }}>ADD TASK</button>
                    
                    <div style={styles.list}>
                        {customTasks.map(t => (
                            <div key={t.firebaseKey} style={{display:'flex', justifyContent:'space-between', fontSize: 11, marginBottom: 5}}>
                                {t.name} ({t.type})
                                <button onClick={async () => {
                                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${t.firebaseKey}.json`, { method: 'DELETE' });
                                    fetchData(true);
                                }} style={{color:'red'}}>Delete</button>
                            </div>
                        ))}
                    </div>

                    <hr />
                    <h4 style={{margin:'10px 0'}}>Promo Codes</h4>
                    <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                    <input style={styles.input} placeholder="Reward (TON)" type="number" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                    <button style={{...styles.btn, background: 'blue'}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, {
                          method: 'PUT',
                          body: JSON.stringify(Number(adminPromoReward))
                        });
                        alert("Promo Created!"); setAdminPromoCode(''); setAdminPromoReward(''); fetchData(true);
                    }}>CREATE PROMO</button>
                    
                    <div style={styles.list}>
                        {promoCodes.map(p => (
                            <div key={p.code} style={{display:'flex', justifyContent:'space-between', fontSize: 11, marginBottom: 5}}>
                                {p.code} - {p.reward} TON
                                <button onClick={async () => {
                                    await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${p.code}.json`, { method: 'DELETE' });
                                    fetchData(true);
                                }} style={{color:'red'}}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
        <div style={styles.card}>
          <h3>VIP BUY (1.0 TON)</h3>
          <p style={{fontSize: 12}}>Send 1 TON to the address below with your UID in Memo.</p>
          <div style={{background: '#f8f8f8', padding: 10, borderRadius: 10, border: '1px dashed #000'}}>
             <p style={{fontSize: 11, margin: '0 0 5px 0'}}>Address:</p>
             <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom: 0, fontSize: 10}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                <button onClick={() => copyText(APP_CONFIG.ADMIN_WALLET)} style={styles.smBtn()}>Copy</button>
             </div>
             <p style={{fontSize: 11, margin: '10px 0 5px 0'}}>Memo (Required):</p>
             <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom: 0}} readOnly value={APP_CONFIG.MY_UID} />
                <button onClick={() => copyText(APP_CONFIG.MY_UID)} style={styles.smBtn()}>Copy</button>
             </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3>New Withdrawal</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Invalid amount!");
              const newH = [{ amount: amt, address: withdrawAddress, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((balance - amt).toFixed(5)), withdrawHistory: newH })
              });
              alert("Withdrawal Requested!"); fetchData(true);
          }}>WITHDRAW NOW</button>

          <h4 style={{marginTop: 20}}>Withdraw History</h4>
          <div style={styles.list}>
              {withdrawHistory.length === 0 ? <p style={{fontSize:11}}>No history yet.</p> : withdrawHistory.map((h, i) => (
                  <div key={i} style={{fontSize: 11, padding: '5px 0', borderBottom: '1px solid #eee'}}>
                      {h.date} - <b>{h.amount} TON</b> <span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>[{h.status}]</span>
                  </div>
              ))}
          </div>
        </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p style={{fontSize: 13}}>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per referral!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY INVITE LINK</button>
          
          <h4 style={{marginTop: 20}}>Referral History</h4>
          <div style={styles.list}>
              {referrals.length === 0 ? <p style={{fontSize: 11}}>No referrals yet.</p> : referrals.map((r, i) => (
                  <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize: 11, padding: '5px 0', borderBottom: '1px solid #eee'}}>
                      <span>User ID: {r.uid || "Unknown"}</span>
                      <span style={{color: 'green'}}>+{APP_CONFIG.REFER_REWARD} TON</span>
                  </div>
              ))}
          </div>
        </div>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <div style={{background: '#000', color: '#facc15', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '15px'}}>
              <h2 style={{margin: 0}}>🏆 Season 1 Tournament</h2>
              <p style={{margin: '5px 0', fontSize: '14px'}}>Total Prize Pool: <b>10.00 TON</b></p>
          </div>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
             <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                <thead style={{background: '#000', color: '#fff'}}>
                    <tr>
                        <th style={{padding: '10px'}}>Rank</th>
                        <th style={{padding: '10px'}}>User ID</th>
                        <th style={{padding: '10px'}}>Views</th>
                    </tr>
                </thead>
                <tbody>
                    {allUsers
                        .sort((a, b) => (b.watchCount || 0) - (a.watchCount || 0))
                        .slice(0, 50)
                        .map((user, index) => (
                            <tr key={index} style={{textAlign: 'center', borderBottom: '1px solid #eee', background: user.id === APP_CONFIG.MY_UID ? '#fef08a' : 'transparent'}}>
                                <td style={{padding: '10px'}}>{index + 1}</td>
                                <td style={{padding: '10px', fontWeight: 'bold'}}>{user.id}</td>
                                <td style={{padding: '10px'}}>{user.watchCount || 0}</td>
                            </tr>
                        ))
                    }
                </tbody>
             </table>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Ads Watched: <b>{watchCount}</b></p>
          <p>Status: {isVip ? <span style={styles.badge}>VIP MEMBER ⭐</span> : <span style={{fontSize: 12, color: '#666'}}>Free Member</span>}</p>
          <button style={{...styles.btn, background:'#ef4444', marginTop: 20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
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
