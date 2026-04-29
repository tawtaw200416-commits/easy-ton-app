import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0009, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  AD_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // VPN State
  const [isVpn, setIsVpn] = useState(false);
  const [checkingVpn, setCheckingVpn] = useState(true);

  // User States
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastAdClick, setLastAdClick] = useState(0);

  // Admin States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });
  const [adminPromo, setAdminPromo] = useState('');

  // --- VPN CHECKER LOGIC ---
  const checkVpnStatus = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      // ipapi.co provides a security check or you can check common proxy/vpn headers
      // Here we check if the connection is likely a proxy or from a data center
      if (data.proxy === true || data.hosting === true) {
        setIsVpn(true);
      } else {
        setIsVpn(false);
      }
    } catch (e) {
      console.error("VPN Check Error");
      // If API fails, we assume safety but keep monitoring
    } finally {
      setCheckingVpn(false);
    }
  }, []);

  useEffect(() => {
    checkVpnStatus();
    // Re-check every 30 seconds to prevent turning on VPN while app is open
    const vpnInterval = setInterval(checkVpnStatus, 30000);
    return () => clearInterval(vpnInterval);
  }, [checkVpnStatus]);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    if (isVpn) return;
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      }
    } catch (e) { console.log(e); }
  }, [isVpn]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, balance.toString());
    localStorage.setItem(`comp_tasks_${APP_CONFIG.MY_UID}`, JSON.stringify(completed));
    localStorage.setItem(`wd_hist_${APP_CONFIG.MY_UID}`, JSON.stringify(withdrawHistory));
  }, [balance, completed, withdrawHistory]);

  // --- REWARD LOGIC ---
  const triggerAd = () => {
    window.open(APP_CONFIG.AD_URL, '_blank');
    setLastAdClick(Date.now());
  };

  const finalizeReward = (id, amt) => {
    if (Date.now() - lastAdClick < 7000) {
      alert("Please stay on the ad for 7 seconds!");
      return;
    }
    let reward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + reward).toFixed(5));
    const newAds = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    const newComp = id !== 'watch_ad' ? [...completed, id] : completed;

    setBalance(newBal);
    setAdsWatched(newAds);
    setCompleted(newComp);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, adsWatched: newAds, completed: newComp })
    });
    alert(`Reward Collected: +${reward} TON`);
  };

  // --- STYLES ---
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    vpnOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', color: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }
  };

  // --- RENDER ---
  if (checkingVpn) return <div style={styles.vpnOverlay}>Checking Connection...</div>;
  
  if (isVpn) return (
    <div style={styles.vpnOverlay}>
      <h1 style={{color: '#facc15'}}>VPN DETECTED! ⚠️</h1>
      <p>Please turn off your VPN or Proxy to use Easy TON App.</p>
      <button onClick={() => window.location.reload()} style={{...styles.btn, background: '#facc15', color: '#000', marginTop: '20px', width: '200px'}}>RETRY</button>
    </div>
  );

  return (
    <div style={styles.main}>
      {/* Header */}
      <div style={styles.header}>
        <small>BALANCE {isVip && "⭐ VIP"}</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched}</small>
      </div>

      {/* Earn Section */}
      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
            <p>Watch Ads - Get TON</p>
            <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAd(); setTimeout(() => finalizeReward('watch_ad', 0), 7500); }}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && customTasks.filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => { tg.openLink(t.link); triggerAd(); setTimeout(() => finalizeReward(t.id, 0.001), 8000); }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            
            {activeTab === 'admin' && (
              <div>
                <h4>Admin Control</h4>
                <input style={{width:'100%', padding:'10px', marginBottom:5}} placeholder="User ID" value={searchUserId} onChange={e=>setSearchUserId(e.target.value)} />
                <button style={{...styles.btn, background: '#f59e0b'}} onClick={async()=>{
                  const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const d = await r.json();
                  if(d) { setSearchedUser(d); setNewBalanceInput(d.balance); }
                }}>SEARCH USER</button>

                {searchedUser && (
                  <div style={{marginTop:10, padding:10, background:'#f0f0f0', borderRadius:10}}>
                    <p>Current: {searchedUser.balance} TON</p>
                    <input type="number" style={{width:'100%', padding:5}} value={newBalanceInput} onChange={e=>setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, marginTop:5}} onClick={async()=>{
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Success");
                    }}>UPDATE BALANCE</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
