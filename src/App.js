import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // States for Admin/Forms
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  // Dual Ad Trigger: Advertica + Adsterra
  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
    setTimeout(() => {
      if (adsterraLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
        window.open(adsterraLinks[randomIndex].url, '_blank');
      }
    }, 1500); 
  }, [adsterraLinks]);

  // Stay verification (9 seconds)
  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 9000) {
      alert("Please stay 9s on the ad page to verify!");
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const handleNavClick = (nav) => {
    if (!checkAdStay()) return;
    triggerAdsSequence();
    setActiveNav(nav);
  };

  const handleTabClick = (tab) => {
    if (!checkAdStay()) return;
    triggerAdsSequence();
    setActiveTab(tab);
  };

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [u, t, a, p] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();
      const promoData = await p.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(k => ({ id: k, url: adsData[k].url })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    } catch (e) { console.warn("Sync failed"); }
    finally { setIsSyncing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = async (id, amt) => {
    if (!checkAdStay()) return;
    
    let rewardValue = amt;
    if (id === 'watch_ad') {
      rewardValue = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    }

    const newBal = Number((balance + rewardValue).toFixed(5));
    setBalance(newBal);
    localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, newBal);

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify({ balance: newBal })
    });
    
    alert(`Success! +${rewardValue} TON`);
    setLastAdClickTime(0); // Reset timer after reward
    fetchData();
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    watchBtn: { background: '#facc15', color: '#000', width: '100%', padding: '10px', borderRadius: '12px', fontWeight: 'bold', border: 'none', marginTop: '10px' },
    adminBtn: { padding: '8px 12px', background: '#000', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight:'bold' },
    input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>{isSyncing ? "SYNCING..." : "TOTAL BALANCE"}</small>
        <h1 style={{fontSize: '40px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <div style={{fontSize: 12, color: '#facc15', fontWeight: 'bold'}}>VIP MEMBER ⭐</div>}
        
        {/* Watch Ad Button Next to Balance */}
        <button style={styles.watchBtn} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>
          WATCH ADS ({isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON)
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleTabClick(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '2px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => { triggerAdsSequence(); window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000)}} style={styles.adminBtn}>START</button>
              </div>
            ))}
            {activeTab === 'social' && [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => { triggerAdsSequence(); window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000)}} style={styles.adminBtn}>JOIN</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) { triggerAdsSequence(); setTimeout(() => processReward('promo', found.reward), 1000); } else alert("Invalid Code");
                }}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>Admin Panel</h4>
                <input style={styles.input} placeholder="Search User UID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  setSearchedUser(data); setNewBalanceInput(data?.balance || 0);
                }}>Search User</button>
                {searchedUser && (
                  <div style={{marginTop:15, padding:10, background:'#f3f4f6', borderRadius:10}}>
                    <p>Current: {searchedUser.balance} TON</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.adminBtn, width:'100%', marginBottom:5}} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Success!"); fetchData();
                    }}>Update Balance</button>
                    <button style={{...styles.adminBtn, width:'100%', background:'blue'}} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({isVip: !searchedUser.isVip})});
                      alert("VIP Status Changed!"); fetchData();
                    }}>Toggle VIP Status</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Refer & Earn</h3>
          <p style={{background: '#fef08a', padding: 15, borderRadius: 10, border: '2px dashed #000'}}>
            Share your link and earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!
          </p>
          <input style={{...styles.input, marginTop:20}} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => {
            navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
            alert("Copied!");
          }}>COPY LINK</button>
          <div style={{marginTop:20}}>Total Referrals: {referrals.length}</div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>VIP Membership</h3>
            <p>Send 0.5 TON to get VIP (Higher Rewards).</p>
            <div style={{fontSize:12, background:'#f9fafb', padding:10, borderRadius:10}}>
              <b>Wallet:</b> {APP_CONFIG.ADMIN_WALLET} <button onClick={() => navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET)}>Copy</button><br/>
              <b>Memo:</b> {APP_CONFIG.MY_UID} <button onClick={() => navigator.clipboard.writeText(APP_CONFIG.MY_UID)}>Copy</button>
            </div>
          </div>
          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="Amount" type="number" onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={async () => {
              if(Number(withdrawAmount) < 0.1 || Number(withdrawAmount) > balance) return alert("Invalid amount");
              triggerAdsSequence();
              const history = [{amount: withdrawAmount, status: 'Pending', date: new Date().toLocaleDateString()}, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method:'PATCH', body: JSON.stringify({balance: balance - Number(withdrawAmount), withdrawHistory: history})});
              alert("Submitted!"); fetchData();
            }}>WITHDRAW NOW</button>
          </div>
          <div style={styles.card}>
            <h4>History</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee'}}>
                <span>{h.amount} TON</span>
                <span style={{color: h.status === 'Pending' ? 'orange' : 'green'}}>{h.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>ID: {APP_CONFIG.MY_UID}</p>
          <p>Status: <b>{isVip ? "VIP MEMBER ⭐" : "STANDARD"}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <button style={{...styles.btn, background:'#ef4444', marginTop:20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT BOT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleNavClick(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
];

const fixedSocialTasks = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
];

export default App;
