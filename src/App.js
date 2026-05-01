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
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  // Default Ad Links
  ADSTERRA_DEFAULT: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(() => VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []; } catch { return []; }
  });
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Admin States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 
  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // New Link States for Admin
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [newAdUrl, setNewAdUrl] = useState('');

  // Logic to trigger Ads (Advertica + Adsterra)
  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 

    // Open Adsterra from DB or Default if DB is empty
    setTimeout(() => {
      const targetUrl = adsterraLinks.length > 0 
        ? adsterraLinks[Math.floor(Math.random() * adsterraLinks.length)].url 
        : APP_CONFIG.ADSTERRA_DEFAULT;
      window.open(targetUrl, '_blank');
    }, 2000); // Reduced delay to 2s for smoother experience
  }, [adsterraLinks]);

  const checkAdStay = (sec = 7) => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < (sec * 1000)) {
      alert(`Verification Required! Please wait ${sec} seconds on the ad pages.`);
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`)
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
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      }
      if (adsData) {
        setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
      }
    } catch (e) { console.error("Network sync issues."); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const itv = setInterval(fetchData, 20000); 
    return () => clearInterval(itv);
  }, [fetchData]);

  // Video Reward Processing
  const handleWatchAds = () => {
    if (!checkAdStay(30)) return; // Video requires 30s stay verification

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
          const newBal = Number((balance + reward).toFixed(5));
          const newCount = adsWatched + 1;
          setBalance(newBal);
          setAdsWatched(newCount);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, adsWatched: newCount })
          });
          alert(`Reward Success: +${reward} TON`);
          setLastAdClickTime(0);
        }
      });
    } else {
      alert("Provider loading... try again in a few seconds.");
    }
  };

  const handleTaskReward = (id, link) => {
    if (completed.includes(id)) return alert("Task already finished.");
    if (!checkAdStay(7)) return;

    window.open(link, '_blank');
    const reward = 0.001;
    const newBal = Number((balance + reward).toFixed(5));
    const newCompleted = [...completed, id];
    setBalance(newBal);
    setCompleted(newCompleted);
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, completed: newCompleted })
    });
    alert(`Success: +${reward} TON`);
    setLastAdClickTime(0);
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < 0.1) return alert("Minimum withdrawal is 0.1 TON");
    if (amt > balance) return alert("Insufficient balance.");
    if (!checkAdStay(10)) return;

    const newBal = Number((balance - amt).toFixed(5));
    const entry = { amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' };
    const newHistory = [entry, ...withdrawHistory];
    setBalance(newBal);
    setWithdrawHistory(newHistory);
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
    });
    alert("Withdrawal request submitted!");
    setLastAdClickTime(0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
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
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video Reward</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAds}>OPEN VIDEO AD</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize:'11px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...fixedBotTasks, ...fixedSocialTasks, ...customTasks].filter(t => (t.type || 'bot') === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold', fontSize:'14px'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none', fontSize:'12px' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => alert("Verification started, click again in 7s.")}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div style={{fontSize:'12px'}}>
                <h4>Admin Panel</h4>
                <input style={styles.input} placeholder="Search User UID" value={searchUserId} onChange={e=>setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                   const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                   const data = await res.json();
                   if(data) setSearchedUser(data); else alert("Not found");
                }}>FIND USER</button>
                {searchedUser && (
                  <div style={{padding:10, background:'#eee', borderRadius:10, marginTop:10}}>
                    <p>Balance: {searchedUser.balance}</p>
                    <input style={styles.input} type="number" placeholder="New Balance" onChange={e=>setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={() => {
                        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                        alert("Success");
                    }}>SET BALANCE</button>
                  </div>
                )}
                <hr/>
                <input style={styles.input} placeholder="Task Name" onChange={e=>setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" onChange={e=>setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background:'blue'}} onClick={()=>{
                  const id = 't_'+Date.now();
                  fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, {method:'PUT', body: JSON.stringify({id, name: adminTaskName, link: adminTaskLink, type:'bot'})});
                  alert("Task Added");
                }}>ADD BOT TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Refer & Earn</h3>
          <p>Get rewards per friend join.</p>
          <div style={{background:'#f0f0f0', padding:10, borderRadius:8, wordBreak:'break-all', marginBottom:10, fontSize:12}}>
            https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={styles.btn} onClick={()=>copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9'}}>💎 UPGRADE VIP</h3>
            <p style={{fontSize:'12px'}}>Address: {APP_CONFIG.ADMIN_WALLET}</p>
            <button style={{...styles.btn, background:'#0ea5e9', marginBottom:5}} onClick={()=>copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>COPY ADDRESS</button>
            <p style={{fontSize:'12px'}}>Memo: {APP_CONFIG.MY_UID}</p>
            <button style={{...styles.btn, background:'#0ea5e9'}} onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)}>COPY MEMO</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw (Min: 0.1)</h3>
            <input style={styles.input} placeholder="Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={handleWithdraw}>SUBMIT REQUEST</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Account</h3>
          <p>ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Status: {isVip ? "VIP Member ⭐" : "Standard"}</p>
          <button style={{...styles.btn, background:'#ef4444', marginTop:20}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

// Fixed Tasks
const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" }
];
const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
];

export default App;
