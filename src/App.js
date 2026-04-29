import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003,
  VIP_WATCH_REWARD: 0.0008,
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  VPN_IOS: "https://apps.apple.com/app/1-1-1-1-faster-internet/id1433553754",
  VPN_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
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

  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [newAdUrl, setNewAdUrl] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // VPN Check Logic
  const checkVPN = useCallback(async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      setIsVpnActive(data.includes('warp=on'));
    } catch (error) { setIsVpnActive(false); } finally { setCheckingVpn(false); }
  }, []);

  useEffect(() => {
    checkVPN();
    const vpnInterval = setInterval(checkVPN, 10000);
    return () => clearInterval(vpnInterval);
  }, [checkVPN]);

  // Ad Sequence Logic
  const triggerAdsSequence = useCallback(() => {
    if (!isVpnActive) return;
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 

    setTimeout(() => {
      if (adsterraLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
        window.open(adsterraLinks[randomIndex].url, '_blank');
      }
    }, 2000); // Trigger Adsterra after short delay
  }, [adsterraLinks, isVpnActive]);

  const checkAdStay = () => {
    if (lastAdClickTime === 0) return false;
    const timePassed = (Date.now() - lastAdClickTime) / 1000;
    if (timePassed < 7) {
      alert(`Please view the ad for ${Math.ceil(7 - timePassed)} more seconds to unlock reward!`);
      return false;
    }
    return true;
  };

  // Main Reward Function (No Adsgram for tasks)
  const grantReward = (id, amount) => {
    if (!isVpnActive) return alert("Please connect VPN!");
    if (!checkAdStay()) return;

    if (id !== 'watch_ad' && completed.includes(id)) return alert("Already claimed!");

    const newBal = Number((balance + amount).toFixed(5));
    const newCompleted = id !== 'watch_ad' ? [...completed, id] : completed;
    
    setBalance(newBal);
    setCompleted(newCompleted);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, completed: newCompleted })
    });

    alert(`Reward Success: +${amount} TON`);
    setLastAdClickTime(0); // Reset after success
  };

  // Video Ad (Keeps Adsgram + Sequence)
  const handleWatchAd = () => {
    if (!isVpnActive) return alert("Please connect VPN!");
    triggerAdsSequence();
    
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
            const reward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
            grantReward('watch_ad', reward);
            setAdsWatched(prev => prev + 1);
            fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ adsWatched: adsWatched + 1 })
            });
        }
      });
    }
  };

  // Bot & Social Tasks with 7s logic
  const handleTaskAction = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    
    if (lastAdClickTime === 0) {
        triggerAdsSequence();
        if (link) {
            setTimeout(() => {
                tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
            }, 500);
        }
    } else {
        grantReward(id, reward);
    }
  };

  // Promo Code Claim
  const handleClaimPromo = async () => {
    if(!rewardCodeInput) return alert("Enter Code");
    const codeId = 'c_' + rewardCodeInput;
    if (completed.includes(codeId)) return alert("This code has already been claimed!");

    if (lastAdClickTime === 0) {
        triggerAdsSequence();
        return;
    }

    if (!checkAdStay()) return;

    try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${rewardCodeInput}.json`);
        const data = await res.json();
        if(data) {
            grantReward(codeId, APP_CONFIG.CODE_REWARD);
            setRewardCodeInput('');
        } else {
            alert("Invalid Promo Code!");
        }
    } catch (e) { alert("Error checking code"); }
  };

  // Navigation with 7s logic
  const handleSafeNav = (nav) => {
    if (activeNav === nav) return;
    if (lastAdClickTime > 0 && !checkAdStay()) return;
    triggerAdsSequence();
    setActiveNav(nav);
  };

  // Data Sync
  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const setSuccessStatus = async (userId, historyIndex) => {
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`);
      const userData = await res.json();
      if(userData && userData.withdrawHistory) {
        const updatedHistory = [...userData.withdrawHistory];
        updatedHistory[historyIndex].status = "Success";
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${userId}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ withdrawHistory: updatedHistory })
        });
        alert("Status Updated!");
        setSearchedUser({...userData, withdrawHistory: updatedHistory});
      }
    } catch (e) { alert("Error"); }
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
        <div style={styles.card}>
          <h2 style={{color: 'red'}}>VPN REQUIRED ⚠️</h2>
          <p>Please connect to 1.1.1.1 VPN to use this bot.</p>
          <button style={{...styles.btn, background: '#007AFF'}} onClick={() => window.open(APP_CONFIG.VPN_IOS)}>DOWNLOAD IOS</button>
          <button style={{...styles.btn, background: '#3DDC84', marginTop: 10}} onClick={() => window.open(APP_CONFIG.VPN_ANDROID)}>DOWNLOAD ANDROID</button>
          <button style={{...styles.btn, background: '#fff', color: '#000', marginTop: 20, border: '2px solid #000'}} onClick={checkVPN}>REFRESH STATUS</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{fontWeight: 'bold', marginBottom: 10}}>Watch Ad Video - Earn TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={handleWatchAd}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : (lastAdClickTime > 0 ? 'CLAIM' : 'START')}</button>
              </div>
            ))}
            {activeTab === 'social' && customTasks.filter(t => t.type === 'social').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskAction(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : (lastAdClickTime > 0 ? 'CLAIM' : 'JOIN')}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={handleClaimPromo}>{lastAdClickTime > 0 ? 'SUBMIT CODE' : 'CLICK TO UNLOCK'}</button>
              </div>
            )}
            
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4 style={{borderBottom: '2px solid #000', paddingBottom: 5}}>Admin Panel</h4>
                
                <h5 style={{color: '#f59e0b', margin: '10px 0'}}>USER MANAGER</h5>
                <div style={{display: 'flex', gap: 5}}>
                    <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                    <button style={{...styles.btn, background: '#f59e0b', width: 80}} onClick={async () => {
                        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                        const data = await res.json();
                        if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); }
                    }}>FIND</button>
                </div>

                {searchedUser && (
                  <div style={{background: '#fef3c7', padding: 10, borderRadius: 10, marginTop: 10}}>
                    <p>Balance: {searchedUser.balance} TON</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background: 'green'}} onClick={async () => {
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                        alert("Balance Updated!");
                    }}>UPDATE</button>
                    <h6 style={{marginTop: 10}}>Withdrawals:</h6>
                    {searchedUser.withdrawHistory?.map((h, i) => (
                        <div key={i} style={{fontSize: 10}}>{h.amount} - {h.status} {h.status !== 'Success' && <button onClick={() => setSuccessStatus(searchUserId, i)}>OK</button>}</div>
                    ))}
                    <button style={{...styles.btn, background: 'red', marginTop: 10}} onClick={() => setSearchedUser(null)}>CLOSE</button>
                  </div>
                )}

                <h5 style={{color: 'green', marginTop: 15}}>ADD TASK</h5>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background: 'green'}} onClick={async () => {
                   const id = 't_'+Date.now();
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                   alert("Task Saved!"); fetchData();
                }}>SAVE TASK</button>

                <h5 style={{color: 'purple', marginTop: 15}}>CREATE PROMO CODE</h5>
                <input style={styles.input} placeholder="Promo Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={async () => {
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method: 'PUT', body: JSON.stringify({ code: adminPromoCode }) });
                   alert("Code Created!");
                }}>CREATE</button>

                <h5 style={{color: '#d946ef', marginTop: 15}}>ADSTERRA LINKS</h5>
                <input style={styles.input} placeholder="Adsterra URL" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} />
                <button style={{...styles.btn, background: '#d946ef'}} onClick={async () => {
                    const id = 'ad_'+Date.now();
                    await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${id}.json`, { method: 'PUT', body: JSON.stringify({ url: newAdUrl }) });
                    setNewAdUrl(''); fetchData();
                }}>ADD LINK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <p style={{fontSize: 12}}>Min: 0.1 TON</p>
          <input style={styles.input} placeholder="Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={() => {
              const amt = Number(withdrawAmount);
              if(amt < 0.1 || amt > balance) return alert("Invalid Balance/Amount");
              const entry = { amount: withdrawAmount, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' };
              const newHist = [entry, ...withdrawHistory];
              const newBal = Number((balance - amt).toFixed(5));
              setBalance(newBal); setWithdrawHistory(newHist);
              fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: newHist }) });
              alert("Withdrawal Requested!");
          }}>WITHDRAW</button>
          
          <h4 style={{marginTop: 20}}>History</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={{fontSize: 11, borderBottom: '1px solid #eee', padding: '5px 0', display: 'flex', justifyContent: 'space-between'}}>
                <span>{h.amount} TON - {h.date}</span>
                <span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite & Earn</h3>
          <p>Earn {APP_CONFIG.REFER_REWARD} TON per friend!</p>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }}>COPY REFER LINK</button>
          <h4 style={{marginTop: 20}}>Invited: {referrals.length}</h4>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>Profile</h3>
          <p>Status: <b>{isVip ? "VIP Member ⭐" : "Standard User"}</b></p>
          <p>User ID: {APP_CONFIG.MY_UID}</p>
          <p>Total Ads: {adsWatched}</p>
          <button style={{...styles.btn, background: 'red', marginTop: 20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => handleSafeNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: 10 }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
