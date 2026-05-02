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

// ... (fixedBotTasks and fixedSocialTasks remain unchanged)
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
  // FIX: Initializing with 0/empty to prevent "Same Phone" data leak
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  
  const [isVip, setIsVip] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastActionTime, setLastActionTime] = useState(0);
  const [showClaimId, setShowClaimId] = useState(null);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  
  // FIX: Scoped spin time to the specific UID
  const [lastSpinTime, setLastSpinTime] = useState(() => Number(localStorage.getItem(`last_spin_${APP_CONFIG.MY_UID}`)) || 0);

  // Admin and form states
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

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, p] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      } else {
        // If it's a completely new user on this phone, clear the state
        setBalance(0);
        setCompleted([]);
        setWithdrawHistory([]);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID));
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      
      setIsLoading(false); // Data is now specific to this ID
    } catch (e) { 
      console.error("Sync error"); 
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // FIX: Helper to trigger ads and handle rewards (unchanged logic, just ensuring no local caching)
  const triggerAds = useCallback(() => {
    if (APP_CONFIG.MY_UID === "1793453606") {
      setLastActionTime(Date.now()); 
      return;
    }
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
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
    const newComp = [...completed, id];

    setBalance(newBal);
    if (id !== 'watch_ad' && !id.startsWith('spin_')) {
        setCompleted(newComp);
        setShowClaimId(null);
    }

    // Save to Firebase ONLY (removed localStorage save)
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify({ balance: newBal, completedTasks: (id !== 'watch_ad' && !id.startsWith('spin_')) ? newComp : completed })
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

    if (APP_CONFIG.MY_UID !== "1793453606") {
        const elapsed = (now - lastActionTime) / 1000;
        if (lastActionTime === 0 || elapsed < 15) {
          alert(`Please stay on the ad for 15s to spin!`);
          triggerAds();
          return;
        }
    }

    setIsSpinning(true);
    const extraSpin = 180 + (360 * 5); 
    const newDeg = spinDeg + extraSpin;
    setSpinDeg(newDeg);

    setTimeout(() => {
        setIsSpinning(false);
        const spinTime = Date.now();
        setLastSpinTime(spinTime);
        localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, spinTime); // Unique to UID
        processReward('spin_' + spinTime, 0.0001);
    }, 4000);
  };

  // ... (approveWithdraw and startTask remain unchanged)
  const startTask = (id, link) => {
    window.open(link, '_blank');
    setTimeout(() => {
        triggerAds();
        setShowClaimId(id);
    }, 1500);
  };

  const approveWithdraw = async (userId, historyIndex) => {
    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`);
    const userToEdit = await res.json();
    if (!userToEdit || !userToEdit.withdrawHistory) return;

    const updatedHistory = [...userToEdit.withdrawHistory];
    updatedHistory[historyIndex].status = "Success";

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ withdrawHistory: updatedHistory })
    });
    
    alert("Withdrawal Approved!");
    const refreshed = await (await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`)).json();
    setSearchedUser(refreshed);
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

  // FIX: Loading Screen to prevent flickering data from previous user
  if (isLoading) {
    return (
      <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <h2 style={{color: '#000'}}>Syncing Profile...</h2>
      </div>
    );
  }

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

      {/* ... (Rest of the JSX remains the same as your previous version) */}
      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleAction(() => setActiveTab(t.toLowerCase()))} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
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
                            <button onClick={() => startTask(t.id || t.firebaseKey, t.link)} style={styles.smBtn()}>{activeTab === 'bot' ? 'START' : 'JOIN'}</button>
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
                    <h3 style={{margin: '0 0 5px 0'}}>Lucky Spin</h3>
                    <p style={{fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '15px'}}>Try your luck for 2 hours💎</p>
                    
                    <div style={styles.wheelContainer}>
                        <div style={styles.wheelPointer}></div>
                        <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                            {[
                                { t: '0.1 TON', c: '#facc15' },
                                { t: '0.2 TON', c: '#000' },
                                { t: '0.3 TON', c: '#facc15' },
                                { t: '0.0001 TON', c: '#000' },
                                { t: '0.001 TON', c: '#facc15' },
                                { t: '0.01 TON', c: '#000' }
                            ].map((s, i) => (
                                <div key={i} style={{
                                    position: 'absolute', width: '100%', height: '100%',
                                    transform: `rotate(${i * 60}deg)`,
                                    clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)',
                                    background: s.c, display: 'flex', alignItems: 'flex-start', justifyContent: 'center'
                                }}>
                                    <span style={{
                                        color: s.c === '#000' ? '#fff' : '#000', 
                                        fontSize: '9px', fontWeight: 'bold', 
                                        marginTop: '40px', transform: 'rotate(30deg)',
                                        whiteSpace: 'nowrap', width: '80px', textAlign: 'center'
                                    }}>{s.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        disabled={isSpinning} 
                        style={{...styles.btn, background: isSpinning ? '#666' : '#000'}} 
                        onClick={handleSpin}
                    >
                        {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
                    </button>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{margin:'0 0 10px 0', borderBottom: '2px solid #000'}}>Admin Controls</h4>
                <h5 style={{marginTop: 10}}>Manage Custom Tasks</h5>
                <div style={{maxHeight: '120px', overflowY: 'auto', marginBottom: 15, padding: 5, background: '#f0f0f0', borderRadius: 8}}>
                    {customTasks.map((ct, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid #ccc', fontSize: 11}}>
                            <span>[{ct.type.toUpperCase()}] {ct.name}</span>
                            <button onClick={async () => {
                                if(window.confirm("Delete?")) { await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${ct.firebaseKey}.json`, { method: 'DELETE' }); fetchData(); }
                            }} style={{color: 'red', border: 'none', background: 'none', fontWeight: 'bold'}}>X</button>
                        </div>
                    ))}
                </div>

                <h5>User Management</h5>
                <input style={styles.input} placeholder="Enter User UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={() => handleAction(async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) {
                    setSearchedUser(data);
                    setNewBalanceInput(data.balance);
                    setNewVipStatus(data.isVip || false);
                  } else alert("User not found!");
                })}>SEARCH USER</button>

                {searchedUser && (
                  <div style={{marginTop:10, padding:10, background:'#e5e7eb', borderRadius:10, border:'2px solid #000'}}>
                    <p style={{fontSize:11}}><b>UID:</b> {searchUserId}</p>
                    <label style={{fontSize: 10}}>Edit Balance:</label>
                    <input style={{...styles.input, marginBottom: 5}} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <label style={{fontSize: 10}}>VIP Status:</label>
                    <select style={styles.select} value={newVipStatus.toString()} onChange={e => setNewVipStatus(e.target.value === 'true')}>
                        <option value="false">Standard</option>
                        <option value="true">VIP ⭐</option>
                    </select>

                    <button style={{...styles.btn, marginBottom: 15}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { 
                            method:'PATCH', 
                            body: JSON.stringify({balance: Number(newBalanceInput), isVip: newVipStatus})
                        });
                        alert("User Updated!");
                        fetchData();
                    }}>SAVE USER CHANGES</button>

                    <h6 style={{margin:'5px 0'}}>Withdrawal Requests:</h6>
                    <div style={{maxHeight: 100, overflowY: 'auto', background: '#fff', padding: 5, borderRadius: 5}}>
                        {searchedUser.withdrawHistory ? searchedUser.withdrawHistory.map((h, idx) => (
                            <div key={idx} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, padding:'4px 0', borderBottom:'1px solid #eee'}}>
                                <span>{h.amount} TON ({h.status})</span>
                                {h.status === 'Pending' && (
                                    <button onClick={() => approveWithdraw(searchUserId, idx)} style={{background:'green', color:'#fff', border:'none', borderRadius:4, padding:'2px 6px', fontSize:9}}>Approve</button>
                                )}
                            </div>
                        )) : <p style={{fontSize:9}}>No history</p>}
                    </div>
                  </div>
                )}

                <h5 style={{marginTop: 20}}>Add New Task</h5>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.select} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">Bot Task</option>
                    <option value="social">Social Task</option>
                </select>
                <button style={{...styles.btn, background:'#22c55e'}} onClick={() => handleAction(async () => {
                    if(!adminTaskName || !adminTaskLink) return alert("Fill all!");
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { 
                        method:'POST', 
                        body: JSON.stringify({name: adminTaskName, link: adminTaskLink, type: adminTaskType})
                    });
                    alert("Task Added!"); 
                    setAdminTaskName(''); setAdminTaskLink(''); 
                    fetchData();
                })}>ADD TASK</button>

                <h5 style={{marginTop: 20}}>Add Promo Code</h5>
                <input style={styles.input} placeholder="Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} placeholder="Reward" type="number" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background: '#8b5cf6'}} onClick={() => handleAction(async () => {
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method: 'PUT', body: JSON.stringify(Number(adminPromoReward)) });
                    alert("Promo Added!"); setAdminPromoCode(''); setAdminPromoReward(''); fetchData();
                })}>ADD PROMO</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          
          <h4 style={{marginTop: 20}}>Invite History</h4>
          <div style={{maxHeight: 150, overflowY: 'auto'}}>
            {referrals.map((r, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:12}}>
                    <span>User: {r.id || "Verified"}</span>
                    <span style={{color:'green'}}>Success ✅</span>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Deposit for VIP</h3>
                <span style={{background: '#000', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>1 TON</span>
            </div>
            <p style={{fontSize:12, marginBottom: 5}}>Address:</p>
            <div style={{display:'flex', gap: 5, marginBottom: 10}}>
                <input style={{...styles.input, marginBottom: 0, flex: 1, fontSize: 11}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                <button style={styles.smBtn()} onClick={()=> {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");}}>Copy</button>
            </div>
            <p style={{fontSize:12, marginBottom: 5}}>Memo (UID):</p>
            <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom: 0, flex: 1}} readOnly value={APP_CONFIG.MY_UID} />
                <button style={styles.smBtn()} onClick={()=> {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");}}>Copy</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Withdraw History</h3>
            <div style={{maxHeight: 120, overflowY: 'auto', marginBottom:10, background: '#f9f9f9', padding: 5, borderRadius: 8}}>
                {withdrawHistory.length > 0 ? withdrawHistory.map((h, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 5px', borderBottom:'1px solid #eee', fontSize:11}}>
                        <span><b>{h.amount} TON</b></span>
                        <span style={{color: h.status === 'Success' ? 'green' : (h.status === 'Pending' ? 'orange' : 'red'), fontWeight: 'bold'}}>{h.status}</span>
                        <span style={{opacity:0.6}}>{h.date}</span>
                    </div>
                )) : <p style={{textAlign: 'center', fontSize: 11, opacity: 0.5}}>No records found.</p>}
            </div>
            <h3>New Withdrawal</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => handleAction(async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Invalid amount!");
              if(!withdrawAddress) return alert("Enter address!");
              const newH = [{ amount: amt, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((balance - amt).toFixed(5)), withdrawHistory: newH })
              });
              alert("Request Sent!"); fetchData(); setWithdrawAmount(''); setWithdrawAddress('');
            })}>WITHDRAW NOW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Status: {isVip ? "VIP Membership ⭐" : "Standard"}</p>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleAction(() => setActiveNav(n))} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
