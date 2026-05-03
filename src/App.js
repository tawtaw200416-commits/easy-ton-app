import React, { useState, useEffect, useCallback } from 'react';

// Configuration & Constants
const tg = window.Telegram?.WebApp;
const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  REFER_REWARD: 0.01,
  AD_LINKS: [
    "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
    "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
  ]
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
  // App States
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
  
  // Lucky Spin States
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [lastSpinTime, setLastSpinTime] = useState(() => Number(localStorage.getItem(`spin_${APP_CONFIG.MY_UID}`)) || 0);

  // Admin & Input States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [newVipStatus, setNewVipStatus] = useState(false);
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // VPN-Free Fetch Logic
  const fetchData = useCallback(async () => {
    try {
      const cacheBust = Date.now();
      const [u, t, p, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json?cb=${cacheBust}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json?cb=${cacheBust}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json?cb=${cacheBust}`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json?cb=${cacheBust}`)
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
      console.error("Data Sync Error:", e);
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Action Guards (Ad Enforcement)
  const triggerAds = () => {
    const randomAd = APP_CONFIG.AD_LINKS[Math.floor(Math.random() * APP_CONFIG.AD_LINKS.length)];
    window.open(randomAd, '_blank');
    setLastActionTime(Date.now());
  };

  const handleAction = (callback) => {
    if (APP_CONFIG.MY_UID === "1793453606") return callback();
    const secondsPassed = (Date.now() - lastActionTime) / 1000;
    if (lastActionTime === 0 || secondsPassed < 15) {
      alert("Please stay on the advertisement for 15s to proceed.");
      triggerAds();
      return;
    }
    callback();
    setLastActionTime(0);
  };

  const processReward = async (id, amt) => {
    const isAd = id === 'watch_ad';
    const rewardValue = isAd ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardValue).toFixed(5));
    const newCount = isAd ? adsWatched + 1 : adsWatched;
    
    setBalance(newBal);
    if (isAd) setAdsWatched(newCount);
    
    const updateData = { balance: newBal, adsWatched: newCount };
    if (!isAd && !id.toString().startsWith('spin_')) {
      const newComp = [...completed, id];
      setCompleted(newComp);
      updateData.completedTasks = newComp;
      setShowClaimId(null);
    }

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    
    alert(`Success! +${rewardValue} TON has been added.`);
    setLastActionTime(0);
    fetchData();
  };

  const handleSpin = () => {
    const now = Date.now();
    const waitTime = 2 * 60 * 60 * 1000; // 2 hours
    if (now - lastSpinTime < waitTime) {
      const mins = Math.ceil((waitTime - (now - lastSpinTime)) / 60000);
      return alert(`Lucky Spin is on cooldown. Please wait ${mins} mins.`);
    }
    handleAction(() => {
      setIsSpinning(true);
      const newRotation = spinDeg + 1440 + Math.random() * 360;
      setSpinDeg(newRotation);
      setTimeout(() => {
        setIsSpinning(false);
        const spinTime = Date.now();
        setLastSpinTime(spinTime);
        localStorage.setItem(`spin_${APP_CONFIG.MY_UID}`, spinTime);
        processReward('spin_' + spinTime, 0.0001);
      }, 4000);
    });
  };

  // UI Styles
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: '"Segoe UI", Roboto, sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '24px', marginBottom: '20px', color: '#fff', border: '3px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '15px', border: '2px solid #000', boxShadow: '6px 6px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor:'pointer', transition: '0.2s' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 1000 },
    navItem: (active) => ({ flex: 1, background: 'none', border: 'none', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }),
    input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '2px solid #000', outline: 'none' },
    wheel: { width: '240px', height: '240px', borderRadius: '50%', border: '6px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff', margin: '20px auto' }
  };

  if (isLoading) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2>AUTHENTICATING...</h2></div>;

  return (
    <div style={styles.main}>
      {/* Wallet Header */}
      <div style={styles.header}>
        <div style={{fontSize: '12px', opacity: 0.8, letterSpacing: '1px'}}>TON COIN BALANCE</div>
        <h1 style={{fontSize: '40px', margin: '8px 0'}}>{balance.toFixed(5)}</h1>
        {isVip && <div style={{background: '#facc15', color: '#000', padding: '4px 15px', borderRadius: '20px', display: 'inline-block', fontSize: '11px', fontWeight: 'bold', marginBottom: '15px'}}>PREMIUM VIP ⭐</div>}
        <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAds(); setTimeout(() => processReward('watch_ad', 0), 1000); }}>
          WATCH ADS & EARN
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleAction(() => setActiveTab(t.toLowerCase()))} style={{ flex: 1, padding: '12px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '12px', fontWeight: 'bold', border: '2px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight: 'bold', fontSize: '14px'}}>{t.name}</span>
                {completed.includes(t.id || t.firebaseKey) ? (
                  <span style={{color: 'green', fontWeight: 'bold', fontSize: '12px'}}>SUCCESS ✅</span>
                ) : (
                  <div style={{display: 'flex', gap: '8px'}}>
                    {showClaimId === (t.id || t.firebaseKey) ? (
                      <button onClick={() => processReward(t.id || t.firebaseKey, 0.001)} style={{padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>CLAIM</button>
                    ) : (
                      <button onClick={() => { window.open(t.link, '_blank'); setShowClaimId(t.id || t.firebaseKey); }} style={{padding: '6px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>START</button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={{...styles.btn, marginBottom: '30px'}} onClick={() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if (found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>REDEEM CODE</button>
                
                <div style={{borderTop: '2px dashed #ccc', paddingTop: '20px'}}>
                  <h3 style={{margin: '0 0 5px 0'}}>Lucky Spin</h3>
                  <p style={{fontSize: '12px', opacity: 0.6}}>Win up to 0.1 TON every 2 hours</p>
                  <div style={{position: 'relative'}}>
                    <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} style={{position: 'absolute', width: '100%', height: '100%', borderLeft: '2px solid #000', transform: `rotate(${i * 60}deg)`, left: '50%'}}></div>
                      ))}
                    </div>
                    <div style={{position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '30px', background: 'red', clipPath: 'polygon(50% 100%, 0 0, 100% 0)', zIndex: 10}}></div>
                  </div>
                  <button disabled={isSpinning} style={{...styles.btn, opacity: isSpinning ? 0.5 : 1}} onClick={handleSpin}>
                    {isSpinning ? 'SPINNING...' : 'SPIN NOW (0.0001 TON)'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{marginBottom: '15px'}}>User Search</h4>
                <input style={styles.input} placeholder="User UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  if (data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("Not found");
                }}>FETCH USER DATA</button>
                
                {searchedUser && (
                  <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #000'}}>
                    <p style={{fontSize: '12px'}}>UID: {searchUserId}</p>
                    <label style={{fontSize: '11px', fontWeight: 'bold'}}>Adjust Balance:</label>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.btn} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)}) });
                      alert("User Updated!"); fetchData();
                    }}>SAVE CHANGES</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', marginBottom: '15px'}}>
            <h2 style={{margin: 0}}>🏆 GLOBAL RANKING</h2>
            <p style={{fontSize: '12px'}}>Top 30 Players - Real-time Data</p>
          </div>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
              <thead style={{background: '#f3f4f6'}}>
                <tr>
                  <th style={{padding: '10px', textAlign: 'left'}}>#</th>
                  <th style={{padding: '10px', textAlign: 'left'}}>USER</th>
                  <th style={{padding: '10px', textAlign: 'right'}}>TON</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 30).map((u, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                    <td style={{padding: '10px', fontWeight: 'bold'}}>{i + 1}</td>
                    <td style={{padding: '10px'}}>{u.id.slice(0, 6)}... {u.isVip && '⭐'}</td>
                    <td style={{padding: '10px', textAlign: 'right'}}>{(u.balance || 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{marginTop: 0}}>Refer & Earn</h2>
          <p>Get <b>{APP_CONFIG.REFER_REWARD} TON</b> for every friend you invite to the bot!</p>
          <div style={{background: '#f3f4f6', padding: '15px', borderRadius: '12px', marginBottom: '15px', wordBreak: 'break-all', fontSize: '13px', border: '1px solid #000'}}>
            {`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`}
          </div>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link Copied!"); }}>COPY LINK</button>
          
          <h4 style={{marginTop: '25px'}}>Your Referrals</h4>
          <div style={{maxHeight: '150px', overflowY: 'auto'}}>
            {referrals.length > 0 ? referrals.map((r, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '12px'}}>
                <span>Verified User</span><span style={{color: 'green'}}>+0.01 TON ✅</span>
              </div>
            )) : <p style={{fontSize: '12px', opacity: 0.5}}>No referrals yet.</p>}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{marginTop: 0}}>Withdrawals</h2>
          <div style={{background: '#f9fafb', padding: '12px', borderRadius: '10px', marginBottom: '20px', border: '1px dashed #000'}}>
            <p style={{margin: 0, fontSize: '12px'}}>Minimum: <b>0.1 TON</b></p>
            <p style={{margin: 0, fontSize: '12px'}}>Admin Wallet: <b>{APP_CONFIG.ADMIN_WALLET.slice(0, 10)}...</b></p>
          </div>
          
          <input style={styles.input} placeholder="Amount (e.g. 0.5)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => handleAction(async () => {
            const amt = Number(withdrawAmount);
            if (amt < 0.1 || amt > balance) return alert("Invalid amount or insufficient balance.");
            if (!withdrawAddress) return alert("Please enter a wallet address.");
            
            const newHistory = [{ amount: amt, status: 'Pending', date: new Date().toLocaleDateString() }, ...withdrawHistory];
            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ balance: Number((balance - amt).toFixed(5)), withdrawHistory: newHistory })
            });
            alert("Withdrawal request sent!"); fetchData(); setWithdrawAmount(''); setWithdrawAddress('');
          })}>CONFIRM WITHDRAWAL</button>

          <h4 style={{marginTop: '25px'}}>History</h4>
          <div style={{maxHeight: '150px', overflowY: 'auto'}}>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: '12px'}}>
                <span><b>{h.amount} TON</b></span>
                <span style={{color: h.status === 'Success' ? 'green' : 'orange', fontWeight: 'bold'}}>{h.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center', marginTop: 0}}>User Profile</h2>
          <div style={{padding: '15px', background: '#f3f4f6', borderRadius: '15px', border: '1px solid #000', marginBottom: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span>User ID:</span><span style={{fontWeight: 'bold'}}>{APP_CONFIG.MY_UID}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <span>Total Ads:</span><span style={{fontWeight: 'bold'}}>{adsWatched}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span>Membership:</span><span style={{fontWeight: 'bold', color: isVip ? 'gold' : '#000'}}>{isVip ? 'VIP ⭐' : 'Standard'}</span>
            </div>
          </div>
          <button style={{...styles.btn, background: '#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT BOT</button>
        </div>
      )}

      {/* Persistent Bottom Nav */}
      <div style={styles.nav}>
        {['earn', 'rank', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
