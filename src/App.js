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

  const triggerAds = useCallback(() => {
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
    } catch (e) { console.error("Sync Error"); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Task Action Flow: Telegram first -> Then Ads
  const startTask = (link) => {
    window.open(link, '_blank');
    setTimeout(() => triggerAds(), 2000);
  };

  const processReward = async (id, amt) => {
    const elapsed = (Date.now() - lastAdClickTime) / 1000;
    if (lastAdClickTime === 0 || elapsed < 15) {
      alert("Please stay 15s on ads first!");
      triggerAds();
      return;
    }

    const newBal = Number((balance + amt).toFixed(5));
    const newComp = [...completed, id];
    setBalance(newBal);
    setCompleted(newComp);
    localStorage.setItem('saved_bal', newBal);
    localStorage.setItem('saved_comp', JSON.stringify(newComp));

    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify({ balance: newBal, completedTasks: newComp })
    });
    alert(`Success! +${amt} TON.`);
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
    smBtn: { padding: '8px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor:'pointer' },
    listRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '11px solid #eee', fontSize: '13px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>AVAILABLE BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:'bold'}}>VIP ⭐</span>}
        <button style={{...styles.btn, background: '#facc15', color: '#000', marginTop: 10}} 
          onClick={() => { triggerAds(); setTimeout(() => processReward('watch_ad', isVip ? 0.0008 : 0.0004), 2000); }}>
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
            {(activeTab === 'bot' || activeTab === 'social') && (activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks).map(t => (
              <div key={t.id} style={styles.listRow}>
                <span style={{opacity: completed.includes(t.id) ? 0.5 : 1}}>{t.name}</span>
                {!completed.includes(t.id) ? (
                  <div style={{display:'flex', gap: 5}}>
                    <button onClick={() => startTask(t.link)} style={styles.smBtn}>{activeTab === 'bot' ? 'START' : 'JOIN'}</button>
                    <button onClick={() => processReward(t.id, 0.001)} style={{...styles.smBtn, background: '#22c55e'}}>CLAIM</button>
                  </div>
                ) : <span style={{color: 'green', fontWeight:'bold'}}>DONE ✅</span>}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h3 style={{marginTop:0}}>Admin Dashboard</h3>
                <input style={styles.input} placeholder="User ID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  setSearchedUser(data);
                  if(data) setNewBalanceInput(data.balance); else alert("User Not Found");
                }}>Find User</button>
                {searchedUser && (
                  <div style={{marginTop: 15, padding: 10, background: '#f9f9f9', borderRadius: 10, border: '1px solid #000'}}>
                    <p>Current: {searchedUser.balance} TON | Status: {searchedUser.isVip ? "VIP" : "Normal"}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <div style={{display:'flex', gap: 5}}>
                      <button style={{...styles.smBtn, flex:1}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                        alert("Balance Updated!"); fetchData();
                      }}>Update</button>
                      <button style={{...styles.smBtn, flex:1, background: 'orange'}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({isVip: !searchedUser.isVip})});
                        alert("VIP Status Changed!"); fetchData();
                      }}>VIP Toggle</button>
                    </div>
                  </div>
                )}
                <h4 style={{marginTop: 20, borderBottom: '1px solid #000'}}>Tasks Manage</h4>
                {customTasks.map(ct => (
                  <div key={ct.firebaseKey} style={styles.listRow}>
                    <span>{ct.name}</span>
                    <button style={{color: 'red', fontWeight: 'bold', border: 'none', background: 'none'}} onClick={async () => {
                      if(window.confirm("Delete this task?")) {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${ct.firebaseKey}.json`, {method: 'DELETE'});
                        fetchData();
                      }
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
          <p>Get <b>{APP_CONFIG.REFER_REWARD} TON</b> per friend!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          
          <h4 style={{marginTop: 25, borderBottom: '1px solid #000'}}>Referral History</h4>
          <div style={{maxHeight: 200, overflowY: 'auto'}}>
            {referrals.length > 0 ? referrals.map((r, i) => (
              <div key={i} style={styles.listRow}>
                <span>Friend: {r.id || "Active User"}</span>
                <span style={{color: 'green', fontWeight:'bold'}}>+0.01 TON Success</span>
              </div>
            )) : <p style={{textAlign: 'center', fontSize: 12, opacity: 0.6}}>No referrals yet</p>}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw History</h3>
          <div style={{maxHeight: 180, overflowY: 'auto', marginBottom: 15, borderBottom: '1px solid #eee'}}>
            {withdrawHistory.length > 0 ? withdrawHistory.map((w, i) => (
              <div key={i} style={styles.listRow}>
                <span><b>{w.amount} TON</b></span>
                <span style={{color: w.status === 'Success' ? 'green' : 'orange', fontWeight:'bold'}}>{w.status}</span>
                <span style={{fontSize: 10, opacity: 0.6}}>{w.date}</span>
              </div>
            )) : <p style={{textAlign: 'center', fontSize: 12}}>No history yet</p>}
          </div>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
            const amt = Number(withdrawAmount);
            if(amt < 0.1 || amt > balance) return alert("Invalid amount!");
            const newH = [{amount: amt, status: 'Pending', date: new Date().toLocaleString()}, ...withdrawHistory];
            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
              method: 'PATCH', body: JSON.stringify({balance: Number((balance - amt).toFixed(5)), withdrawHistory: newH})
            });
            alert("Withdraw Request Sent!"); setWithdrawAmount(''); fetchData();
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <p>UID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Status: {isVip ? "VIP Membership ⭐" : "Standard"}</p>
          <button style={{...styles.btn, background: '#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
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
