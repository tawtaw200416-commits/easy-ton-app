import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  REFER_REWARD: 0.001,
  // Permanent Ad Links
  AD_LINK_1: "Https://data527.click/a674e1237b7e268eb5f6/ef896b9a82/?placementName=default",
  AD_LINK_2: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0);
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

  // Admin states
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // Ad Timing Logic
  const lastAdTime = useRef(0);
  const adInProgress = useRef(false);

  const forceShowAds = useCallback(() => {
    adInProgress.current = true;
    lastAdTime.current = Date.now();
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    setTimeout(() => {
        window.open(APP_CONFIG.AD_LINK_2, '_blank');
    }, 300);
  }, []);

  const checkAdTimer = () => {
    if (lastAdTime.current === 0) return true;
    const elapsed = (Date.now() - lastAdTime.current) / 1000;
    if (elapsed < 10) {
        alert("Please watch the ads for 10 seconds! (ကြော်ငြာကို ၁၀ စက္ကန့်ပြည့်အောင်ကြည့်ပေးပါ)");
        forceShowAds();
        return false;
    }
    adInProgress.current = false;
    return true;
  };

  // Global Button Click Interceptor
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const btn = e.target.closest('button');
      if (btn) {
        if (!adInProgress.current) {
            forceShowAds();
        }
      }
    };
    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, [forceShowAds]);

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
    const interval = setInterval(fetchData, 20000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const processReward = async (id, reward) => {
    if (!checkAdTimer()) return;
    if (completed.includes(id)) return alert("Already Claimed!");

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(async (res) => {
        if (res.done) {
          const newBal = Number((balance + reward).toFixed(5));
          const newAdsCount = id.includes('video') ? adsWatched + 1 : adsWatched;
          const newCompleted = id.includes('video') ? completed : [...completed, id];
          
          setBalance(newBal);
          setCompleted(newCompleted);
          setAdsWatched(newAdsCount);

          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${reward} TON`);
          lastAdTime.current = 0; // Reset after successful reward
        }
      });
    }
  };

  const handleNav = (nav) => {
    if (checkAdTimer()) setActiveNav(nav);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', border: '3px solid #fff', marginBottom: '15px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '10px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <h1 style={{fontSize: '35px', margin: '0'}}>{balance.toFixed(5)} TON</h1>
        <div style={{fontSize: '12px', color: '#facc15'}}>{isVip ? "⭐ VIP ACCOUNT" : "FREE ACCOUNT"}</div>
        <div style={{fontSize: '10px', marginTop: '5px'}}>Total Ads Watched: {adsWatched}</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', textAlign:'center'}}>
            <button style={{...styles.btn, background: '#facc15', color: '#000'}} 
                    onClick={() => processReward('video_'+Date.now(), isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD)}>
                WATCH ADS (ADSGRAM)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => checkAdTimer() && setActiveTab(t.toLowerCase())} 
                      style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot').map((t, idx) => (
              <div key={idx} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <span>{t.name}</span>
                <button onClick={() => { window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000); }} 
                        style={{background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px', border:'none'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && customTasks.filter(t => t.type === 'social').map((t, idx) => (
              <div key={idx} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <span>{t.name}</span>
                <button onClick={() => { window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000); }} 
                        style={{background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px', border:'none'}}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h5>ADMIN DASHBOARD</h5>
                <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                    const r = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                    const d = await r.json();
                    if(d) { setSearchedUser(d); setNewBalanceInput(d.balance); } else alert("No user!");
                }}>SEARCH USER</button>
                {searchedUser && (
                    <div style={{marginTop: '10px', background:'#eee', padding:'10px', borderRadius:'10px'}}>
                        <input style={styles.input} value={newBalanceInput} type="number" onChange={e => setNewBalanceInput(e.target.value)} />
                        <button style={{...styles.btn, background:'green'}} onClick={async () => {
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)}) });
                            alert("Balance Set!");
                        }}>SET BALANCE</button>
                    </div>
                )}
                <hr/>
                <h6>MANAGE TASKS</h6>
                <input style={styles.input} placeholder="Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">BOT</option>
                    <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background:'green'}} onClick={async () => {
                    const id = 't_'+Date.now();
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method:'PUT', body: JSON.stringify({id, name: adminTaskName, link: adminTaskLink, type: adminTaskType}) });
                    fetchData(); alert("Task Added!");
                }}>ADD TASK</button>
                <div style={{marginTop:'10px'}}>
                    {customTasks.map((t, i) => (
                        <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'11px', padding:'5px 0', borderBottom:'1px solid #ccc'}}>
                            <span>{t.name}</span>
                            <button onClick={async () => { await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${t.firebaseKey}.json`, {method:'DELETE'}); fetchData(); }} style={{color:'red', border:'none', background:'none'}}>DELETE</button>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
          <div style={styles.card}>
              <h3>Withdraw</h3>
              <p>Min: {APP_CONFIG.MIN_WITHDRAW} TON</p>
              <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
              <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
              <button style={styles.btn} onClick={() => {
                  const amt = Number(withdrawAmount);
                  if(amt < APP_CONFIG.MIN_WITHDRAW || amt > balance) return alert("Check Balance!");
                  const entry = { amount: withdrawAmount, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString(), status: 'Pending' };
                  const newHist = [entry, ...withdrawHistory];
                  const newBal = Number((balance - amt).toFixed(5));
                  setBalance(newBal); setWithdrawHistory(newHist);
                  fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method:'PATCH', body: JSON.stringify({balance: newBal, withdrawHistory: newHist}) });
                  alert("Withdrawal Requested!");
              }}>WITHDRAW NOW</button>
          </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
