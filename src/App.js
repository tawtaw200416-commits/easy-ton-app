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
  REFER_REWARD: 0.01,
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [usedCodes, setUsedCodes] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
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
  const [searchUid, setSearchUid] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalInput, setNewBalInput] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [adminPromoCode, setAdminPromoCode] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const updateDB = async (uid, data) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${uid}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
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
        setBalance(userData.balance ?? 0);
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setAdsWatched(userData.adsWatched || 0);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setUsedCodes(userData.usedCodes || []);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const itv = setInterval(fetchData, 30000);
    return () => clearInterval(itv);
  }, [fetchData]);

  useEffect(() => {
    localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, balance.toString());
    localStorage.setItem(`ads_watched_${APP_CONFIG.MY_UID}`, adsWatched.toString());
    localStorage.setItem(`comp_tasks_${APP_CONFIG.MY_UID}`, JSON.stringify(completed));
  }, [balance, adsWatched, completed]);

  const triggerAds = () => {
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now());
  };

  const checkAdStay = (sec) => {
    if (lastAdClickTime === 0 || (Date.now() - lastAdClickTime) < (sec * 1000)) {
      alert(`Stay on Ads for ${sec} seconds first!`);
      triggerAds();
      return false;
    }
    return true;
  };

  const handleWatchAds = () => {
    if (checkAdStay(30)) {
      const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
      const nb = Number((balance + reward).toFixed(5));
      const nc = adsWatched + 1;
      setBalance(nb);
      setAdsWatched(nc);
      updateDB(APP_CONFIG.MY_UID, { balance: nb, adsWatched: nc });
      alert("Success! Reward Added.");
      setLastAdClickTime(0);
    }
  };

  const handleTaskAction = (t) => {
    if (completed.includes(t.id)) return alert("Already done!");
    if (checkAdStay(10)) {
      window.open(t.link, '_blank');
      const nb = Number((balance + 0.001).toFixed(5));
      const nc = [...completed, t.id];
      setBalance(nb);
      setCompleted(nc);
      updateDB(APP_CONFIG.MY_UID, { balance: nb, completed: nc });
      alert("Task Reward Success!");
      setLastAdClickTime(0);
    }
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert("Min withdraw is 0.1 TON");
    if (amt > balance) return alert("Not enough balance!");
    if (checkAdStay(15)) {
      const nb = Number((balance - amt).toFixed(5));
      const nh = [{ amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' }, ...withdrawHistory];
      setBalance(nb);
      setWithdrawHistory(nh);
      updateDB(APP_CONFIG.MY_UID, { balance: nb, withdrawHistory: nh });
      alert("Request Submitted!");
      setLastAdClickTime(0);
    }
  };

  // Admin Functions
  const adminSearchUser = async () => {
    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUid}.json`);
    const data = await res.json();
    if (data) setSearchedUser(data); else alert("User not found!");
  };

  const adminUpdateBalance = async () => {
    if (!searchedUser) return;
    await updateDB(searchUid, { balance: Number(newBalInput) });
    alert("Balance Updated!");
  };

  const adminGiveVip = async () => {
    await updateDB(searchUid, { isVip: true });
    alert("VIP Granted!");
  };

  const adminAddTask = async () => {
    const id = "c" + Date.now();
    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify({ ...newTask, id })
    });
    alert("Task Added!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '25px', color: '#fff', border: '3px solid #fff', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', border: '2px solid #000', boxShadow: '4px 4px 0px #000', marginBottom: '10px' },
    btn: { width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer', marginBottom:'5px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>{isVip ? "⭐ VIP MEMBER" : "FREE MEMBER"}</small>
        <h1 style={{fontSize: '35px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Total Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
            <p>Video Reward: {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
            <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAds}>WATCH ADS (30s)</button>
          </div>

          <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
            {['BOT', 'SOCIAL', 'PROMO', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{flex:1, padding:'10px', borderRadius:'10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', fontSize:'10px'}}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...fixedBotTasks, ...fixedSocialTasks, ...customTasks].filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <span style={{fontSize:'14px', fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{background: completed.includes(t.id) ? '#ccc' : '#000', color:'#fff', padding:'5px 10px', borderRadius:'8px', border:'none'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'promo' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e=>setRewardCodeInput(e.target.value)} />
                <button style={styles.btn}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>User Search</h4>
                <input style={styles.input} placeholder="Enter User UID" onChange={e=>setSearchUid(e.target.value)} />
                <button style={styles.btn} onClick={adminSearchUser}>SEARCH USER</button>
                {searchedUser && (
                  <div style={{background:'#eee', padding:'10px', borderRadius:'10px'}}>
                    <p>Balance: {searchedUser.balance}</p>
                    <input style={styles.input} placeholder="New Balance" onChange={e=>setNewBalInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={adminUpdateBalance}>UPDATE BALANCE</button>
                    <button style={{...styles.btn, background:'blue'}} onClick={adminGiveVip}>GIVE VIP ⭐</button>
                  </div>
                )}
                <hr/>
                <h4>Add Global Task</h4>
                <input style={styles.input} placeholder="Task Name" onChange={e=>setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" onChange={e=>setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} onChange={e=>setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background:'purple'}} onClick={adminAddTask}>ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Reward: <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend.</p>
          <div style={{background:'#f0f0f0', padding:'15px', borderRadius:'10px', wordBreak:'break-all', marginBottom:'10px', fontSize:'13px'}}>
            https://t.me/EasyTonFreeBot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={styles.btn} onClick={() => copyToClipboard(`https://t.me/EasyTonFreeBot?start=${APP_CONFIG.MY_UID}`)}>COPY INVITE LINK</button>
          <p style={{marginTop:'15px'}}>Referrals: {referrals.length}</p>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color:'#0ea5e9', margin:'0 0 10px 0'}}>💎 VIP UPGRADE</h3>
            <p style={{fontSize:'13px'}}>Pay 1 TON to withdraw and get double rewards.</p>
            <div style={{background:'#f9f9f9', padding:'10px', borderRadius:'8px', fontSize:'11px', border:'1px dashed #000', marginBottom:'10px'}}>
              <b>Address:</b> {APP_CONFIG.ADMIN_WALLET} <button onClick={()=>copyToClipboard(APP_CONFIG.ADMIN_WALLET)} style={{padding:'2px 5px', fontSize:'10px'}}>Copy</button><br/>
              <b>Memo:</b> {APP_CONFIG.MY_UID} <button onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)} style={{padding:'2px 5px', fontSize:'10px'}}>Copy</button>
            </div>
            <button style={{...styles.btn, background:'#0ea5e9'}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw</h3>
            <p style={{fontSize:'12px', color:'red'}}>Min: 0.1 TON | Current: {balance.toFixed(5)}</p>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e=>setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={handleWithdraw}>SUBMIT WITHDRAW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>My Profile</h3>
          <p><b>User ID:</b> {APP_CONFIG.MY_UID}</p>
          <p><b>Balance:</b> {balance.toFixed(5)} TON</p>
          <p><b>Status:</b> {isVip ? "VIP Member ⭐" : "Free Member"}</p>
          <p><b>Ads Watched:</b> {adsWatched}</p>
          <hr/>
          <button style={{...styles.btn, background:'#22c55e'}} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>HELP CENTER</button>
        </div>
      )}

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

const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606", type: 'bot' },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD", type: 'bot' },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606", type: 'bot' },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606", type: 'bot' },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606", type: 'bot' }
];

const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews", type: 'social' },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree", type: 'social' }
];

export default App;
