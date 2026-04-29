import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

// --- Connection Config (VPN Bypass) ---
const FIREBASE_PROXY = "https://corsproxy.io/?"; 
const FIREBASE_BASE_URL = "https://easytonfree-default-rtdb.firebaseio.com";

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: FIREBASE_PROXY + encodeURIComponent(FIREBASE_BASE_URL),
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
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
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');

  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [newAdUrl, setNewAdUrl] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // --- Fetching Data via Proxy ---
  const fetchData = useCallback(async () => {
    try {
      const uUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const tUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/global_tasks.json`);
      const aUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/adsterra_links.json`);

      const [u, t, a] = await Promise.all([fetch(uUrl), fetch(tUrl), fetch(aUrl)]);
      
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
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      }
      if (adsData) {
        setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
      }
    } catch (e) { 
      console.log("Network sync attempted..."); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now()); 

    setTimeout(() => {
      if (adsterraLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
        window.open(adsterraLinks[randomIndex].url, '_blank');
      }
    }, 7000); 
  }, [adsterraLinks]);

  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 7000) {
      alert("Please stay on the Ad for 7 seconds!");
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const handleTabChange = (tab) => {
    if (!checkAdStay()) return;
    if (['bot', 'social', 'reward'].includes(tab)) {
      triggerAdsSequence();
    }
    setActiveTab(tab);
  };

  const processReward = (id, rewardAmount) => {
    if (!checkAdStay()) return;

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(async (result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          const newCompleted = !isWatchAd ? [...completed, id] : completed;

          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          setCompleted(newCompleted);

          const patchUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
          await fetch(patchUrl, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          
          alert(`Reward Success: +${finalReward} TON`);
          setLastAdClickTime(0); 
          fetchData();
        }
      });
    } else {
      alert("Ad provider not loaded.");
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    triggerAdsSequence();
    if (link) {
      setTimeout(() => {
        tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
      }, 500);
    }
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const handleClaimClick = () => {
    if(!rewardCodeInput) return alert("Please enter a code");
    triggerAdsSequence();
    setTimeout(() => {
      processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD);
    }, 1500);
  }

  const safeNavigate = (nav) => {
    if (activeNav === nav) return;
    if (!checkAdStay()) return;
    triggerAdsSequence();
    setActiveNav(nav);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <div style={{display:'flex', justifyContent:'center', gap:10, opacity:0.8, fontSize:12}}>
            <span>Ads: {adsWatched}</span>
            <span>VIP Rate: {APP_CONFIG.VIP_WATCH_REWARD}</span>
            <span>Rate: {APP_CONFIG.WATCH_REWARD}</span>
        </div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video Reward</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleTabChange(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={handleClaimClick}>CLAIM REWARD</button>
              </div>
            )}
            
            {activeTab === 'admin' && (
              <div>
                <h4 style={{borderBottom: '2px solid #000'}}>Admin Control</h4>
                <div style={{background: '#fef08a', padding: 10, borderRadius: 10, margin: '10px 0', border: '2px solid #000'}}>
                    <h5>🔗 ADSTERRA LINKS</h5>
                    <input style={styles.input} placeholder="Paste Ad Link" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} />
                    <button style={{...styles.btn, background: '#d946ef', marginBottom: 10}} onClick={async () => {
                        if(!newAdUrl) return;
                        const id = 'ad_'+Date.now();
                        const putUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/adsterra_links/${id}.json`);
                        await fetch(putUrl, { method: 'PUT', body: JSON.stringify({ url: newAdUrl }) });
                        setNewAdUrl(''); fetchData(); alert("Link Added Successfully!");
                    }}>ADD LINK</button>
                    <div style={{maxHeight: 120, overflowY: 'auto', fontSize: 11}}>
                        {adsterraLinks.map(ad => (
                            <div key={ad.id} style={{display:'flex', justifyContent:'space-between', padding: 5, borderBottom: '1px solid #ddd'}}>
                                <span style={{wordBreak: 'break-all'}}>{ad.url.substring(0, 30)}...</span>
                                <button style={{color: 'red', border:'none', background:'none'}} onClick={async () => {
                                    const delUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/adsterra_links/${ad.id}.json`);
                                    await fetch(delUrl, { method: 'DELETE' });
                                    fetchData();
                                }}>DELETE</button>
                            </div>
                        ))}
                    </div>
                </div>

                <h5>🔍 USER MANAGER</h5>
                <div style={{display: 'flex', gap: 5, marginBottom: 10}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: 80, background: '#f59e0b'}} onClick={async () => {
                      const getUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/users/${searchUserId}.json`);
                      const res = await fetch(getUrl);
                      const data = await res.json();
                      if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); } else alert("User not found");
                    }}>SEARCH</button>
                </div>
                {searchedUser && (
                  <div style={{background: '#fffbeb', padding: 10, borderRadius: 10, border: '1px solid #f59e0b', fontSize: 12, marginBottom: 20}}>
                    <p>Current Balance: <b>{searchedUser.balance} TON</b></p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background: '#10b981'}} onClick={async () => {
                            const patchUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/users/${searchUserId}.json`);
                            await fetch(patchUrl, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                            alert("Balance Updated!"); fetchData();
                        }}>UPDATE USER</button>
                  </div>
                )}
                
                <hr/>
                <h5>➕ TASK MANAGER</h5>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Task Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <button style={{...styles.btn, background: 'green'}} onClick={async () => {
                   const id = 't_'+Date.now();
                   const putUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/global_tasks/${id}.json`);
                   await fetch(putUrl, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                   alert("Task Saved!"); fetchData();
                }}>SAVE TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Withdraw Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
                const amt = Number(withdrawAmount);
                if(amt < 0.1 || amt > balance) return alert("Invalid Balance or Amount too low");
                const entry = { amount: withdrawAmount, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' };
                const newHistory = [entry, ...withdrawHistory];
                const newBal = Number((balance - amt).toFixed(5));
                setBalance(newBal); setWithdrawHistory(newHistory);
                const patchUrl = FIREBASE_PROXY + encodeURIComponent(`${FIREBASE_BASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
                await fetch(patchUrl, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory }) });
                alert("Withdrawal request submitted!");
            }}>SUBMIT WITHDRAWAL</button>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
            <h3>Referral Link</h3>
            <p>Invite friends and earn rewards!</p>
            <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link copied to clipboard!"); }}>COPY REFERRAL LINK</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => safeNavigate(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
