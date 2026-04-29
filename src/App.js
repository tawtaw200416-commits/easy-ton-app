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
  REFER_REWARD: 0.001,
  // --- External Ad Links ---
  ADSTERRA_LINK: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTIC_LINK: "https://data527.click/a674e1237b7e268eb5f6/8d02b7e071/?placementName=default"
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

  // --- External Ads Logic ---
  const [isWatchingExternalAd, setIsWatchingExternalAd] = useState(false);
  const [adTimer, setAdTimer] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);

  // Admin Search/Edit States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [currentAdsBlockId, setCurrentAdsBlockId] = useState("27611");
  const [newAdsBlockIdInput, setNewAdsBlockIdInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // 9 Seconds Timer Effect
  useEffect(() => {
    let interval;
    if (isWatchingExternalAd && adTimer > 0) {
      interval = setInterval(() => setAdTimer(prev => prev - 1), 1000);
    } else if (adTimer === 0 && isWatchingExternalAd) {
      setIsWatchingExternalAd(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
    return () => clearInterval(interval);
  }, [isWatchingExternalAd, adTimer, pendingAction]);

  // Ad Function to wrap actions
  const showAdAndDo = (callback) => {
    // skip ads if in Admin tab or is owner
    if (activeTab === 'admin' && activeNav === 'earn') {
      callback();
      return;
    }

    const adUrl = Math.random() > 0.5 ? APP_CONFIG.ADSTERRA_LINK : APP_CONFIG.ADVERTIC_LINK;
    tg?.openLink ? tg.openLink(adUrl) : window.open(adUrl, '_blank');
    
    setPendingAction(() => callback);
    setAdTimer(9);
    setIsWatchingExternalAd(true);
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/settings/ads_config.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      if (adsData?.blockId) setCurrentAdsBlockId(adsData.blockId);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // Reward Processing (Original Logic)
  const completeReward = (id, rewardAmount) => {
    const finalReward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    const isWatchAd = id === 'watch_ad';

    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
    const newCompleted = !isWatchAd ? [...completed, id] : completed;

    setBalance(newBal);
    if (isWatchAd) setAdsWatched(newAdsCount);
    if (!isWatchAd) setCompleted(newCompleted);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
    });
    alert(`Success! +${finalReward} TON`);
  };

  // Adsgram (Specific for Watch Video Button)
  const handleAdsgram = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: currentAdsBlockId });
      AdController.show().then((result) => { if (result.done) completeReward('watch_ad', 0); });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    showAdAndDo(() => {
      if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
      completeReward(id, reward);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000, textAlign: 'center', padding: '20px' }
  };

  const allBotTasks = [{ id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" }, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [{ id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" }, ...customTasks.filter(t => t.type === 'social')];

  return (
    <div style={styles.main}>
      {/* 9 Seconds Ad Overlay */}
      {isWatchingExternalAd && (
        <div style={styles.overlay}>
          <h2 style={{color: '#facc15'}}>ADVERTISING</h2>
          <p>Please wait <b>{adTimer}s</b> for verification...</p>
          <p style={{fontSize: '12px', opacity: 0.7}}>You must stay on this screen to receive TON.</p>
          <div style={{width: '80%', height: '10px', background: '#333', borderRadius: '5px', marginTop: '20px', overflow: 'hidden'}}>
             <div style={{width: `${(9-adTimer)*11.1}%`, height: '100%', background: '#facc15', transition: 'width 1s linear'}}></div>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched} {isVip && "⭐ VIP"}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video Button (Adsgram)</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleAdsgram}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
                <div>
                   <h4>Admin Control (No Ads)</h4>
                   <p>Update Balance / Search User / Tasks</p>
                   {/* Rest of Admin logic here as per original */}
                </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
           <h3>Withdraw TON</h3>
           <p style={{fontSize: '12px'}}>Watch a verification ad to unlock withdraw button.</p>
           <button style={styles.btn} onClick={() => showAdAndDo(() => alert("Withdraw Form Unlocked!"))}>
             PROCESS WITHDRAW (9s AD)
           </button>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
            <h3>Referral Link</h3>
            <button style={styles.btn} onClick={() => showAdAndDo(() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); })}>
                COPY INVITE LINK
            </button>
        </div>
      )}

      {/* Profile Section */}
      {activeNav === 'profile' && (
          <div style={styles.card}>
              <h3>My Profile</h3>
              <p>User ID: {APP_CONFIG.MY_UID}</p>
              <button style={styles.btn} onClick={() => showAdAndDo(() => fetchData())}>REFRESH DATA</button>
          </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => showAdAndDo(() => setActiveNav(n))} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
