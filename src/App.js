import React, { useState, useEffect, useCallback, useRef } from 'react';

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
  VPN_IOS: "https://apps.apple.com/app/1-1-1-1-faster-internet/id1433553754",
  VPN_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone",
  // Fixed Ad Links
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef896b9a82/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [isVpnActive, setIsVpnActive] = useState(true);
  const [checkingVpn, setCheckingVpn] = useState(true);
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
  const [adminVipUserId, setAdminVipUserId] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // Ad Timing Logic
  const adStartTime = useRef(null);
  const isWatchingAd = useRef(false);

  const checkVPN = useCallback(async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      setIsVpnActive(data.includes('warp=on'));
    } catch (error) {
      setIsVpnActive(false);
    } finally {
      setCheckingVpn(false);
    }
  }, []);

  useEffect(() => {
    checkVPN();
    const vpnInterval = setInterval(checkVPN, 10000);
    return () => clearInterval(vpnInterval);
  }, [checkVPN]);

  // Handle App Returning/Focus for Ad Timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isWatchingAd.current) {
        const timeSpent = (Date.now() - adStartTime.current) / 1000;
        if (timeSpent < 7) {
          alert("Please watch for 7s to continue!");
          openBothAds(); // Re-open ads
        } else {
          isWatchingAd.current = false;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const openBothAds = () => {
    if (!isVpnActive) return alert("Please connect VPN!");
    adStartTime.current = Date.now();
    isWatchingAd.current = true;
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setTimeout(() => {
      window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    }, 300);
  };

  // Global Click Ad Trigger
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        // Only trigger if not already in ad watching process
        if (!isWatchingAd.current) openBothAds();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isVpnActive]);

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
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const processReward = async (id, rewardAmount) => {
    if (completed.includes(id)) {
        openBothAds();
        return alert("Already completed!");
    }

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(async (result) => {
        if (result.done) {
          const newBal = Number((balance + rewardAmount).toFixed(5));
          const isWatchVideo = id === 'watch_ad';
          const newAdsCount = isWatchVideo ? adsWatched + 1 : adsWatched;
          const newCompleted = [...completed, id];
          
          setBalance(newBal);
          if (isWatchVideo) setAdsWatched(newAdsCount);
          setCompleted(newCompleted);

          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${rewardAmount} TON`);
        }
      });
    }
  };

  const handleClaimPromo = async () => {
    const codeId = 'promo_' + rewardCodeInput;
    if (completed.includes(codeId)) {
        openBothAds();
        return alert("This code has already been claimed!");
    }

    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${rewardCodeInput}.json`);
    const codeData = await res.json();
    
    if (codeData) {
        processReward(codeId, APP_CONFIG.CODE_REWARD);
        setRewardCodeInput('');
    } else {
        alert("Invalid Promo Code!");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' },
    vpnOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#facc15', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }
  };

  if (!isVpnActive && !checkingVpn) {
    return (
      <div style={styles.vpnOverlay}>
        <div style={{...styles.card, padding: '30px'}}>
          <h2 style={{color: '#ef4444', marginBottom: '15px'}}>ACCESS DENIED ⚠️</h2>
          <p style={{marginBottom: '20px'}}>Please connect to <b>1.1.1.1 VPN</b> to use this app.</p>
          <button style={{...styles.btn, backgroundColor: '#007AFF'}} onClick={() => window.open(APP_CONFIG.VPN_IOS)}>IOS</button>
          <button style={{...styles.btn, backgroundColor: '#3DDC84', marginTop:'10px'}} onClick={() => window.open(APP_CONFIG.VPN_ANDROID)}>ANDROID</button>
          <button style={{...styles.btn, background:'#fff', color:'#000', marginTop:'10px'}} onClick={checkVPN}>REFRESH</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>BALANCE {isVip && "⭐ VIP"}</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
             <button style={styles.btn} onClick={() => processReward('video_'+Date.now(), isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD)}>WATCH VIDEO ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => { window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000); }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && customTasks.filter(t => t.type === 'social').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{t.name}</span>
                <button onClick={() => { window.open(t.link); setTimeout(() => processReward(t.id, 0.001), 2000); }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={handleClaimPromo}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>Admin Tools</h4>
                <div style={{background:'#eee', padding:'10px', borderRadius:'10px'}}>
                    <h5>Manage User</h5>
                    <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                    <button style={styles.btn} onClick={async () => {
                        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                        const data = await res.json();
                        if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); } else alert("Not found");
                    }}>FIND USER</button>
                    {searchedUser && (
                        <div style={{marginTop:'10px', fontSize:'12px'}}>
                            <p>Balance: {searchedUser.balance}</p>
                            <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                            <button style={{...styles.btn, background:'green'}} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)})});
                                alert("Updated!");
                            }}>UPDATE BALANCE</button>
                            {searchedUser.withdrawHistory?.map((h, idx) => (
                                h.status === 'Pending' && <button key={idx} style={{...styles.btn, background:'blue', marginTop:'5px'}} onClick={async () => {
                                    let newHist = [...searchedUser.withdrawHistory]; newHist[idx].status = 'Success';
                                    await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method:'PATCH', body: JSON.stringify({withdrawHistory: newHist})});
                                    alert("Withdraw Success!");
                                }}>SET SUCCESS ({h.amount} TON)</button>
                            ))}
                        </div>
                    )}
                </div>
                <hr/>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                    <option value="bot">BOT</option>
                    <option value="social">SOCIAL</option>
                </select>
                <button style={styles.btn} onClick={async () => {
                    const id = 't_'+Date.now();
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                    fetchData(); alert("Task Added");
                }}>ADD TASK</button>
                
                <h5 style={{marginTop:'15px'}}>Delete Tasks</h5>
                {customTasks.map((t, idx) => (
                    <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                        <small>{t.name}</small>
                        <button onClick={async () => { await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${t.firebaseKey}.json`, {method:'DELETE'}); fetchData(); }} style={{color:'red'}}>DEL</button>
                    </div>
                ))}

                <h5 style={{marginTop:'15px'}}>Promo Code</h5>
                <input style={styles.input} placeholder="New Promo Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={async () => {
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method: 'PUT', body: JSON.stringify({ code: adminPromoCode }) });
                    alert("Code Created!");
                }}>CREATE PROMO CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Nav & Other screens (Invite, Withdraw, Profile) similar to old code */}
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
