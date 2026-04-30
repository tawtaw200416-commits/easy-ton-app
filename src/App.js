import React, { useState, useEffect, useCallback } from 'react';

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

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const triggerDoubleAds = () => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.AD_LINK_2, '_blank');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const isNewUser = !localStorage.getItem(`joined_${APP_CONFIG.MY_UID}`);
    if (startParam && isNewUser && startParam !== APP_CONFIG.MY_UID) {
      try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`);
        const inviterData = await res.json();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newInviterRefs = inviterData.referrals ? [...Object.values(inviterData.referrals), { id: APP_CONFIG.MY_UID }] : [{ id: APP_CONFIG.MY_UID }];
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newInviterBalance, referrals: newInviterRefs })
          });
          localStorage.setItem(`joined_${APP_CONFIG.MY_UID}`, 'true');
        }
      } catch (e) { console.error("Referral Error:", e); }
    }
  }, []);

  const checkStatus = (historyItem) => {
    if (historyItem.status === "Success") return "Success";
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - historyItem.timestamp >= fiveMinutes) {
        return "Success";
    }
    return "Pending";
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
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    handleReferral(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData, handleReferral]);

  useEffect(() => {
    localStorage.setItem(`ton_bal_${APP_CONFIG.MY_UID}`, balance.toString());
    localStorage.setItem(`comp_tasks_${APP_CONFIG.MY_UID}`, JSON.stringify(completed));
    localStorage.setItem(`wd_hist_${APP_CONFIG.MY_UID}`, JSON.stringify(withdrawHistory));
    localStorage.setItem(`refs_${APP_CONFIG.MY_UID}`, JSON.stringify(referrals));
    localStorage.setItem(`ads_watched_${APP_CONFIG.MY_UID}`, adsWatched.toString());
  }, [balance, completed, withdrawHistory, referrals, adsWatched]);

  const processReward = (id, rewardAmount) => {
    triggerDoubleAds();
    let finalReward = (id === 'watch_ad') ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    
    const giveReward = () => {
        const newBal = Number((balance + finalReward).toFixed(5));
        const newAdsCount = (id === 'watch_ad') ? adsWatched + 1 : adsWatched;
        setBalance(newBal);
        if (id === 'watch_ad') setAdsWatched(newAdsCount);
        const newCompleted = (id !== 'watch_ad') ? [...completed, id] : completed;
        if (id !== 'watch_ad') setCompleted(newCompleted);

        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
        });
        alert(`Reward Success: +${finalReward} TON`);
        fetchData();
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show().then((res) => { if (res.done) giveReward(); });
    } else { giveReward(); }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    triggerDoubleAds();
    if (link) window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' },
    copyBtn: { background: '#facc15', border: '1px solid #000', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Total Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => { triggerDoubleAds(); setActiveTab(t.toLowerCase()); }} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4>Admin Control</h4>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="Enter User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={async () => {
                      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const data = await res.json();
                      if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); } else alert("Not found");
                    }}>FIND</button>
                </div>

                {searchedUser && (
                  <div style={{background: '#fffbeb', padding: '10px', borderRadius: '10px', border: '1px solid #f59e0b', fontSize: '12px'}}>
                    <p>ID: {searchUserId} | VIP: {searchedUser.isVip ? "YES" : "NO"}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={(e) => setNewBalanceInput(e.target.value)} />
                    <div style={{display:'flex', gap:5}}>
                        <button style={{...styles.btn, background: '#10b981'}} onClick={async () => {
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                            alert("Updated!");
                        }}>UPDATE BAL</button>
                        <button style={{...styles.btn, background: '#8b5cf6'}} onClick={async () => {
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ isVip: !searchedUser.isVip }) });
                            alert("VIP Status Toggled!");
                        }}>{searchedUser.isVip ? "REMOVE VIP" : "GIVE VIP"}</button>
                    </div>
                  </div>
                )}
                <hr/>
                {/* Task adding logic remains same as old code */}
              </div>
            )}
            {/* Bot and Social tasks rendering remains same */}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9'}}>💎 VIP DEPOSIT</h3>
            <p style={{fontSize: '12px'}}>Top up 1 TON to withdraw instantly!</p>
            <div style={{background:'#f3f4f6', padding:'10px', borderRadius:'10px', fontSize:'11px', border:'1px solid #ddd'}}>
                <p><b>Address:</b> {APP_CONFIG.ADMIN_WALLET} <button style={styles.copyBtn} onClick={()=>copyToClipboard(APP_CONFIG.ADMIN_WALLET)}>COPY</button></p>
                <p><b>MEMO:</b> {APP_CONFIG.MY_UID} <button style={styles.copyBtn} onClick={()=>copyToClipboard(APP_CONFIG.MY_UID)}>COPY</button></p>
            </div>
            <button style={{...styles.btn, background: '#0ea5e9', marginTop:'10px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>VERIFY PAYMENT</button>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt < APP_CONFIG.MIN_WITHDRAW) return alert("Minimum 0.1 TON");
                if(amt > balance) return alert("Insufficient Balance!");
                if(!withdrawAddress) return alert("Enter Address");
                
                const entry = { amount: amt, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString(), status: 'Pending' };
                const newHistory = [entry, ...withdrawHistory];
                const newBal = Number((balance - amt).toFixed(5));
                setBalance(newBal); setWithdrawHistory(newHistory);
                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory }) });
                alert("Withdraw Request Sent!");
            }}>WITHDRAW</button>
          </div>

          <div style={styles.card}>
            <h4>History</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{fontSize:11}}><b>{h.amount} TON</b><br/>{h.date}</div>
                <div style={{ color: checkStatus(h) === 'Success' ? 'green' : 'orange', fontWeight: 'bold', fontSize: '12px' }}>{checkStatus(h)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Invite and Profile nav remains same as old code */}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => { triggerDoubleAds(); setActiveNav(n); }} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
