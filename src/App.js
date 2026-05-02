import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  VIP_PRICE: 1.0,
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  { id: 'b3', name: "Workers On Ton", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
  { id: 'b4', name: "Easy Bonus Code", link: "https://t.me/easybonuscode_bot?start=1793453606" },
  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
];

const fixedSocialTasks = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
  { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
  { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('saved_bal')) || 0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('saved_comp')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Admin States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, p] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        localStorage.setItem('saved_bal', userData.balance);
        localStorage.setItem('saved_comp', JSON.stringify(userData.completedTasks || []));
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    } catch (e) { console.warn("Sync error"); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Task Action Flow
  const startTask = (link) => {
    window.open(link, '_blank'); // Go to TG first
    setTimeout(() => {
        triggerAdsSequence(); // Then open ads
    }, 1500);
  };

  const processReward = async (id, amt) => {
    const elapsed = (Date.now() - lastAdClickTime) / 1000;
    const timeLimit = id === 'watch_ad' ? 30 : 15;

    if (lastAdClickTime === 0 || elapsed < timeLimit) {
      alert(`Stay on the ad for ${timeLimit}s to claim!`);
      triggerAdsSequence();
      return;
    }

    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    const newComp = [...completed, id];

    setBalance(newBal);
    if (id !== 'watch_ad') {
        setCompleted(newComp);
        localStorage.setItem('saved_comp', JSON.stringify(newComp));
    }
    localStorage.setItem('saved_bal', newBal);

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify({ balance: newBal, completedTasks: id !== 'watch_ad' ? newComp : completed })
    });
    alert(`Success! +${rewardAmt} TON.`);
    setLastAdClickTime(0);
    fetchData();
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: (color) => ({ padding: '8px 12px', background: color || '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' })
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>TOTAL BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:'bold'}}>VIP ⭐</span>}
        <button style={{...styles.btn, background:'#facc15', color:'#000', marginTop: 10}} onClick={() => { triggerAdsSequence(); setTimeout(()=>processReward('watch_ad', 0), 1000); }}>
           WATCH ADS (30s)
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && (activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id) ? 0.5 : 1}}>{t.name}</span>
                {!completed.includes(t.id) ? (
                  <div style={{display:'flex', gap: 5}}>
                    <button onClick={() => startTask(t.link)} style={styles.smBtn()}>{activeTab === 'bot' ? 'START' : 'JOIN'}</button>
                    <button onClick={() => processReward(t.id, 0.001)} style={styles.smBtn('#22c55e')}>CLAIM</button>
                  </div>
                ) : <span style={{color:'green', fontWeight:'bold'}}>DONE ✅</span>}
              </div>
            ))}
            
            {activeTab === 'reward' && (
              <div>
                <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h3>Admin Panel</h3>
                <input style={{width:'100%', padding:10, marginBottom:5}} placeholder="User ID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  setSearchedUser(data);
                  if(data) setNewBalanceInput(data.balance); else alert("Not Found");
                }}>Find User</button>
                {searchedUser && (
                  <div style={{marginTop:10, padding:10, background:'#eee', borderRadius:10}}>
                    <p>Current: {searchedUser.balance} TON</p>
                    <input style={{width:'100%', padding:8, marginBottom:5}} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={styles.smBtn()} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                      alert("Updated!"); fetchData();
                    }}>Update Balance</button>
                    <button style={styles.smBtn('orange')} onClick={async () => {
                      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({isVip: !searchedUser.isVip})});
                      alert("VIP Toggled!"); fetchData();
                    }}>Toggle VIP</button>
                  </div>
                )}
                <h4 style={{marginTop:15}}>Manage Custom Tasks</h4>
                {customTasks.map(ct => (
                    <div key={ct.firebaseKey} style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}>
                        <small>{ct.name}</small>
                        <button style={{color:'red', border:'none', background:'none'}} onClick={async()=>{
                            if(window.confirm("Delete?")) await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${ct.firebaseKey}.json`, {method:'DELETE'});
                            fetchData();
                        }}>Delete</button>
                    </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
          <input style={{width:'100%', padding:10, marginBottom:10}} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          
          <h4 style={{marginTop: 20}}>Referral History ({referrals.length})</h4>
          <div style={{maxHeight: 200, overflowY: 'auto'}}>
            {referrals.map((r, i) => (
                <div key={i} style={{padding:'8px 0', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                    <small>User ID: {r.id || "Active"}</small>
                    <small style={{color:'green'}}>Success</small>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Deposit for VIP ({APP_CONFIG.VIP_PRICE} TON)</h3>
            <small>Address: <b>{APP_CONFIG.ADMIN_WALLET}</b></small><br/>
            <small>Memo (UID): <b>{APP_CONFIG.MY_UID}</b></small>
            <div style={{display:'flex', gap:5, marginTop:10}}>
                <button style={{flex:1, ...styles.smBtn()}} onClick={()=>copyText(APP_CONFIG.ADMIN_WALLET)}>Copy Address</button>
                <button style={{flex:1, ...styles.smBtn()}} onClick={()=>copyText(APP_CONFIG.MY_UID)}>Copy Memo</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <div style={{maxHeight: 150, overflowY: 'auto', marginBottom: 10}}>
                {withdrawHistory.map((h, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:12, padding:'5px 0', borderBottom:'1px solid #eee'}}>
                        <span>{h.amount} TON</span>
                        <span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status}</span>
                        <span>{h.date}</span>
                    </div>
                ))}
            </div>
            <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="Min 0.1 TON" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={{width:'100%', padding:10, marginBottom:10}} placeholder="TON Address" onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={async () => {
              const amount = Number(withdrawAmount);
              if(amount < 0.1 || amount > balance) return alert("Check balance or Min limit.");
              const h = [{ amount, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((balance - amount).toFixed(5)), withdrawHistory: h })
              });
              alert("Withdraw Requested!"); fetchData(); setWithdrawAmount('');
            }}>WITHDRAW NOW</button>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Status: {isVip ? "VIP Membership ⭐" : "Standard"}</p>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
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

export default App;
