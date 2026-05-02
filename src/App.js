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
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

// New Bot Task List
const fixedBotTasks = [
  { id: 'b_tea', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b_gold', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  { id: 'b_work', name: "Workers On Ton", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
  { id: 'b_code', name: "Easy Bonus Code", link: "https://t.me/easybonuscode_bot?start=1793453606" },
  { id: 'b_drag', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
  { id: 'b_pobz', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
];

// New Social Task List
const fixedSocialTasks = [
  { id: 's_gtnews', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's_gmnews', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
  { id: 's_crypto', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
  { id: 's_m9460', name: "@M9460", link: "https://t.me/M9460" },
  { id: 's_usdtc', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
  { id: 's_ads1', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
  { id: 's_gobl', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
  { id: 's_wbest', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
  { id: 's_kombo', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
  { id: 's_easy', name: "@easytonfree", link: "https://t.me/easytonfree" },
  { id: 's_wbest1', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
  { id: 's_mhub', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
  { id: 's_zrbt', name: "@zrbtua", link: "https://t.me/zrbtua" },
  { id: 's_perv', name: "@perviu1million", link: "https://t.me/perviu1million" }
];

function App() {
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [lastAdClickTime, setLastAdClickTime] = useState(0);
  const [pendingVerification, setPendingVerification] = useState(null);

  // Admin States
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let hasUpdates = false;
      const updatedHistory = withdrawHistory.map(item => {
        if (item.status === 'Pending' && item.timestamp && (now - item.timestamp) > 300000) {
          hasUpdates = true;
          return { ...item, status: 'Success' };
        }
        return item;
      });
      if (hasUpdates) {
        setWithdrawHistory(updatedHistory);
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ withdrawHistory: updatedHistory })
        });
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [withdrawHistory]);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    setLastAdClickTime(Date.now()); 
  }, []);

  const checkAdStay = (requiredSeconds) => {
    if (lastAdClickTime === 0) {
      triggerAdsSequence();
      return false;
    }
    const elapsed = (Date.now() - lastAdClickTime) / 1000;
    if (elapsed < requiredSeconds) {
      alert(`Stay on the ad for ${requiredSeconds}s. (${Math.ceil(requiredSeconds - elapsed)}s remaining)`);
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
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
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
    } catch (e) { console.warn("Sync error"); }
    finally { setIsSyncing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const processReward = async (id, amt) => {
    const timeLimit = id === 'watch_ad' ? 30 : 15;
    if (!checkAdStay(timeLimit)) return;

    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    
    const updates = { balance: newBal };
    if (id !== 'watch_ad') {
        const newCompleted = [...completed, id];
        setCompleted(newCompleted);
        updates.completedTasks = newCompleted;
    }

    setBalance(newBal);
    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH', body: JSON.stringify(updates)
    });
    alert(`Reward Collected! +${rewardAmt} TON.`);
    setLastAdClickTime(0);
    setPendingVerification(null);
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
    watchBtn: { background: '#facc15', color: '#000', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', marginTop: '10px', width: '100%' },
    actionBtn: { padding: '8px 15px', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
    verifyBtn: { padding: '8px 15px', background: '#22c55e', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>{isSyncing ? "LOADING..." : "TOTAL BALANCE"}</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <span style={{background:'#facc15', color:'#000', padding:'2px 8px', borderRadius:10, fontSize:12, fontWeight:'bold'}}>VIP ⭐</span>}
        <button style={styles.watchBtn} onClick={() => processReward('watch_ad', 0)}>
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
            {activeTab === 'bot' && fixedBotTasks.filter(t => !completed.includes(t.id)).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                {pendingVerification === t.id ? (
                    <button onClick={() => processReward(t.id, 0.001)} style={styles.verifyBtn}>VERIFY</button>
                ) : (
                    <button onClick={() => { triggerAdsSequence(); window.open(t.link); setPendingVerification(t.id); }} style={styles.actionBtn}>START</button>
                )}
              </div>
            ))}

            {activeTab === 'social' && fixedSocialTasks.filter(t => !completed.includes(t.id)).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                {pendingVerification === t.id ? (
                    <button onClick={() => processReward(t.id, 0.001)} style={styles.verifyBtn}>VERIFY</button>
                ) : (
                    <button onClick={() => { triggerAdsSequence(); window.open(t.link); setPendingVerification(t.id); }} style={styles.actionBtn}>JOIN</button>
                )}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if (completed.includes(`promo_${rewardCodeInput}`)) return alert("Already used!");
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                }}>CLAIM CODE</button>
              </div>
            )}
            
            {/* Admin Section simplified for length */}
            {activeTab === 'admin' && (
                <div>
                   <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                   <button style={styles.btn} onClick={async () => {
                      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const data = await res.json();
                      if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("Not Found");
                   }}>Find User</button>
                </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Deposit for VIP (1.0 TON)</h3>
            <p style={{fontSize: 12}}>TON Address:</p>
            <div style={{display:'flex', gap: 5, marginBottom: 10}}>
                <input style={{...styles.input, marginBottom:0}} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                <button style={{...styles.actionBtn, height: 40}} onClick={() => copyText(APP_CONFIG.ADMIN_WALLET)}>Copy</button>
            </div>
            <p style={{fontSize: 12}}>Memo (UID):</p>
            <div style={{display:'flex', gap: 5}}>
                <input style={{...styles.input, marginBottom:0}} readOnly value={APP_CONFIG.MY_UID} />
                <button style={{...styles.actionBtn, height: 40}} onClick={() => copyText(APP_CONFIG.MY_UID)}>Copy</button>
            </div>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Min 0.1 TON" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={async () => {
              const amount = Number(withdrawAmount);
              if(amount < 0.1) return alert("Min 0.1 TON.");
              if(amount > balance) return alert("Insufficient balance.");
              
              const h = [{amount, status: 'Pending', timestamp: Date.now(), date: new Date().toLocaleString()}, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({balance: Number((balance - amount).toFixed(5)), withdrawHistory: h})
              });
              alert("Request Pending! Success in 5 mins."); fetchData();
            }}>WITHDRAW NOW</button>
          </div>

          <div style={styles.card}>
            <h3>History</h3>
            {withdrawHistory.map((w, i) => (
               <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                  <span>{w.amount} TON</span>
                  <span style={{color: w.status === 'Pending' ? 'orange' : 'green', fontWeight:'bold'}}>{w.status}</span>
               </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Earn <b>{APP_CONFIG.REFER_REWARD} TON</b> per invite!</p>
          <input style={styles.input} readOnly value={`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`} />
          <button style={styles.btn} onClick={() => copyText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
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

export default App;
