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
  SPIN_REWARD: 0.0001, // Fixed reward (hidden from UI)
  SPIN_COOLDOWN: 2 * 60 * 60 * 1000, // 2 Hours
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
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('saved_bal')) || 0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('saved_comp')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastActionTime, setLastActionTime] = useState(0);
  const [showClaimId, setShowClaimId] = useState(null);

  // --- Spin States ---
  const [lastSpinTime, setLastSpinTime] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);

  // Admin States
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
        setLastSpinTime(userData.lastSpinTime || 0); // Get spin time
        localStorage.setItem('saved_bal', userData.balance);
        localStorage.setItem('saved_comp', JSON.stringify(userData.completedTasks || []));
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    } catch (e) { console.error("Sync error"); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Lucky Spin Function ---
  const handleSpin = () => {
    const now = Date.now();
    if (now - lastSpinTime < APP_CONFIG.SPIN_COOLDOWN && APP_CONFIG.MY_UID !== "1793453606") {
      const remain = APP_CONFIG.SPIN_COOLDOWN - (now - lastSpinTime);
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      return alert(`Cooldown: Try again in ${h}h ${m}m!`);
    }

    const elapsed = (Date.now() - lastActionTime) / 1000;
    if (APP_CONFIG.MY_UID !== "1793453606" && (lastActionTime === 0 || elapsed < 15)) {
      alert(`Please watch ads first (15s) to enable spin!`);
      triggerAds();
      return;
    }

    setIsSpinning(true);
    const extraDegree = 1800 + Math.floor(Math.random() * 360); // 5+ rounds
    const newRotation = spinRotation + extraDegree;
    setSpinRotation(newRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const winAmt = APP_CONFIG.SPIN_REWARD;
      const newBal = Number((balance + winAmt).toFixed(5));
      
      setBalance(newBal);
      setLastSpinTime(Date.now());
      setLastActionTime(0);

      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, lastSpinTime: Date.now() })
      });
      
      alert(`Luck is with you! You received your reward.`);
      fetchData();
    }, 4000);
  };

  const startTask = (id, link) => {
    window.open(link, '_blank');
    setTimeout(() => {
        triggerAds();
        setShowClaimId(id);
    }, 1500);
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
    if (id !== 'watch_ad') {
        setCompleted(newComp);
        localStorage.setItem('saved_comp', JSON.stringify(newComp));
        setShowClaimId(null);
    }
    localStorage.setItem('saved_bal', newBal);

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify({ balance: newBal, completedTasks: id !== 'watch_ad' ? newComp : completed })
    });
    
    alert(`Success! +${rewardAmt} TON.`);
    setLastActionTime(0);
    fetchData();
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
    // Spin Styles
    wheelBox: { position: 'relative', width: '200px', height: '200px', margin: '20px auto' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', transition: 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)', background: 'conic-gradient(#000 0% 12.5%, #facc15 12.5% 25%, #000 25% 37.5%, #facc15 37.5% 50%, #000 50% 62.5%, #facc15 62.5% 75%, #000 75% 87.5%, #facc15 87.5% 100%)' },
    pointer: { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '0', height: '0', borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '30px solid red', zIndex: '5' },
    wheelText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', color: '#fff', textShadow: '2px 2px #000' }
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
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleAction(() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                })}>CLAIM CODE</button>

                {/* --- Spin Wheel UI --- */}
                <div style={{textAlign: 'center', marginTop: '30px', borderTop: '2px solid #eee', paddingTop: '20px'}}>
                  <h3 style={{margin: '0 0 10px 0'}}>🎡 Lucky Spin</h3>
                  <p style={{fontSize: '10px', color: '#666'}}>Every 2 Hours • Big Rewards Inside!</p>
                  
                  <div style={styles.wheelBox}>
                    <div style={styles.pointer}></div>
                    <div style={{...styles.wheel, transform: `rotate(${spinRotation}deg)`}}></div>
                    <div style={styles.wheelText}>LUCKY</div>
                  </div>

                  <button 
                    style={{...styles.btn, background: isSpinning ? '#555' : '#000'}} 
                    disabled={isSpinning}
                    onClick={handleSpin}
                  >
                    {isSpinning ? "SPINNING..." : "WATCH AD & SPIN"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{margin:'0 0 10px 0', borderBottom: '2px solid #000'}}>Admin Controls</h4>
                {/* Admin user management... (unchanged) */}
                <input style={styles.input} placeholder="Enter User UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={() => handleAction(async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); setNewVipStatus(data.isVip || false); } else alert("Not found");
                })}>SEARCH USER</button>
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
        </div>
      )}

      {activeNav === 'withdraw' && (
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
