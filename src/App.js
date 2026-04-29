import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0009, 
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

  // Admin States
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminNewPromo, setAdminNewPromo] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  const triggerAdsSequence = useCallback(() => {
    if (tg?.openLink) {
      tg.openLink(APP_CONFIG.ADVERTICA_URL);
    } else {
      window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    }
    setLastAdClickTime(Date.now()); 
  }, []);

  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 7000) {
      alert("Please watch the advertisement for at least 7 seconds to unlock your reward!");
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
    } catch (e) { console.error("Data Fetch Error:", e); }
  }, []);

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
      } catch (e) { console.error("Referral Sync Error:", e); }
    }
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
    if (!checkAdStay()) return;

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    else if (id.startsWith('c_')) {
        if(completed.includes(id)) return alert("Code already claimed! Rewards are issued only once per code.");
        finalReward = APP_CONFIG.CODE_REWARD;
    }

    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
    const newCompleted = !isWatchAd ? [...completed, id] : completed;

    setBalance(newBal);
    if (isWatchAd) setAdsWatched(newAdsCount);
    setCompleted(newCompleted);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
    });
    
    alert(`Reward Collected: +${finalReward} TON`);
    setLastAdClickTime(0); 
    fetchData();
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    triggerAdsSequence();
    if (link) {
      setTimeout(() => {
        tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
      }, 500);
    }
    setTimeout(() => { processReward(id, reward); }, 2000);
  };

  const handleClaimClick = async () => {
    if(!rewardCodeInput) return alert("Please enter a promo code.");
    
    triggerAdsSequence(); 
    try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_codes/${rewardCodeInput}.json`);
        const codeData = await res.json();
        if(!codeData) return alert("Invalid or expired promo code!");

        setTimeout(() => {
          processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD);
        }, 2000);
    } catch(e) { alert("Verification failed. Check your connection."); }
  };

  const safeNavigate = (nav) => {
    if (activeNav === nav) return;
    if (!checkAdStay()) return;
    triggerAdsSequence();
    setActiveNav(nav);
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
      }
    } catch (e) { alert("Admin Update Error"); }
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
        <small style={{opacity: 0.8}}>Total Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 5px 0', fontWeight: 'bold'}}>Watch Video - Earn TON</p>
             <p style={{fontSize: '12px', color: '#facc15', marginBottom: '10px'}}>Reward: {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON per ad</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => handleTabChange(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (customTasks.filter(t => t.type === 'bot').length > 0 ? customTasks.filter(t => t.type === 'bot').map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{fontWeight:'bold'}}>{t.name}</span>
                  <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
                </div>
            )) : <p style={{textAlign:'center', fontSize:12}}>Check back later for new Bot tasks!</p>)}

            {activeTab === 'social' && (customTasks.filter(t => t.type === 'social').length > 0 ? customTasks.filter(t => t.type === 'social').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            )) : <p style={{textAlign:'center', fontSize:12}}>No Social tasks available right now.</p>)}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={handleClaimClick}>CLAIM REWARD</button>
              </div>
            )}
            
            {activeTab === 'admin' && (
              <div>
                <h4 style={{borderBottom: '2px solid #000', paddingBottom: '5px'}}>Admin Panel</h4>
                <h5 style={{color: '#f59e0b', margin: '15px 0 10px'}}>🔍 USER LOOKUP</h5>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="Telegram User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={async () => {
                      if(!searchUserId) return alert("Enter ID");
                      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                      const data = await res.json();
                      if(data) { setSearchedUser(data); setNewBalanceInput(data.balance || 0); } else alert("User not found in database!");
                    }}>FIND</button>
                </div>

                {searchedUser && (
                  <div style={{background: '#fffbeb', padding: '15px', borderRadius: '10px', border: '1px solid #f59e0b', fontSize: '13px', marginBottom: '20px'}}>
                    <p>💰 Balance: <b>{Number(searchedUser.balance || 0).toFixed(5)} TON</b></p>
                    <p>⭐ VIP Status: <b>{searchedUser.isVip ? "YES" : "NO"}</b></p>
                    <div style={{margin: '15px 0'}}>
                        <input style={styles.input} type="number" value={newBalanceInput} onChange={(e) => setNewBalanceInput(e.target.value)} />
                        <button style={{...styles.btn, background: '#10b981', marginBottom: 5}} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ balance: Number(newBalanceInput) }) });
                                alert("Balance updated successfully!"); setSearchedUser({...searchedUser, balance: Number(newBalanceInput)});
                            }}>UPDATE BALANCE</button>
                        <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ isVip: true }) });
                                alert("VIP Status granted!"); setSearchedUser({...searchedUser, isVip: true});
                            }}>GIVE VIP ACCESS</button>
                    </div>
                    <h5 style={{color: '#3b82f6'}}>WITHDRAWAL REQUESTS</h5>
                    <div style={{maxHeight: '120px', overflowY: 'auto', background: '#fff', border: '1px solid #ddd', padding: '5px'}}>
                      {searchedUser.withdrawHistory?.map((h, idx) => (
                        <div key={idx} style={{padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems:'center'}}>
                          <span style={{fontSize: 11}}>{h.amount} TON ({h.status})</span>
                          {h.status !== "Success" && (
                            <button style={{background: 'green', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: 10}} onClick={() => setSuccessStatus(searchUserId, idx)}>MARK SUCCESS</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button style={{...styles.btn, background: '#ef4444', marginTop: '10px'}} onClick={() => setSearchedUser(null)}>CLOSE PREVIEW</button>
                  </div>
                )}
                
                <hr/>
                <h5 style={{color: '#d946ef'}}>🎟️ CREATE PROMO</h5>
                <input style={styles.input} placeholder="Code Name" value={adminNewPromo} onChange={e => setAdminNewPromo(e.target.value)} />
                <button style={{...styles.btn, background: '#d946ef', marginBottom: 15}} onClick={async () => {
                   if(!adminNewPromo) return;
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_codes/${adminNewPromo}.json`, { method: 'PUT', body: JSON.stringify({ active: true }) });
                   alert("Promo code added!"); setAdminNewPromo('');
                }}>SAVE PROMO CODE</button>

                <h5 style={{color: 'green'}}>➕ ADD NEW TASK</h5>
                <input style={styles.input} placeholder="Display Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link (URL)" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, background: 'green'}} onClick={async () => {
                   const id = 't_'+Date.now();
                   await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { method: 'PUT', body: JSON.stringify({ id, name: adminTaskName, link: adminTaskLink, type: adminTaskType }) });
                   alert("New task published!"); setAdminTaskName(''); setAdminTaskLink(''); fetchData();
                }}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{color: '#0ea5e9'}}>💎 UPGRADE TO VIP</h3>
            <p style={{fontSize:13}}>Send payment to Admin Wallet:</p>
            <p style={{fontSize:11, wordBreak:'break-all'}}><b>{APP_CONFIG.ADMIN_WALLET}</b></p>
            <button style={{...styles.btn, background: '#0ea5e9'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Wallet Address Copied!"); }}>COPY WALLET</button>
            <p style={{fontSize:13, marginTop:10}}>Use your User ID as Memo:</p>
            <p><b>{APP_CONFIG.MY_UID}</b></p>
            <button style={{...styles.btn, background: '#0ea5e9'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Memo ID Copied!"); }}>COPY MEMO ID</button>
            <button style={{...styles.btn, background: '#0ea5e9', marginTop: 10}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT FOR ACTIVATION</button>
          </div>

          <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount (Minimum 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Destination TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background: '#3b82f6'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt < 0.1) return alert("Minimum withdrawal is 0.1 TON.");
                if(amt > balance) return alert("Insufficient balance in your account!");
                if(!withdrawAddress) return alert("Please provide a valid TON address.");

                const entry = { amount: withdrawAmount, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending' };
                const newHistory = [entry, ...withdrawHistory];
                const newBal = Number((balance - amt).toFixed(5));
                
                setBalance(newBal); setWithdrawHistory(newHistory);
                fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory }) });
                alert("Withdrawal request submitted! Processing may take up to 24-48 hours.");
                setWithdrawAmount(''); setWithdrawAddress('');
            }}>REQUEST WITHDRAWAL</button>
          </div>
          <div style={styles.card}>
            <h4>Transaction History</h4>
            {withdrawHistory.length === 0 ? <p style={{fontSize:12, color:'#999'}}>No transactions found.</p> : 
            withdrawHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{fontSize:11}}><b>{h.amount} TON</b><br/>{h.date}</div>
                <div style={{ color: h.status === 'Success' ? 'green' : 'orange', fontWeight: 'bold' }}>{h.status.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
            <h3>Referral Program</h3>
            <p style={{fontSize:13, marginBottom:15}}>Invite friends and earn **{APP_CONFIG.REFER_REWARD} TON** for each valid referral.</p>
            <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Referral Link Copied!"); }}>COPY REFERRAL LINK</button>
            <div style={{marginTop: 20}}>
                <h4 style={{borderBottom: '1px solid #000'}}>Referral History</h4>
                {referrals.length === 0 ? <p style={{fontSize: 12, color: '#666'}}>You haven't invited anyone yet.</p> : 
                    referrals.map((r, i) => (
                        <div key={i} style={{fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #eee'}}>
                            ✅ Referred User ID: <b>{r.id || r}</b>
                        </div>
                    ))
                }
            </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>User Profile</h3>
          <div style={{padding: '10px 0'}}>Account Status: <b>{isVip ? "VIP MEMBER ⭐" : "STANDARD MEMBER ✅"}</b></div>
          <div style={{padding: '10px 0'}}>Unique User ID: <b>{APP_CONFIG.MY_UID}</b></div>
          <div style={{padding: '10px 0'}}>Available Balance: <b>{balance.toFixed(5)} TON</b></div>
          <div style={{padding: '10px 0'}}>Ads Completed: <b>{adsWatched}</b></div>
          <button style={{...styles.btn, background: '#ef4444', marginTop: '20px'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>HELP & SUPPORT</button>
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
