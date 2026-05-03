import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  // Bypass VPN requirements using a proxy
  PROXY: "https://api.allorigins.win/raw?url=", 
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
const CACHE_KEY = `easyton_v2_${APP_CONFIG.MY_UID}`;

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
  // Restore state from LocalStorage first to show immediate data to user
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`${CACHE_KEY}_balance`)) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`${CACHE_KEY}_completed`)) || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`${CACHE_KEY}_withdraws`)) || []);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
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
      const buildProxyUrl = (path) => `${APP_CONFIG.PROXY}${encodeURIComponent(`${APP_CONFIG.FIREBASE_URL}${path}?t=${Date.now()}`)}`;

      const [u, t, p] = await Promise.all([
        fetch(buildProxyUrl(`/users/${APP_CONFIG.MY_UID}.json`)),
        fetch(buildProxyUrl(`/global_tasks.json`)),
        fetch(buildProxyUrl(`/promo_codes.json`))
      ]);

      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();

      if (userData) {
        // Essential: Recovering old balance and task history
        const fbBalance = Number(userData.balance || 0);
        const fbCompleted = userData.completedTasks || [];
        const fbWithdraws = userData.withdrawHistory || [];

        setBalance(fbBalance);
        setCompleted(fbCompleted);
        setWithdrawHistory(fbWithdraws);
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);

        // Save to cache to prevent data flickering or loss on refresh
        localStorage.setItem(`${CACHE_KEY}_balance`, fbBalance);
        localStorage.setItem(`${CACHE_KEY}_completed`, JSON.stringify(fbCompleted));
        localStorage.setItem(`${CACHE_KEY}_withdraws`, JSON.stringify(fbWithdraws));
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      
      setIsLoading(false);
    } catch (e) { 
      console.warn("Using offline cached data...");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(() => fetchData(true), 8000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // Unified function for updating Database
  const saveUserData = async (updates) => {
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error("Save failed, will retry next sync.");
    }
  };

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
      alert(`Stay on the ad for 15s to verify!`);
      triggerAds();
      return;
    }
    callback();
    setLastActionTime(0);
  };

  const processReward = async (taskId, amount) => {
    const elapsed = (Date.now() - lastActionTime) / 1000;
    const timeLimit = taskId === 'watch_ad' ? 30 : 15;

    if (APP_CONFIG.MY_UID !== "1793453606" && (lastActionTime === 0 || elapsed < timeLimit)) {
      alert(`Please wait ${timeLimit}s to claim your reward.`);
      triggerAds();
      return;
    }

    const reward = taskId === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amount;
    const newBalance = Number((balance + reward).toFixed(5));
    const isPermanentTask = taskId !== 'watch_ad' && !taskId.startsWith('spin_');
    const newCompletedList = isPermanentTask ? [...completed, taskId] : completed;

    // Update UI immediately
    setBalance(newBalance);
    if (isPermanentTask) {
        setCompleted(newCompletedList);
        setShowClaimId(null);
    }

    // Push to Database
    await saveUserData({
        balance: newBalance,
        completedTasks: newCompletedList
    });
    
    alert(`Reward Collected: +${reward} TON`);
    setLastActionTime(0);
    fetchData(true);
  };

  const handleSpin = () => {
    const now = Date.now();
    const cooldown = 2 * 60 * 60 * 1000;
    if (now - lastSpinTime < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastSpinTime)) / 60000);
        return alert(`Lucky wheel cooling down: ${remaining} mins left.`);
    }
    handleAction(() => {
        setIsSpinning(true);
        const rotation = 180 + (360 * 5); 
        setSpinDeg(prev => prev + rotation);
        setTimeout(() => {
            setIsSpinning(false);
            const ts = Date.now();
            setLastSpinTime(ts);
            localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, ts); 
            processReward('spin_' + ts, 0.0001);
        }, 4000);
    });
  };

  const startTask = (id, link) => {
    handleAction(() => {
        window.open(link, '_blank');
        setTimeout(() => setShowClaimId(id), 2000);
    });
  };

  const approveWithdraw = async (userId, idx) => {
    handleAction(async () => {
        const res = await fetch(APP_CONFIG.PROXY + encodeURIComponent(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`));
        const user = await res.json();
        if (!user?.withdrawHistory) return;
        const history = [...user.withdrawHistory];
        history[idx].status = "Success";
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ withdrawHistory: history })
        });
        alert("Transaction Finalized!");
        fetchData(true);
    });
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
    wheelContainer: { position: 'relative', width: '250px', height: '250px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff' },
    pointer: { position: 'absolute', top: '-10px', zIndex: 10, width: '25px', height: '35px', background: 'red', clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }
  };

  // If user has cached balance, don't show the full loading screen to prevent flickering
  if (isLoading && balance === 0) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#000'}}>Recovering Account...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{letterSpacing:1}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
        {isVip && <div style={{background:'#facc15', color:'#000', padding:'3px 12px', borderRadius:20, display:'inline-block', fontSize:11, fontWeight:'bold', marginBottom: 12}}>PREMIUM VIP ⭐</div>}
        <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAds(); setTimeout(() => processReward('watch_ad', 0), 1000); }}>
          EARN BY WATCHING ADS
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleAction(() => setActiveTab(t.toLowerCase()))} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize:11 }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id || t.firebaseKey) ? 0.4 : 1, fontSize:13}}>{t.name}</span>
                {completed.includes(t.id || t.firebaseKey) ? (
                    <span style={{color:'#22c55e', fontWeight:'bold', fontSize:11}}>VERIFIED ✅</span>
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
                <input style={styles.input} placeholder="Gift Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={{...styles.btn, marginBottom: '25px'}} onClick={() => handleAction(() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid or Expired Code");
                })}>REDEEM CODE</button>
                <div style={{borderTop: '2px solid #eee', paddingTop: '20px'}}>
                    <h3>Lucky Wheel</h3>
                    <p style={{fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '15px'}}>Next spin available in 2 hours💎</p>
                    <div style={styles.wheelContainer}>
                        <div style={styles.pointer}></div>
                        <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                            {[
                                { t: '0.1', c: '#facc15' }, { t: '0.0001', c: '#000' }, { t: '0.3', c: '#facc15' }, { t: '0.0001', c: '#000' }, { t: '0.001', c: '#facc15' }, { t: '0.01', c: '#000' }
                            ].map((s, i) => (
                                <div key={i} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${i * 60}deg)`, clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)', background: s.c, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                                    <span style={{ color: s.c === '#000' ? '#fff' : '#000', fontSize: '9px', fontWeight: 'bold', marginTop: '35px', transform: 'rotate(30deg)', width: '70px', textAlign: 'center' }}>{s.t} TON</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button disabled={isSpinning} style={{...styles.btn, background: isSpinning ? '#999' : '#000'}} onClick={handleSpin}>{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{margin:'0 0 10px 0', borderBottom: '2px solid #000'}}>Admin Dashboard</h4>
                
                <h5 style={{marginTop: 10}}>Active Global Tasks</h5>
                <div style={{maxHeight: '120px', overflowY: 'auto', marginBottom: 15, padding: 5, background: '#f5f5f5', borderRadius: 8}}>
                    {customTasks.map((ct, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '6px', borderBottom: '1px solid #ddd', fontSize: 11}}>
                            <span>[{ct.type.toUpperCase()}] {ct.name}</span>
                            <button onClick={() => handleAction(async () => { if(window.confirm("Remove Task?")) { await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${ct.firebaseKey}.json`, { method: 'DELETE' }); fetchData(true); } })} style={{color: 'red', border: 'none', background: 'none', fontWeight: 'bold'}}>DEL</button>
                        </div>
                    ))}
                </div>

                <div style={{background: '#f9fafb', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #eee'}}>
                  <h6 style={{margin: '0 0 10px 0'}}>New Promo Code</h6>
                  <input style={styles.input} placeholder="Code String" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                  <input style={styles.input} placeholder="TON Reward" type="number" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                  <button style={{...styles.btn, background: '#8b5cf6'}} onClick={() => handleAction(async () => {
                      if(!adminPromoCode || !adminPromoReward) return alert("Missing fields");
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method:'PUT', body: JSON.stringify(Number(adminPromoReward)) });
                      alert("Code Activated!"); setAdminPromoCode(''); setAdminPromoReward(''); fetchData(true);
                  })}>CREATE GIFT CODE</button>
                </div>

                <h5>User Inspection</h5>
                <input style={styles.input} placeholder="Search by Telegram UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={() => handleAction(async () => {
                  const res = await fetch(APP_CONFIG.PROXY + encodeURIComponent(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`));
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); setNewVipStatus(data.isVip || false); } else alert("User not found.");
                })}>SEARCH DATA</button>
                {searchedUser && (
                  <div style={{marginTop:12, padding:12, background:'#f3f4f6', borderRadius:10, border:'2px solid #000'}}>
                    <p style={{fontSize:11, marginBottom:8}}>Target UID: {searchUserId}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <select style={styles.select} value={newVipStatus.toString()} onChange={e => setNewVipStatus(e.target.value === 'true')}><option value="false">Standard User</option><option value="true">VIP Member ⭐</option></select>
                    <button style={styles.btn} onClick={() => handleAction(async () => { await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput), isVip: newVipStatus}) }); alert("User Modified!"); fetchData(true); })}>UPDATE DB</button>
                    <h6 style={{margin:'10px 0 5px 0'}}>Withdraw Requests:</h6>
                    <div style={{maxHeight: 100, overflowY: 'auto', background: '#fff', padding: 5, borderRadius: 5}}>
                        {searchedUser.withdrawHistory?.map((h, idx) => (
                            <div key={idx} style={{display:'flex', justifyContent:'space-between', fontSize:10, padding:'5px 0', borderBottom:'1px solid #eee'}}>
                                <span>{h.amount} TON ({h.status})</span>
                                {h.status === 'Pending' && <button onClick={() => approveWithdraw(searchUserId, idx)} style={{background:'green', color:'#fff', border:'none', borderRadius:4, padding:'2px 6px'}}>Confirm</button>}
                            </div>
                        ))}
                    </div>
                  </div>
                )}

                <h5 style={{marginTop: 20}}>Add New Task</h5>
                <input style={styles.input} placeholder="Display Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="URL Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.select} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}><option value="bot">Telegram Bot</option><option value="social">Social Channel</option></select>
                <button style={{...styles.btn, background:'#22c55e'}} onClick={() => handleAction(async () => {
                    if(!adminTaskName || !adminTaskLink) return alert("Fill all fields");
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, { method:'POST', body: JSON.stringify({name: adminTaskName, link: adminTaskLink, type: adminTaskType}) });
                    alert("Task Published!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData(true);
                })}>POST TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Affiliate Program</h3>
          <p>Get <b>{APP_CONFIG.REFER_REWARD} TON</b> for every friend you invite!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => handleAction(() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!"); })}>COPY MY LINK</button>
          <h4 style={{marginTop: 20}}>Referral Network</h4>
          <div style={{maxHeight: 150, overflowY: 'auto'}}>
            {referrals.length > 0 ? referrals.map((r, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee', fontSize:12}}>
                    <span>User: {r.id || "Active Referral"}</span><span style={{color:'#22c55e', fontWeight:'bold'}}>Verified ✅</span>
                </div>
            )) : <p style={{fontSize:12, opacity:0.5, textAlign:'center', marginTop:10}}>You haven't invited anyone yet.</p>}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Buy VIP Status (1 TON)</h3>
            <p style={{fontSize:11, marginBottom: 8, color:'#666'}}>Unlock double rewards and priority withdrawals instantly.</p>
            <p style={{fontSize:12, fontWeight:'bold'}}>Admin Wallet:</p>
            <div style={{display:'flex', gap: 5, marginBottom: 12}}>
                <input style={{...styles.input, marginBottom: 0, flex: 1, fontSize: 10}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                <button style={styles.smBtn()} onClick={()=> handleAction(()=> {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!");})}>Copy</button>
            </div>
            <p style={{fontSize:12, fontWeight:'bold'}}>Payment Memo (UID):</p>
            <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom: 0, flex: 1}} readOnly value={APP_CONFIG.MY_UID} />
                <button style={styles.smBtn()} onClick={()=> handleAction(()=> {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!");})}>Copy</button>
            </div>
          </div>
          <div style={styles.card}>
            <h3>Withdraw History</h3>
            <div style={{maxHeight: 120, overflowY: 'auto', marginBottom:12, background: '#f9f9f9', padding: 5, borderRadius: 8}}>
                {withdrawHistory.length > 0 ? withdrawHistory.map((h, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 6px', borderBottom:'1px solid #eee', fontSize:11}}>
                        <span><b>{h.amount} TON</b></span>
                        <span style={{color: h.status === 'Success' ? '#22c55e' : '#f97316', fontWeight: 'bold'}}>{h.status}</span>
                        <span style={{opacity:0.5}}>{h.date?.split(',')[0]}</span>
                    </div>
                )) : <p style={{fontSize:11, textAlign:'center', padding:10, opacity:0.5}}>No withdrawal requests found.</p>}
            </div>
            <h3>Request Payout</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1 TON)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Receiver TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => handleAction(async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Check balance or minimum amount.");
              if(!withdrawAddress) return alert("Enter a valid TON address.");
              const newEntry = { amount: amt, status: 'Pending', date: new Date().toLocaleString() };
              const newHistory = [newEntry, ...withdrawHistory];
              
              const remainingBal = Number((balance - amt).toFixed(5));
              setBalance(remainingBal);
              setWithdrawHistory(newHistory);

              await saveUserData({ 
                balance: remainingBal, 
                withdrawHistory: newHistory 
              });
              
              alert("Withdrawal request submitted for review."); fetchData(true); setWithdrawAmount(''); setWithdrawAddress('');
            })}>CASH OUT NOW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Statistics</h3>
          <div style={{lineHeight: 2, padding:'10px 0'}}>
            <p>Telegram ID: <b>{APP_CONFIG.MY_UID}</b></p>
            <p>Wallet Balance: <b>{balance.toFixed(5)} TON</b></p>
            <p>Account Type: {isVip ? <b style={{color:'#eab308'}}>PREMIUM VIP ⭐</b> : "Standard Free"}</p>
            <p>Tasks Completed: <b>{completed.length}</b></p>
          </div>
          <button style={{...styles.btn, background:'#ef4444', marginTop: 15}} onClick={() => handleAction(() => window.open(APP_CONFIG.SUPPORT_BOT))}>SUPPORT TICKETS</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleAction(() => setActiveNav(n))} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px', letterSpacing:0.5 }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
