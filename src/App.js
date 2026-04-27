import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  // Dynamic Ad Config
  const [adsConfig, setAdsConfig] = useState({ adsgramId: "27611", adsterraUrl: "" });
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Admin States
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminVipUserId, setAdminVipUserId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 
  const [adminAdsgramId, setAdminAdsgramId] = useState('');
  const [adminAdUrl, setAdminAdUrl] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_ads.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adData = await a.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      if (adData) setAdsConfig(adData);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // Save to Firebase helper
  const updateFirebase = (data) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const rewardUser = (reward) => {
    const newBal = Number((balance + reward).toFixed(5));
    const newAdsCount = adsWatched + 1;
    setBalance(newBal);
    setAdsWatched(newAdsCount);
    updateFirebase({ balance: newBal, adsWatched: newAdsCount });
    alert(`Success! +${reward} TON added.`);
  };

  const handleAdsgram = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: adsConfig.adsgramId });
      AdController.show().then((result) => {
        if (result.done) rewardUser(isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD);
      }).catch((e) => alert("Ad error or canceled"));
    } else {
      alert("Ad provider not ready.");
    }
  };

  const handleUrlAd = () => {
    if (!adsConfig.adsterraUrl) return alert("No URL ads available.");
    window.open(adsConfig.adsterraUrl, '_blank');
    setTimeout(() => {
        rewardUser(isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD);
    }, 5000); // ၅ စက္ကန့်စောင့်ပြီးမှ reward ပေးမယ်
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE {isVip && "⭐VIP"}</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched} | UID: {APP_CONFIG.MY_UID}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
             <h4 style={{textAlign:'center', margin:'0 0 10px 0'}}>📺 Watch & Earn</h4>
             <div style={{display:'flex', gap:'10px'}}>
                <button style={styles.btn} onClick={handleAdsgram}>ADSGRAM VIDEO</button>
                <button style={{...styles.btn, background:'#10b981'}} onClick={handleUrlAd}>WEBSITE ADS</button>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && (
              <div>
                <h4>Admin Control</h4>
                
                {/* ADS MANAGEMENT */}
                <div style={{background:'#eee', padding:'10px', borderRadius:'10px', marginBottom:'15px'}}>
                    <p style={{fontWeight:'bold', fontSize:'12px'}}>ADS CONFIGURATION</p>
                    <input style={styles.input} placeholder="Adsgram Block ID" value={adminAdsgramId} onChange={e => setAdminAdsgramId(e.target.value)} />
                    <input style={styles.input} placeholder="Adsterra/Direct URL" value={adminAdUrl} onChange={e => setAdminAdUrl(e.target.value)} />
                    <button style={{...styles.btn, background:'blue'}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_ads.json`, { 
                            method: 'PATCH', 
                            body: JSON.stringify({ adsgramId: adminAdsgramId || adsConfig.adsgramId, adsterraUrl: adminAdUrl || adsConfig.adsterraUrl }) 
                        });
                        alert("Ads Config Updated!"); fetchData();
                    }}>UPDATE ADS</button>
                </div>

                <hr/>
                {/* SEARCH USER */}
                <p style={{fontWeight:'bold', fontSize:'12px'}}>SEARCH USER ID</p>
                <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={{...styles.btn, background: '#f59e0b'}} onClick={async () => {
                    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                    const data = await res.json();
                    if(data) setSearchedUser(data); else alert("Not found");
                }}>SEARCH</button>

                {searchedUser && (
                    <div style={{padding:'10px', border:'1px solid #000', marginTop:'10px', borderRadius:'5px'}}>
                        <p>Bal: {searchedUser.balance}</p>
                        <input style={styles.input} type="number" placeholder="New Balance" onChange={(e) => setNewBalanceInput(e.target.value)} />
                        <button style={{...styles.btn, background:'green'}} onClick={async () => {
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                            alert("Done!"); setSearchedUser(null);
                        }}>UPDATE BAL</button>
                    </div>
                )}
                
                <hr/>
                {/* Add Tasks */}
                <p style={{fontWeight:'bold', fontSize:'12px'}}>ADD NEW TASK</p>
                <input style={styles.input} placeholder="Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background: '#000'}} onClick={async () => {
                    const id = 't_'+Date.now();
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: 'bot' }) });
                    alert("Saved!"); fetchData();
                }}>SAVE TASK</button>
              </div>
            )}
            
            {/* ... Other tabs (bot, social) remain same ... */}
            {activeTab === 'bot' && customTasks.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span>{t.name}</span>
                    <button onClick={() => window.open(t.link)} style={{...styles.btn, width:'80px', padding:'5px'}}>START</button>
                </div>
            ))}
          </div>
        </>
      )}

      {/* Navigation and other sections (withdraw, invite) follow the same structure as your original code */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
