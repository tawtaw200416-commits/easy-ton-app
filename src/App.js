import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001
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
  const [adminVipUserId, setAdminVipUserId] = useState('');

  // Admin Search State
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  // --- New Ads State ---
  const [currentAdsBlockId, setCurrentAdsBlockId] = useState("27611"); 
  const [newAdsBlockIdInput, setNewAdsBlockIdInput] = useState('');

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
            body: JSON.stringify({ 
              balance: newInviterBalance, 
              referrals: newInviterRefs 
            })
          });
          
          localStorage.setItem(`joined_${APP_CONFIG.MY_UID}`, 'true');
        }
      } catch (e) {
        console.error("Referral Error:", e);
      }
    }
  }, []);

  const checkStatus = (historyItem) => {
    if (historyItem.status === "Success") return "Success";
    if (!historyItem.timestamp) return "Pending";
    return (Date.now() - historyItem.timestamp >= 300000) ? "Success" : "Pending";
  };

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/settings/ads_config.json`) // Fetch Ads ID
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
        const tasksWithIds = Object.keys(tasksData).map(key => ({
          ...tasksData[key],
          firebaseKey: key 
        }));
        setCustomTasks(tasksWithIds);
      } else {
        setCustomTasks([]);
      }

      if (adsData && adsData.blockId) {
        setCurrentAdsBlockId(adsData.blockId);
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
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';

    if (isWatchAd) {
      finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    } else if (id.startsWith('c_')) {
      finalReward = APP_CONFIG.CODE_REWARD;
    }

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: currentAdsBlockId }); // Use dynamic ID
      AdController.show()
        .then((result) => {
          if (result.done) {
            const newBal = Number((balance + finalReward).toFixed(5));
            const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
            
            setBalance(newBal);
            if (isWatchAd) setAdsWatched(newAdsCount);

            const newCompleted = !isWatchAd ? [...completed, id] : completed;
            if (!isWatchAd) setCompleted(newCompleted);

            fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
              method: 'PATCH',
              body: JSON.stringify({ 
                balance: newBal, 
                completed: newCompleted, 
                adsWatched: newAdsCount
              })
            });
            alert(`Reward Success: +${finalReward} TON`);
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

  const uniqueCustomTasks = customTasks.filter(ct => 
    !fixedBotTasks.some(ft => ft.name === ct.name || ft.link === ct.link) &&
    !fixedSocialTasks.some(ft => ft.name === ct.name || ft.link === ct.link)
  );

  const allBotTasks = [...fixedBotTasks, ...uniqueCustomTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [...fixedSocialTasks, ...uniqueCustomTasks.filter(t => t.type === 'social')];

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
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
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
                <h4>Admin Control</h4>
                
                {/* --- NEW ADS ID MANAGER --- */}
                <h5 style={{color: '#3b82f6', marginBottom: '10px'}}>📺 ADSGRAM CONFIG</h5>
                <p style={{fontSize: '11px', color: '#666'}}>Current ID: <b>{currentAdsBlockId}</b></p>
                <input style={styles.input} placeholder="Enter New Block ID" value={newAdsBlockIdInput} onChange={e => setNewAdsBlockIdInput(e.target.value)} />
                <button style={{...styles.btn, background: '#3b82f6', marginBottom: '20px'}} onClick={async () => {
                   if(!newAdsBlockIdInput) return alert("Enter ID");
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/settings/ads_config.json`, { method: 'PATCH', body: JSON.stringify({ blockId: newAdsBlockIdInput }) });
                   alert("Ads ID Updated!"); fetchData(); setNewAdsBlockIdInput('');
                }}>UPDATE ADS ID</button>

                <hr style={{margin: '15px 0', border: '1px dashed #ccc'}}/>

                {/* --- USER SEARCH & BALANCE MANAGER --- */}
                <h5 style={{color: '#f59e0b', marginBottom: '10px'}}>🔍 USER DATA & BALANCE MANAGER</h5>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="Enter User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={async () => {
                      if(!searchUserId) return alert("Enter ID");
                      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const data = await res.json();
                      if(data) {
                          setSearchedUser(data);
                          setNewBalanceInput(data.balance || 0); 
                      } else alert("User not found!");
                    }}>FIND</button>
                </div>

                {searchedUser && (
                  <div style={{background: '#fffbeb', padding: '10px', borderRadius: '10px', border: '1px solid #f59e0b', fontSize: '12px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px'}}>
                         <p>💰 Balance: <b>{Number(searchedUser.balance || 0).toFixed(5)} TON</b></p>
                         <p>📺 Ads Watched: <b>{searchedUser.adsWatched || 0} times</b></p>
                         <p>✅ Tasks Done: <b>{searchedUser.completed ? searchedUser.completed.length : 0} tasks</b></p>
                         <p>⭐ VIP Status: <b>{searchedUser.isVip ? "YES" : "NO"}</b></p>
                    </div>
                    
                    <div style={{margin: '10px 0', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd'}}>
                        <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>Edit Balance:</label>
                        <input 
                            style={{...styles.input, marginBottom: '5px'}} 
                            type="number" 
                            value={newBalanceInput} 
                            onChange={(e) => setNewBalanceInput(e.target.value)} 
                        />
                        <button 
                            style={{...styles.btn, background: '#10b981', height: '35px', padding: '0'}} 
                            onClick={async () => {
                                if(newBalanceInput === '') return alert("Please enter amount");
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { 
                                    method: 'PATCH', 
                                    body: JSON.stringify({ balance: Number(newBalanceInput) }) 
                                });
                                alert("Balance Updated!");
                                setSearchedUser({...searchedUser, balance: Number(newBalanceInput)});
                            }}
                        >UPDATE BALANCE</button>
                    </div>
                    
                    {/* --- WITHDRAW MANAGER WITHIN SEARCH --- */}
                    <div style={{marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px'}}>
                      <p style={{fontWeight: 'bold', color: '#000'}}>Withdraw History:</p>
                      {searchedUser.withdrawHistory && searchedUser.withdrawHistory.length > 0 ? (
                        searchedUser.withdrawHistory.map((h, idx) => (
                          <div key={idx} style={{background: '#fff', padding: '5px', margin: '5px 0', borderRadius: '5px', border: '1px solid #ccc'}}>
                            <p>Amt: {h.amount} | Status: <b style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status || 'Pending'}</b></p>
                            {h.status !== "Success" && (
                              <button 
                                style={{background: 'green', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'}}
                                onClick={async () => {
                                  const updatedHistory = [...searchedUser.withdrawHistory];
                                  updatedHistory[idx].status = "Success";
                                  await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { 
                                    method: 'PATCH', 
                                    body: JSON.stringify({ withdrawHistory: updatedHistory }) 
                                  });
                                  alert("Status updated to Success!");
                                  setSearchedUser({...searchedUser, withdrawHistory: updatedHistory});
                                }}
                              >SET SUCCESS</button>
                            )}
                          </div>
                        ))
                      ) : <p>No history found.</p>}
                    </div>

                    <button style={{...styles.btn, height: '30px', padding: '0', background: '#ef4444', fontSize: '10px', marginTop: '10px'}} onClick={() => setSearchedUser(null)}>CLOSE INFO</button>
                  </div>
                )}
                
                <hr style={{margin: '15px 0', border: '1px dashed #ccc'}}/>

                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background: 'green', marginBottom: '15px'}} onClick={async () => {
                   if(!adminTaskName || !adminTaskLink) return alert("Fill all fields");
                   const id = 't_'+Date.now();
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                   alert("Task Saved!"); fetchData();
                }}>SAVE TASK</button>

                <hr style={{margin:'15px 0'}}/>
                <input style={styles.input} placeholder="New Promo Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background: 'purple'}} onClick={async () => {
                   if(!adminPromoCode) return alert("Enter code");
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${adminPromoCode}.json`, { method: 'PUT', body: JSON.stringify({ code: adminPromoCode, reward: APP_CONFIG.CODE_REWARD }) });
                   alert("Code Created!"); setAdminPromoCode('');
                }}>CREATE CODE</button>

                <hr style={{margin:'15px 0'}}/>
                <h5 style={{color: '#0ea5e9'}}>GIVE VIP STATUS</h5>
                <input style={styles.input} placeholder="User ID" value={adminVipUserId} onChange={e => setAdminVipUserId(e.target.value)} />
                <button style={{...styles.btn, background: '#0ea5e9'}} onClick={async () => {
                   if(!adminVipUserId) return alert("Enter ID");
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${adminVipUserId}.json`, { method: 'PATCH', body: JSON.stringify({ isVip: true }) });
                   alert("User is now VIP!"); setAdminVipUserId('');
                }}>GIVE VIP</button>
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
            <div style={{background: '#f0f9ff', padding: '10px', borderRadius: '10px', border: '1px solid #0ea5e9', marginBottom: '15px'}}>
              <p style={{fontSize: '11px', margin: '5px 0'}}>Admin Wallet: <b>{APP_CONFIG.ADMIN_WALLET}</b></p>
              <button style={{...styles.btn, background: '#0ea5e9', padding: '5px', fontSize: '10px'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Copied!"); }}>COPY WALLET</button>
              <p style={{fontSize: '11px', margin: '10px 0 5px 0'}}>Memo (Your ID): <b>{APP_CONFIG.MY_UID}</b></p>
              <button style={{...styles.btn, background: '#0ea5e9', padding: '5px', fontSize: '10px'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Copied!"); }}>COPY MEMO</button>
            </div>
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
                setWithdrawHistory(newHistory); setBalance(newBal);
                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory }) });
                alert("Sent.");
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

      {activeNav === 'invite' && (
        <>
            <div style={styles.card}>
                <h3>Refer & Earn</h3>
                <p style={{fontSize: '14px', marginBottom: '10px'}}>Earn {APP_CONFIG.REFER_REWARD} TON per friend!</p>
                <button style={styles.btn} onClick={() => { 
                    navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); 
                    alert("Copied!"); 
                }}>COPY LINK</button>
            </div>
            <div style={styles.card}>
                <h3>Invite History</h3>
                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                    {referrals.map((r, i) => (
                        <div key={i} style={{fontSize: '12px', padding: '10px 0', borderBottom: '1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                            <span>User: {r.id || r}</span>
                            <span style={{color:'green'}}>+{APP_CONFIG.REFER_REWARD}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '10px 0'}}>Status: <b>{isVip ? "VIP ⭐" : "ACTIVE ✅"}</b></div>
          <div style={{padding: '10px 0'}}>User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '10px 0'}}>Balance: <b>{balance.toFixed(5)} TON</b></div>
          <div style={{padding: '10px 0'}}>Ads Watched: <b>{adsWatched}</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
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
