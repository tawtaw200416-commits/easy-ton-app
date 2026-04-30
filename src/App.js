import React, { useState, useEffect, useCallback, useRef } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  // AD LINKS
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  AD_LINK_2: "https://data527.click/a674e1237b7e268eb5f6/503a052ca1/?placementName=default"
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
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminVipUserId, setAdminVipUserId] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  // --- 9s GLOBAL AD ENFORCEMENT ---
  const lastAdTime = useRef(null);
  const pendingAction = useRef(null);

  const forceAds = (callback = null) => {
    lastAdTime.current = Date.now();
    pendingAction.current = callback;
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    setTimeout(() => window.open(APP_CONFIG.AD_LINK_2, '_blank'), 500);
  };

  useEffect(() => {
    const handleCheck = () => {
      if (document.visibilityState === 'visible' && lastAdTime.current) {
        const elapsed = (Date.now() - lastAdTime.current) / 1000;
        if (elapsed < 9) {
          alert("Watch for at least 9 seconds to proceed!");
          forceAds(pendingAction.current);
        } else {
          if (pendingAction.current) {
            pendingAction.current();
            pendingAction.current = null;
          }
          lastAdTime.current = null;
        }
      }
    };
    document.addEventListener('visibilitychange', handleCheck);
    return () => document.removeEventListener('visibilitychange', handleCheck);
  }, []);

  const handleNavClick = (nav) => forceAds(() => setActiveNav(nav));
  const handleTabClick = (tab) => forceAds(() => setActiveTab(tab));

  // --- DATA SYNC ---
  const fetchData = useCallback(async () => {
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
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 30000); return () => clearInterval(i); }, [fetchData]);

  const updateRemote = (bal, comp, ads) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: bal, completed: comp, adsWatched: ads })
    });
  };

  const processReward = (id, reward) => {
    forceAds(() => {
        let finalReward = reward;
        let isWatchAd = id === 'watch_ad';
        if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
        
        const newBal = Number((balance + finalReward).toFixed(5));
        const newAds = isWatchAd ? adsWatched + 1 : adsWatched;
        const newComp = !isWatchAd ? [...completed, id] : completed;

        setBalance(newBal);
        setAdsWatched(newAds);
        setCompleted(newComp);
        updateRemote(newBal, newComp, newAds);
        alert(`+${finalReward} TON Received!`);
    });
  };

  const handleTaskAction = (t) => {
    if (completed.includes(t.id)) return alert("Already done!");
    forceAds(() => {
        tg?.openTelegramLink ? tg.openTelegramLink(t.link) : window.open(t.link, '_blank');
        setTimeout(() => processReward(t.id, 0.001), 2000);
    });
  };

  // --- TASK LISTS ---
  const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    { id: 'b7', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=1793453606" }
  ];

  const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
  ];

  const allBot = [...fixedBotTasks, ...customTasks.filter(x => x.type === 'bot')];
  const allSocial = [...fixedSocialTasks, ...customTasks.filter(x => x.type === 'social')];

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
        <small style={{color: '#facc15'}}>{isVip ? "VIP ⭐ MEMBER" : "FREE MEMBER"}</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads: {adsWatched} | UID: {APP_CONFIG.MY_UID}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p>Watch Ad (9s) = {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleTabClick(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBot.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && allSocial.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>Search User</h4>
                <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={{...styles.btn, background: '#f59e0b'}} onClick={async () => {
                    const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                    const d = await r.json();
                    if(d) { setSearchedUser(d); setNewBalanceInput(d.balance); } else alert("No User");
                }}>FIND USER</button>
                
                {searchedUser && (
                    <div style={{marginTop: 10, padding: 10, border: '1px solid #000'}}>
                        <p>Bal: {searchedUser.balance}</p>
                        <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                        <button style={styles.btn} onClick={async () => {
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                            alert("Updated");
                        }}>UPDATE BAL</button>
                    </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <button style={styles.btn} onClick={() => forceAds(() => alert("Request Submitted"))}>WITHDRAW</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleNavClick(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
