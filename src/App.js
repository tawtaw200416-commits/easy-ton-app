import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  // Using direct REST URL to bypass proxy/VPN issues
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

const getPrize = (index) => {
  const rank = index + 1;
  if (rank === 1) return "5.00";
  if (rank === 2) return "3.00";
  if (rank === 3) return "1.00";
  if (rank === 4 || rank === 5) return "0.9";
  if (rank >= 6 && rank <= 8) return "0.8";
  if (rank >= 9 && rank <= 12) return "0.7";
  if (rank >= 13 && rank <= 14) return "0.5";
  if (rank === 15) return "0.4";
  if (rank >= 16 && rank <= 19) return "0.3";
  if (rank >= 20 && rank <= 24) return "0.2";
  if (rank >= 25 && rank <= 30) return "0.1";
  return "0.0";
};

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
  // Initialize states from LocalStorage so data is visible immediately (No VPN required)
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_${APP_CONFIG.MY_UID}`)) || 0);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`hist_${APP_CONFIG.MY_UID}`)) || []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
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

  // Admin/UI States
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

  // Helper for direct Firebase REST calls (No Proxy/VPN needed)
  const fireFetch = async (path, method = 'GET', body = null) => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      console.error("Network Error:", e);
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    const [uData, tData, pData, allData, adsData] = await Promise.all([
      fireFetch(`/users/${APP_CONFIG.MY_UID}.json`),
      fireFetch(`/global_tasks.json`),
      fireFetch(`/promo_codes.json`),
      fireFetch(`/users.json`),
      fireFetch(`/adsterra_links.json`)
    ]);

    if (uData) {
      setBalance(Number(uData.balance || 0));
      setCompleted(uData.completedTasks || []);
      setAdsWatched(uData.adsWatched || 0);
      setWithdrawHistory(uData.withdrawHistory || []);
      setIsVip(uData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
      setReferrals(uData.referrals ? Object.values(uData.referrals) : []);

      // Update LocalStorage cache for offline viewing
      localStorage.setItem(`bal_${APP_CONFIG.MY_UID}`, uData.balance || 0);
      localStorage.setItem(`comp_${APP_CONFIG.MY_UID}`, JSON.stringify(uData.completedTasks || []));
      localStorage.setItem(`ads_${APP_CONFIG.MY_UID}`, uData.adsWatched || 0);
      localStorage.setItem(`hist_${APP_CONFIG.MY_UID}`, JSON.stringify(uData.withdrawHistory || []));
    }

    if (tData) setCustomTasks(Object.keys(tData).map(k => ({ ...tData[k], firebaseKey: k })));
    if (pData) setPromoCodes(Object.keys(pData).map(k => ({ code: k, reward: pData[k] })));
    if (adsData) setDynamicAds(prev => ({ ...prev, ...adsData }));
    if (allData) {
      setAllUsers(Object.keys(allData).map(key => ({
        id: key, 
        balance: Number(allData[key].balance || 0),
        isVip: allData[key].isVip || false
      })));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    // 3-second auto-refresh interval
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerAds = useCallback(() => {
    if (APP_CONFIG.MY_UID === "1793453606") {
      setLastActionTime(Date.now()); 
      return;
    }
    window.open(Math.random() < 0.5 ? dynamicAds.advertica : dynamicAds.adsterra, '_blank');
    setLastActionTime(Date.now()); 
  }, [dynamicAds]);

  const handleAction = (callback) => {
    if (APP_CONFIG.MY_UID === "1793453606") return callback();
    const elapsed = (Date.now() - lastActionTime) / 1000;
    if (lastActionTime === 0 || elapsed < 15) {
      alert(`Security Check: Please stay on the ad for 15s to continue!`);
      triggerAds();
      return;
    }
    callback();
    setLastActionTime(0);
  };

  const processReward = async (id, amt) => {
    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    const newAds = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    
    let newComp = [...completed];
    if (id !== 'watch_ad' && !id.startsWith('spin_') && !completed.includes(id)) {
        newComp.push(id);
    }

    // Immediate UI feedback
    setBalance(newBal);
    setAdsWatched(newAds);
    setCompleted(newComp);
    setShowClaimId(null);

    await fireFetch(`/users/${APP_CONFIG.MY_UID}.json`, 'PATCH', { 
      balance: newBal, 
      adsWatched: newAds, 
      completedTasks: newComp 
    });
    
    alert(`Success! +${rewardAmt} TON added.`);
    setLastActionTime(0);
  };

  const handleSpin = () => {
    const now = Date.now();
    if (now - lastSpinTime < 7200000) {
        const remaining = Math.ceil((7200000 - (now - lastSpinTime)) / 60000);
        return alert(`Wheel is locked. Please wait ${remaining} mins!`);
    }
    handleAction(() => {
        setIsSpinning(true);
        const newDeg = spinDeg + (1800 + Math.random() * 360);
        setSpinDeg(newDeg);
        setTimeout(() => {
            setIsSpinning(false);
            setLastSpinTime(Date.now());
            localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, Date.now()); 
            processReward('spin_' + Date.now(), 0.0001);
        }, 4000);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: (bg) => ({ padding: '8px 12px', background: bg || '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }),
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #000', boxSizing: 'border-box' }
  };

  // Only show full-screen loader if there is no cached data
  if (isLoading && balance === 0) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 style={{color: '#000'}}>SYNCING DATA...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>AVAILABLE BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <div style={{background:'#facc15', color:'#000', padding:'2px 10px', borderRadius:20, display:'inline-block', fontSize:12, fontWeight:'bold', marginBottom: 10}}>VIP ⭐</div>}
        <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => handleAction(() => processReward('watch_ad', 0))}>
          WATCH ADS & EARN
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
                <span style={{opacity: completed.includes(t.id || t.firebaseKey) ? 0.5 : 1, fontWeight: 'bold'}}>{t.name}</span>
                {completed.includes(t.id || t.firebaseKey) ? (
                    <span style={{color:'green', fontWeight:'bold'}}>DONE ✅</span>
                ) : (
                    showClaimId === (t.id || t.firebaseKey) ? (
                        <button onClick={() => processReward(t.id || t.firebaseKey, 0.001)} style={styles.smBtn('#22c55e')}>CLAIM</button>
                    ) : (
                        <button onClick={() => { window.open(t.link, '_blank'); setShowClaimId(t.id || t.firebaseKey); }} style={styles.smBtn()}>START</button>
                    )
                )}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  const pc = promoCodes.find(c => c.code === rewardCodeInput);
                  if(pc) processReward(`promo_${rewardCodeInput}`, pc.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
                <div style={{marginTop: 30, borderTop: '2px solid #eee', paddingTop: 20}}>
                    <h3>Lucky Wheel</h3>
                    <div style={{width: 220, height: 220, borderRadius: '50%', border: '5px solid #000', margin: '20px auto', transition: 'transform 4s cubic-bezier(0.1, 0, 0.1, 1)', transform: `rotate(${spinDeg}deg)`, background: 'conic-gradient(#facc15 0 60deg, #000 60deg 120deg, #facc15 120deg 180deg, #000 180deg 240deg, #facc15 240deg 300deg, #000 300deg 360deg)'}}></div>
                    <button disabled={isSpinning} style={styles.btn} onClick={handleSpin}>{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <input style={styles.input} placeholder="Search UID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const data = await fireFetch(`/users/${searchUserId}.json`);
                  if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("Not found");
                }}>AUDIT USER</button>
                {searchedUser && (
                  <div style={{marginTop: 10, padding: 10, background: '#eee', borderRadius: 10, border: '2px solid #000'}}>
                    <p>Balance: {searchedUser.balance}</p>
                    <input style={styles.input} value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.btn} onClick={async () => {
                      await fireFetch(`/users/${searchUserId}.json`, 'PATCH', { balance: Number(newBalanceInput) });
                      alert("Updated!"); fetchData();
                    }}>UPDATE BALANCE</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center'}}>🏆 TOP LEADERS</h2>
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead style={{background: '#f3f4f6'}}>
                <tr><th style={{padding: 10}}>RANK</th><th style={{padding: 10}}>UID</th><th style={{padding: 10}}>PRIZE</th></tr>
              </thead>
              <tbody>
                {allUsers.sort((a,b) => b.balance - a.balance).slice(0, 30).map((u, i) => (
                  <tr key={i} style={{borderBottom: '1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fef08a' : 'transparent'}}>
                    <td style={{padding: 10, fontWeight: 'bold'}}>#{i+1}</td>
                    <td style={{padding: 10}}>{u.id} {u.isVip && '⭐'}</td>
                    <td style={{padding: 10, textAlign: 'right', color: 'green'}}>{getPrize(i)} TON</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Invalid Amount!");
              const h = [{ amount: amt, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fireFetch(`/users/${APP_CONFIG.MY_UID}.json`, 'PATCH', { balance: Number((balance - amt).toFixed(5)), withdrawHistory: h });
              alert("Requested!"); fetchData();
          }}>SUBMIT</button>
          <div style={{marginTop: 20, maxHeight: 150, overflowY: 'auto'}}>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', fontSize: 12}}>
                <span><b>{h.amount} TON</b></span><span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'rank', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
