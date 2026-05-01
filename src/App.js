import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0007, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // Syncing initial state from LocalStorage to prevent 0 balance on flash load
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(() => VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [usedCodes, setUsedCodes] = useState(() => JSON.parse(localStorage.getItem(`used_codes_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Admin States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [adminPromoCode, setAdminPromoCode] = useState('');

  // Update LocalStorage whenever states change
  useEffect(() => {
    localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, balance.toString());
    localStorage.setItem(`comp_tasks_${APP_CONFIG.MY_UID}`, JSON.stringify(completed));
    localStorage.setItem(`used_codes_${APP_CONFIG.MY_UID}`, JSON.stringify(usedCodes));
    localStorage.setItem(`wd_hist_${APP_CONFIG.MY_UID}`, JSON.stringify(withdrawHistory));
    localStorage.setItem(`ads_watched_${APP_CONFIG.MY_UID}`, adsWatched.toString());
  }, [balance, completed, usedCodes, withdrawHistory, adsWatched]);

  const updateDB = async (data) => {
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (e) { console.error("DB Update Error", e); }
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();

      if (userData) {
        // If Firebase data exists, use it to update states
        setBalance(userData.balance ?? 0);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setUsedCodes(userData.usedCodes || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setAdsWatched(userData.adsWatched || 0);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      } else {
        // First time user registration in Firebase
        updateDB({ balance, adsWatched, completed, isVip });
      }

      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      }
    } catch (e) { console.error("Fetch Error", e); }
  }, []);

  useEffect(() => { 
    fetchData();
    const interval = setInterval(fetchData, 20000); // Faster sync
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerAdsSequence = () => {
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
  };

  const checkAdStay = (seconds) => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < (seconds * 1000)) { 
      alert(`Verification Failed! Stay on ad pages for ${seconds} seconds.`);
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const handleWatchAds = () => {
    if (lastAdClickTime === 0) {
      triggerAdsSequence();
      alert("Verification started. Wait 30s on Ads, then click WATCH again.");
    } else if (checkAdStay(30)) {
        const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
        const newBal = Number((balance + reward).toFixed(5));
        const newCount = adsWatched + 1;
        setBalance(newBal);
        setAdsWatched(newCount);
        updateDB({ balance: newBal, adsWatched: newCount });
        alert(`Success! +${reward} TON`);
        setLastAdClickTime(0);
    }
  };

  const handleTaskAction = (t) => {
    if (completed.includes(t.id)) return alert("Already completed!");
    if (lastAdClickTime === 0) {
        triggerAdsSequence();
        alert("Wait 10s on Ads, then click START again.");
    } else if (checkAdStay(10)) {
        window.open(t.link, '_blank');
        const newBal = Number((balance + 0.001).toFixed(5));
        const newComp = [...completed, t.id];
        setBalance(newBal);
        setCompleted(newComp);
        updateDB({ balance: newBal, completed: newComp });
        alert("Task Reward Success!");
        setLastAdClickTime(0);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>{isVip ? "⭐ VIP ACCOUNT" : "STANDARD ACCOUNT"}</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Total Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p>Watch Video - Earn {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAds}>WATCH ADS (30s)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'PROMO'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
            {APP_CONFIG.MY_UID === "1793453606" && (
                <button onClick={() => setActiveTab('admin')} style={{ flex: 1, padding: '10px', background: activeTab === 'admin' ? 'purple' : '#fff', color: activeTab === 'admin' ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>ADMIN</button>
            )}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...fixedBotTasks, ...fixedSocialTasks, ...customTasks].filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold', fontSize:'14px'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '8px 15px', borderRadius: '8px', border:'none', fontSize:'12px' }}>{completed.includes(t.id) ? 'COMPLETED' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'promo' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn}>CLAIM REWARD</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <p>Admin Control Panel</p>
                <input style={styles.input} placeholder="Promo Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={async () => {
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method: 'PUT', body: JSON.stringify({ active: true }) });
                   alert("Code Created!");
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9', margin: '0 0 10px 0'}}>💎 UPGRADE TO VIP</h3>
            <p style={{fontSize: '13px'}}>Pay 1 TON to withdraw and double your earnings!</p>
            <div style={{background: '#f8f8f8', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontSize: '11px', border: '1px dashed #000'}}>
                <b>Address:</b> {APP_CONFIG.ADMIN_WALLET} <br/>
                <b>Memo:</b> {APP_CONFIG.MY_UID}
            </div>
            <button style={{...styles.btn, background: '#0ea5e9'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT TO ACTIVATE</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <p style={{fontSize: '12px', color: 'red'}}>Minimum Withdrawal: 0.1 TON</p>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={handleWithdraw}>SUBMIT REQUEST</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
            <h3>User Profile</h3>
            <p><b>User ID:</b> {APP_CONFIG.MY_UID}</p>
            <p><b>Status:</b> {isVip ? "VIP Member ⭐" : "Free Member"}</p>
            <p><b>Balance:</b> {balance.toFixed(5)} TON</p>
            <p><b>Ads Watched:</b> {adsWatched}</p>
            <hr/>
            <button style={{...styles.btn, background: '#22c55e'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>HELP & SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

// Tasks data remains the same
const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606", type: 'bot' },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD", type: 'bot' },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606", type: 'bot' },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606", type: 'bot' },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606", type: 'bot' },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606", type: 'bot' },
    { id: 'b7', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=1793453606", type: 'bot' }
];

const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews", type: 'social' },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews", type: 'social' },
    { id: 's3', name: "@cryptogold_official", link: "https://t.me/cryptogold_online_official", type: 'social' },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460", type: 'social' },
    { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel", type: 'social' },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1", type: 'social' },
    { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto", type: 'social' },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO", type: 'social' },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree", type: 'social' }
];

export default App;
