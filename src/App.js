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
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const triggerAds = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const u = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await u.json();
      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        localStorage.setItem('saved_bal', userData.balance);
        localStorage.setItem('saved_comp', JSON.stringify(userData.completedTasks || []));
      }
      const t = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
      const tasksData = await t.json();
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
    } catch (e) { console.error("Sync Error"); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Task logic: Channel Link -> Then Ads
  const handleTaskStart = (link) => {
    window.open(link, '_blank'); // Go to channel/bot link
    setTimeout(() => {
      triggerAds(); // Trigger ads after 2 seconds
    }, 2000);
  };

  const processClaim = async (id, amt) => {
    const elapsed = (Date.now() - lastAdClickTime) / 1000;
    if (lastAdClickTime === 0 || elapsed < 15) {
      alert("Please visit the ads and wait 15s to claim!");
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
    alert(`Success! Reward +${amt} TON added.`);
    setLastAdClickTime(0);
    fetchData();
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: { padding: '8px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
    historyItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '12px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <button style={{...styles.btn, background: '#facc15', color: '#000', marginTop: 10}} 
          onClick={() => { triggerAds(); setTimeout(() => processClaim('watch_ad', isVip ? 0.0008 : 0.0004), 2000); }}>
          WATCH ADS (REWARD)
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && (activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks).map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id) ? 0.5 : 1}}>{t.name}</span>
                {!completed.includes(t.id) ? (
                  <div style={{display:'flex', gap: 5}}>
                    <button onClick={() => handleTaskStart(t.link)} style={styles.smBtn}>START</button>
                    <button onClick={() => processClaim(t.id, 0.001)} style={{...styles.smBtn, background: '#22c55e'}}>CLAIM</button>
                  </div>
                ) : <span style={{color: 'green', fontSize: 11, fontWeight: 'bold'}}>COMPLETED</span>}
              </div>
            ))}

            {activeTab === 'admin' && (
              <div>
                <h4>Admin Panel</h4>
                <input style={{width:'100%', padding: 10, marginBottom: 5, borderRadius: 8}} placeholder="Search User ID" onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                  const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                  const data = await res.json();
                  setSearchedUser(data);
                  if(data) setNewBalanceInput(data.balance);
                }}>Find User</button>
                
                {searchedUser && (
                  <div style={{marginTop: 10, background: '#f8f8f8', padding: 10, borderRadius: 10}}>
                    <label>Balance:</label>
                    <input style={{width:'100%', padding: 8, margin: '5px 0'}} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <div style={{display:'flex', gap: 5}}>
                      <button style={styles.smBtn} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                        alert("Balance Updated!");
                      }}>Update</button>
                      <button style={{...styles.smBtn, background: 'orange'}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({isVip: !searchedUser.isVip})});
                        alert("VIP Status Changed!");
                      }}>Toggle VIP</button>
                    </div>
                  </div>
                )}
                <h5 style={{marginTop: 15}}>Delete Tasks</h5>
                {customTasks.map(ct => (
                  <div key={ct.firebaseKey} style={styles.historyItem}>
                    <span>{ct.name}</span>
                    <button style={{color:'red', border:'none', background:'none'}} onClick={async () => {
                      if(window.confirm("Delete this?")) {
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
          <h3>Refer & Earn</h3>
          <p style={{fontSize: 12}}>Link: <b>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</b></p>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY LINK</button>
          
          <h4 style={{marginTop: 20}}>Referral History ({referrals.length})</h4>
          <div style={{maxHeight: 180, overflowY: 'auto'}}>
            {referrals.map((r, i) => (
              <div key={i} style={styles.historyItem}>
                <span>User: {r.id || "ID: " + (i+1)}</span>
                <span style={{color: 'green'}}>Joined ✅</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw History</h3>
          <div style={{maxHeight: 150, overflowY: 'auto', marginBottom: 15}}>
            {withdrawHistory.map((w, i) => (
              <div key={i} style={styles.historyItem}>
                <span><b>{w.amount} TON</b></span>
                <span style={{color: w.status === 'Pending' ? 'orange' : 'green'}}>{w.status}</span>
                <span style={{opacity: 0.7}}>{w.date}</span>
              </div>
            ))}
          </div>
          
          <input style={{width:'100%', padding: 12, borderRadius: 10, border: '1px solid #000', marginBottom: 10}} placeholder="Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
            const amt = Number(withdrawAmount);
            if(amt < 0.1 || amt > balance) return alert("Error in amount!");
            const newH = [{amount: amt, status: 'Pending', date: new Date().toLocaleDateString()}, ...withdrawHistory];
            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({balance: balance - amt, withdrawHistory: newH})});
            alert("Request Sent!"); setWithdrawAmount(''); fetchData();
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>Profile</h3>
          <p>ID: <b>{APP_CONFIG.MY_UID}</b></p>
          <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
          <p>Membership: {isVip ? "VIP ⭐" : "Standard"}</p>
          <button style={{...styles.btn, background: '#ef4444', marginTop: 10}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
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
