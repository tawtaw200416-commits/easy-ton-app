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
  REFER_REWARD: 0.01, // 1 refer = 0.01 TON
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [usedCodes, setUsedCodes] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
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
  const [editBalance, setEditBalance] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [adminPromoCode, setAdminPromoCode] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

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
        setUsedCodes(ud.usedCodes || []);
        setWithdrawHistory(ud.withdrawHistory || []);
        setReferrals(ud.referrals ? Object.values(ud.referrals) : []);
        setAdsWatched(ud.adsWatched || 0);
      }
      if (td) setCustomTasks(Object.keys(td).map(k => ({ ...td[k], firebaseKey: k })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateDB = async (uid, data) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${uid}.json`, { method: 'PATCH', body: JSON.stringify(data) });
  };

  const handleWatchAds = () => {
    if (checkAdStay(30)) {
      const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
      const newBal = Number((balance + reward).toFixed(5));
      setBalance(newBal);
      setAdsWatched(prev => prev + 1);
      updateDB(APP_CONFIG.MY_UID, { balance: newBal, adsWatched: adsWatched + 1 });
      alert("Reward Added!");
      setLastAdClickTime(0);
    }
  };

  const handleTaskAction = (t) => {
    if (completed.includes(t.id)) return alert("Already Done!");
    if (checkAdStay(9)) {
        window.open(t.link, '_blank');
        const newBal = Number((balance + 0.001).toFixed(5));
        const newComp = [...completed, t.id];
        setBalance(newBal);
        setCompleted(newComp);
        updateDB(APP_CONFIG.MY_UID, { balance: newBal, completed: newComp });
        alert("Success +0.001 TON");
        setLastAdClickTime(0);
    }
  };

  // Admin Actions
  const findUser = async () => {
    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUid}.json`);
    const data = await res.json();
    if (data) setSearchedUser(data); else alert("User not found");
  };

  const saveNewTask = async () => {
    const id = "task_" + Date.now();
    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({...newTask, id}) });
    alert("New Task Added!");
    fetchData();
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', marginBottom: '15px', border: '2px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer', marginBottom: '5px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '2px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>{isVip ? "⭐ VIP MEMBER" : "FREE MEMBER"}</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
             <p style={{textAlign:'center', fontWeight:'bold'}}>Reward: {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAds}>WATCH VIDEO (30s)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...fixedBotTasks, ...fixedSocialTasks, ...customTasks].filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4 style={{marginTop:0}}>Search & Manage User</h4>
                <input style={styles.input} placeholder="User UID" onChange={e=>setSearchUid(e.target.value)} />
                <button style={styles.btn} onClick={findUser}>Search</button>
                {searchedUser && (
                    <div style={{background:'#f9f9f9', padding:'10px', borderRadius:'10px', border:'1px solid #ddd'}}>
                        <p>Bal: {searchedUser.balance}</p>
                        <input style={styles.input} placeholder="New Balance" onChange={e=>setEditBalance(e.target.value)} />
                        <button style={{...styles.btn, background:'green'}} onClick={()=>updateDB(searchUid, {balance: Number(editBalance)})}>Update Balance</button>
                        <button style={{...styles.btn, background:'blue'}} onClick={()=>updateDB(searchUid, {isVip: true})}>Give VIP ⭐</button>
                        <button style={{...styles.btn, background:'purple'}} onClick={()=>updateDB(searchUid, {withdrawHistory: searchedUser.withdrawHistory?.map(h=>({...h, status:'Success'}))})}>Set All Withdraw Success</button>
                    </div>
                )}
                <hr/>
                <h4>Add Global Task</h4>
                <input style={styles.input} placeholder="Task Name" onChange={e=>setNewTask({...newTask, name:e.target.value})} />
                <input style={styles.input} placeholder="Link" onChange={e=>setNewTask({...newTask, link:e.target.value})} />
                <select style={styles.input} onChange={e=>setNewTask({...newTask, type: e.target.value})}>
                    <option value="bot">Bot</option>
                    <option value="social">Social</option>
                </select>
                <button style={styles.btn} onClick={saveNewTask}>Save Global Task</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
            <h3>Invite & Earn</h3>
            <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> for every friend you invite!</p>
            <div style={{background:'#f0f0f0', padding:'10px', borderRadius:'10px', wordBreak:'break-all', marginBottom:'10px'}}>
                https://t.me/EasyTonFreeBot?start={APP_CONFIG.MY_UID}
            </div>
            <button style={styles.btn} onClick={()=>copyToClipboard(`https://t.me/EasyTonFreeBot?start=${APP_CONFIG.MY_UID}`)}>COPY REFERRAL LINK</button>
            <p style={{marginTop:'15px'}}>Total Referrals: {referrals.length}</p>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9', marginTop:0}}>💎 UPGRADE TO VIP</h3>
            <p style={{fontSize: '14px'}}>Pay 1 TON to unlock withdrawals and double rewards.</p>
            <p style={{fontSize: '12px', marginBottom:'5px'}}>Address: {APP_CONFIG.ADMIN_WALLET}</p>
            <button style={{...styles.btn, background:'#eee', color:'#000', fontSize:'12px'}} onClick={()=>copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>COPY ADDRESS</button>
            <p style={{fontSize: '12px', marginBottom:'5px'}}>Memo: {APP_CONFIG.MY_UID}</p>
            <button style={{...styles.btn, background:'#eee', color:'#000', fontSize:'12px'}} onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)}>COPY MEMO</button>
            <button style={{...styles.btn, background: '#0ea5e9', marginTop:'10px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SEND RECEIPT TO SUPPORT</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Address" value={withdrawAddress} onChange={e=>setWithdrawAddress(e.target.value)} />
            <button style={styles.btn}>SUBMIT WITHDRAW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
            <h3 style={{marginTop:0}}>My Account</h3>
            <p><b>User ID:</b> {APP_CONFIG.MY_UID}</p>
            <p><b>Balance:</b> {balance.toFixed(5)} TON</p>
            <p><b>Status:</b> {isVip ? "VIP ⭐" : "Free Member"}</p>
            <p><b>Ads Watched:</b> {adsWatched}</p>
            <p><b>Total Referrals:</b> {referrals.length}</p>
            <hr/>
            <button style={styles.btn} onClick={()=>window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
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
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606", type: 'bot' },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606", type: 'bot' },
    { id: 'b7', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=1793453606", type: 'bot' }
];

const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews", type: 'social' },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews", type: 'social' },
    { id: 's3', name: "@cryptogold_official", link: "https://t.me/cryptogold_online_official", type: 'social' },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree", type: 'social' }
];

export default App;
