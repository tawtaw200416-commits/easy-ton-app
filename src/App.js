import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0007, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01, // Updated to 0.01
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
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
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });

  // --- Ad Verification ---
  const triggerAdsSequence = () => {
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
  };

  const checkAdStay = (seconds = 15) => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < (seconds * 1000)) { 
      alert(`Verification Failed! You must stay on Ad pages for at least ${seconds} seconds.`);
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- Actions ---
  const handleWatchAds = () => {
    if (lastAdClickTime === 0) {
      triggerAdsSequence();
      alert("Verification started. Wait 30 seconds on Ad pages.");
    } else if (checkAdStay(30)) {
        const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
        const newBal = Number((balance + reward).toFixed(5));
        setBalance(newBal);
        setAdsWatched(prev => prev + 1);
        updateDB(APP_CONFIG.MY_UID, { balance: newBal, adsWatched: adsWatched + 1 });
        alert(`Success! +${reward} TON`);
        setLastAdClickTime(0);
    }
  };

  const handleTaskAction = (t) => {
    if (completed.includes(t.id)) return alert("Already completed!");
    if (lastAdClickTime === 0) {
        triggerAdsSequence();
        alert("Wait 15 seconds on Ad pages, then click START again.");
    } else if (checkAdStay(15)) {
        window.open(t.link, '_blank');
        const newBal = Number((balance + 0.001).toFixed(5));
        const newComp = [...completed, t.id];
        setBalance(newBal);
        setCompleted(newComp);
        updateDB(APP_CONFIG.MY_UID, { balance: newBal, completed: newComp });
        alert("Reward Success: +0.001 TON");
        setLastAdClickTime(0);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amt > balance) return alert("Insufficient balance!");
    if (lastAdClickTime === 0) {
        triggerAdsSequence();
        alert("Wait 15 seconds on Ad pages, then click WITHDRAW.");
    } else if (checkAdStay(15)) {
        const newBal = Number((balance - amt).toFixed(5));
        const newHist = [{ id: Date.now(), amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' }, ...withdrawHistory];
        setBalance(newBal);
        setWithdrawHistory(newHist);
        updateDB(APP_CONFIG.MY_UID, { balance: newBal, withdrawHistory: newHist });
        alert("Withdrawal Requested!");
        setLastAdClickTime(0);
    }
  };

  // --- Admin Logic ---
  const findUser = async () => {
    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
    const data = await res.json();
    if (data) setSearchedUser(data); else alert("User not found!");
  };

  const updateRemoteUser = async (updates) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify(updates) });
    setSearchedUser({...searchedUser, ...updates});
    alert("User Updated Successfully!");
  };

  const addCustomTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("Fill all fields");
    const taskId = 'custom_' + Date.now();
    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, { method: 'PUT', body: JSON.stringify({...adminTask, id: taskId}) });
    alert("Task Added!");
    setAdminTask({ name: '', link: '', type: 'bot' });
    fetchData();
  };

  const updateDB = async (uid, data) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${uid}.json`, { method: 'PATCH', body: JSON.stringify(data) });
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const ud = await u.json();
      const td = await t.json();
      if (ud) {
        setBalance(ud.balance || 0);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!ud.isVip);
        setCompleted(ud.completed || []);
        setWithdrawHistory(ud.withdrawHistory || []);
        setReferrals(ud.referrals ? Object.values(ud.referrals) : []);
        setAdsWatched(ud.adsWatched || 0);
      }
      if (td) setCustomTasks(Object.values(td));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '25px', marginBottom: '15px', color: '#fff' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    copyBtn: { background: '#eee', border: '1px solid #000', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', marginLeft: '5px', cursor: 'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>{isVip ? "⭐ VIP MEMBER" : "FREE ACCOUNT"}</small>
        <h1 style={{fontSize: '34px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Active Balance</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin:'0 0 10px 0'}}>Watch & Earn {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAds}>WATCH ADS (30s)</button>
          </div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>
          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...fixedBotTasks, ...fixedSocialTasks, ...customTasks].filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', border:'none', padding: '6px 12px', borderRadius: '6px'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>Invite Friends</h2>
          <div style={{textAlign:'center', padding:'20px', background:'#f9f9f9', borderRadius:'15px', border:'1px dashed #000', marginBottom:'15px'}}>
            <p style={{margin:0}}>Your Reward: <b>0.01 TON</b></p>
            <p style={{fontSize:'12px', opacity:0.7}}>Per active referral</p>
          </div>
          <p style={{fontSize:'12px'}}>Your Referral Link:</p>
          <div style={{background:'#eee', padding:'10px', borderRadius:'10px', fontSize:'11px', wordBreak:'break-all', marginBottom:'10px'}}>
            https://t.me/EasyTonFreeBot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={styles.btn} onClick={() => copyToClipboard(`https://t.me/EasyTonFreeBot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          <p style={{marginTop:'15px', textAlign:'center'}}>Total Referrals: {referrals.length}</p>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9', marginTop:0}}>💎 Upgrade to VIP</h3>
            <p style={{fontSize:'13px'}}>Pay 1 TON to withdraw instantly and double your rewards!</p>
            <div style={{fontSize:'11px', background:'#f0f9ff', padding:'10px', borderRadius:'10px'}}>
              <p>Address: {APP_CONFIG.ADMIN_WALLET} <button style={styles.copyBtn} onClick={()=>copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>Copy</button></p>
              <p>Memo: {APP_CONFIG.MY_UID} <button style={styles.copyBtn} onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)}>Copy</button></p>
            </div>
            <button style={{...styles.btn, background: '#0ea5e9', marginTop:'10px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>VERIFY PAYMENT</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Account: <b>{isVip ? "⭐ VIP" : "Free"}</b></p>
          <p>Total Ads: <b>{adsWatched}</b></p>
          <button style={{...styles.btn, background:'#555'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
          <h4 style={{marginTop:'20px'}}>Withdrawal History</h4>
          {withdrawHistory.length === 0 ? <p style={{fontSize:'12px', opacity:0.5}}>No history yet.</p> : 
            withdrawHistory.map((h, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:'12px'}}>
                <span>{h.amount} TON</span>
                <span style={{color: h.status === 'Pending' ? 'orange' : 'green', fontWeight:'bold'}}>{h.status}</span>
              </div>
            ))
          }
        </div>
      )}

      {activeNav === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>Admin Panel</h3>
          <div style={{border:'1px solid #000', padding:'10px', borderRadius:'10px', marginBottom:'15px'}}>
            <h4>User Manager</h4>
            <input style={styles.input} placeholder="User UID" onChange={e => setSearchUserId(e.target.value)} />
            <button style={styles.btn} onClick={findUser}>FIND USER</button>
            {searchedUser && (
              <div style={{marginTop:'10px', fontSize:'13px', background:'#f9f9f9', padding:'10px'}}>
                <p>Balance: {searchedUser.balance}</p>
                <button onClick={()=>updateRemoteUser({isVip: true})}>GIVE VIP</button>
                <input style={styles.input} placeholder="New Balance" id="new_bal" />
                <button onClick={()=>updateRemoteUser({balance: Number(document.getElementById('new_bal').value)})}>SET BALANCE</button>
                <button style={{background:'green', color:'#fff', width:'100%', marginTop:'5px'}} onClick={()=>updateRemoteUser({withdrawHistory: searchedUser.withdrawHistory?.map(h=>({...h, status:'Success'}))})}>APPROVE ALL WITHDRAWS</button>
              </div>
            )}
          </div>
          <div style={{border:'1px solid #000', padding:'10px', borderRadius:'10px'}}>
            <h4>Add New Task</h4>
            <input style={styles.input} placeholder="Name" value={adminTask.name} onChange={e=>setAdminTask({...adminTask, name: e.target.value})} />
            <input style={styles.input} placeholder="Link" value={adminTask.link} onChange={e=>setAdminTask({...adminTask, link: e.target.value})} />
            <select style={styles.input} onChange={e=>setAdminTask({...adminTask, type: e.target.value})}>
              <option value="bot">BOT</option>
              <option value="social">SOCIAL</option>
            </select>
            <button style={{...styles.btn, background:'purple'}} onClick={addCustomTask}>ADD TASK</button>
          </div>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile', 'admin'].map(n => (
          (n !== 'admin' || APP_CONFIG.MY_UID === "1793453606") && 
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

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
