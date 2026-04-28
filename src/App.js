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
  VPN_IOS: "https://apps.apple.com/app/1-1-1-1-faster-internet/id1433553754",
  VPN_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone"
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

  const triggerAdsterra = useCallback(() => {
    if (!isVpnActive) return;
    if (adsterraLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
      setLastAdClickTime(Date.now()); 
      window.open(adsterraLinks[randomIndex].url, '_blank');
    }
  }, [adsterraLinks, isVpnActive]);

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
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      }
      if (adsData) {
        setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    handleReferral(); 
    const interval = setInterval(fetchData, 15000); 
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
    if (!isVpnActive) return alert("Please connect to 1.1.1.1 VPN!");

    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime > 0 && timePassed < 7000) {
        alert("Please stay on the ad for at least 7 seconds to claim your reward!");
        return;
    }

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    else if (id.startsWith('c_')) finalReward = APP_CONFIG.CODE_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          const newCompleted = !isWatchAd ? [...completed, id] : completed;
          if (!isWatchAd) setCompleted(newCompleted);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${finalReward} TON`);
          setLastAdClickTime(0); 
          fetchData();
        }
      });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  // --- MODIFIED: Navigate and Trigger Adsterra ---
  const safeNavigate = (nav) => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime > 0 && timePassed < 7000) {
        alert("Please view the ad for 7 seconds before switching tabs!");
        return;
    }
    triggerAdsterra(); // Adsterra ပွင့်မယ်
    setActiveNav(nav);
  };

  const switchTab = (tab) => {
    triggerAdsterra(); // Adsterra ပွင့်မယ်
    setActiveTab(tab);
  };

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
        alert("Withdrawal status updated to Success!");
        setSearchedUser({...userData, withdrawHistory: updatedHistory});
        fetchData();
      }
    } catch (e) { alert("Error updating status"); }
  };

  const fixedBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    { id: 'b7', name: "TonSpeed Bot", link: "https://t.me/tonspeeddrop_bot/startapp?startapp=1793453606" }
  ];

  const fixedSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@cryptogold_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
    { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
  ];

  const allBotTasks = [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 1000 },
    vpnOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#facc15', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }
  };

  if (!isVpnActive && !checkingVpn) {
    return (
      <div style={styles.vpnOverlay}>
        <div style={{...styles.card, padding: '30px'}}>
          <h2 style={{color: '#ef4444', marginBottom: '15px'}}>ACCESS DENIED ⚠️</h2>
          <p style={{marginBottom: '20px'}}>To use this bot and earn TON, you <b>MUST</b> connect to <b>1.1.1.1 Cloudflare VPN (WARP)</b>.</p>
          <button style={{...styles.btn, backgroundColor: '#007AFF', marginBottom: '10px'}} onClick={() => window.open(APP_CONFIG.VPN_IOS)}>DOWNLOAD FOR IOS</button>
          <button style={{...styles.btn, backgroundColor: '#3DDC84', marginBottom: '20px'}} onClick={() => window.open(APP_CONFIG.VPN_ANDROID)}>DOWNLOAD FOR ANDROID</button>
          <button style={{...styles.btn, backgroundColor: '#fff', color: '#000', border: '2px solid #000'}} onClick={checkVPN}>I HAVE CONNECTED - REFRESH</button>
        </div>
      </div>
    );
  }

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
              <button key={t} onClick={() => switchTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && allSocialTasks.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                {/* Admin controls remain same... */}
                <h4 style={{borderBottom: '2px solid #000', paddingBottom: '5px'}}>Admin Control</h4>
                <div style={{background: '#fef08a', padding: '10px', borderRadius: '10px', margin: '10px 0', border: '2px solid #000'}}>
                    <h5 style={{margin: '0 0 10px 0'}}>🔗 ADSTERRA DIRECT LINKS</h5>
                    <input style={styles.input} placeholder="Paste Adsterra URL" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} />
                    <button style={{...styles.btn, background: '#d946ef', marginBottom: '10px'}} onClick={async () => {
                        if(!newAdUrl) return;
                        const id = 'ad_'+Date.now();
                        await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${id}.json`, { method: 'PUT', body: JSON.stringify({ url: newAdUrl }) });
                        setNewAdUrl(''); fetchData(); alert("Adsterra Link Added!");
                    }}>ADD ADSTERRA LINK</button>
                    <div style={{maxHeight: '100px', overflowY: 'auto', fontSize: '12px'}}>
                        {adsterraLinks.map(ad => (
                            <div key={ad.id} style={{display:'flex', justifyContent:'space-between', padding: '5px', borderBottom: '1px solid #000'}}>
                                <span style={{overflow: 'hidden'}}>{ad.url.substring(0, 25)}...</span>
                                <button style={{color: 'red', border: 'none', background: 'none', fontWeight: 'bold'}} onClick={async () => {
                                    await fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links/${ad.id}.json`, { method: 'DELETE' });
                                    fetchData();
                                }}>DELETE</button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Search, Add Task, etc. code continues here as in your original */}
                <h5 style={{color: '#f59e0b', marginBottom: '10px'}}>🔍 USER MANAGER</h5>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="Enter User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={async () => {
                      if(!searchUserId) return alert("Enter ID");
                      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const data = await res.json();
                      if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); } else alert("User not found!");
                    }}>FIND</button>
                </div>
                {searchedUser && (
                  <div style={{background: '#fffbeb', padding: '10px', borderRadius: '10px', border: '1px solid #f59e0b', fontSize: '12px', marginBottom: '20px'}}>
                    <p>💰 Balance: <b>{Number(searchedUser.balance || 0).toFixed(5)} TON</b></p>
                    <div style={{margin: '10px 0'}}>
                        <input style={{...styles.input, marginBottom: '5px'}} type="number" value={newBalanceInput} onChange={(e) => setNewBalanceInput(e.target.value)} />
                        <button style={{...styles.btn, background: '#10b981'}} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                                alert("Balance Updated!"); setSearchedUser({...searchedUser, balance: Number(newBalanceInput)});
                            }}>UPDATE BALANCE</button>
                    </div>
                    <button style={{...styles.btn, background: '#ef4444', marginTop: '10px'}} onClick={() => setSearchedUser(null)}>CLOSE INFO</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9'}}>💎 BUY VIP</h3>
            <p style={{fontSize: '14px', margin: '5px 0'}}>Top up 1 TON to withdraw instantly!</p>
            <button style={{...styles.btn, background: '#0ea5e9'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>VERIFY PAYMENT</button>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt < APP_CONFIG.MIN_WITHDRAW || amt > balance || !withdrawAddress) return alert("Check Input/Balance");
                const entry = { amount: withdrawAmount, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString(), status: 'Pending' };
                const newHistory = [entry, ...withdrawHistory];
                const newBal = Number((balance - amt).toFixed(5));
                setBalance(newBal); setWithdrawHistory(newHistory);
                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory }) });
                alert("Withdrawal Requested!");
            }}>WITHDRAW</button>
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
            <h3>Refer & Earn</h3>
            <p style={{fontSize: '14px', marginBottom: '10px'}}>Earn {APP_CONFIG.REFER_REWARD} TON per friend!</p>
            <button style={styles.btn} onClick={() => { 
                navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
                alert("Copied!"); 
            }}>COPY LINK</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '10px 0'}}>Status: <b>{isVip ? "VIP ⭐" : "ACTIVE ✅"}</b></div>
          <div style={{padding: '10px 0'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '10px 0'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
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
