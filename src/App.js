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
  // --- EXISTING STATES (မဖျက်ပါ) ---
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
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  // --- NEW ADS MANAGER STATES ---
  const [adsgramBlockId, setAdsgramBlockId] = useState("27611");
  const [otherAdsList, setOtherAdsList] = useState([]); // Array of links
  const [newAdInput, setNewAdInput] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_config.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const adsConfig = await a.json();

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

      if (adsConfig) {
        setAdsgramBlockId(adsConfig.adsgramId || "27611");
        setOtherAdsList(adsConfig.otherLinks || []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  // Ads တွေကို Database မှာသိမ်းဖို့ function
  const saveAdsConfig = async (newId, newList) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_config.json`, {
      method: 'PUT',
      body: JSON.stringify({ adsgramId: newId, otherLinks: newList })
    });
    alert("Ads Config Saved!");
  };

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';

    if (isWatchAd) {
      finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
      // Other Ads Link တွေရှိရင် တစ်ခါတည်း ဖွင့်ပေးမယ်
      if (otherAdsList.length > 0) {
        otherAdsList.forEach(link => window.open(link, '_blank'));
      }
    }

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: adsgramBlockId });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${finalReward} TON`);
        }
      });
    }
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
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && (
              <div>
                <h4 style={{borderBottom: '2px solid #000', paddingBottom: '5px'}}>Admin Control</h4>
                
                {/* --- NEW: CUSTOM ADS MANAGER --- */}
                <div style={{padding: '10px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #16a34a', marginBottom: '20px'}}>
                  <h5 style={{margin: '0 0 10px 0', color: '#16a34a'}}>📢 ADS MANAGER</h5>
                  
                  <label style={{fontSize: '12px', fontWeight: 'bold'}}>Adsgram Block ID:</label>
                  <input style={styles.input} value={adsgramBlockId} onChange={e => setAdsgramBlockId(e.target.value)} />
                  
                  <label style={{fontSize: '12px', fontWeight: 'bold'}}>Other Ad Links (Adsterra, etc):</label>
                  <div style={{display: 'flex', gap: '5px'}}>
                    <input style={styles.input} placeholder="https://..." value={newAdInput} onChange={e => setNewAdInput(e.target.value)} />
                    <button style={{...styles.btn, width: '60px', height: '40px', background: '#16a34a'}} onClick={() => {
                        if(!newAdInput) return;
                        setOtherAdsList([...otherAdsList, newAdInput]);
                        setNewAdInput('');
                    }}>+</button>
                  </div>
                  
                  <div style={{maxHeight: '100px', overflowY: 'auto', marginBottom: '10px'}}>
                    {otherAdsList.map((link, idx) => (
                      <div key={idx} style={{display:'flex', justifyContent:'space-between', background:'#fff', padding:'5px', borderRadius:'5px', marginBottom:'3px', fontSize:'10px', border:'1px solid #ddd'}}>
                        <span style={{overflow:'hidden'}}>{link}</span>
                        <button style={{color:'red', border:'none', background:'none'}} onClick={() => setOtherAdsList(otherAdsList.filter((_, i) => i !== idx))}>X</button>
                      </div>
                    ))}
                  </div>
                  
                  <button style={{...styles.btn, background: '#16a34a'}} onClick={() => saveAdsConfig(adsgramBlockId, otherAdsList)}>SAVE ADS CONFIG</button>
                </div>

                {/* --- EXISTING USER SEARCH & BALANCE MANAGER (မဖျက်ပါ) --- */}
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
                    <p>💰 Balance: <b>{Number(searchedUser.balance || 0).toFixed(5)} TON</b></p>
                    <div style={{margin: '10px 0'}}>
                        <input style={styles.input} type="number" value={newBalanceInput} onChange={(e) => setNewBalanceInput(e.target.value)} />
                        <button style={{...styles.btn, background: '#10b981'}} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { 
                                    method: 'PATCH', 
                                    body: JSON.stringify({ balance: Number(newBalanceInput) }) 
                                });
                                alert("Balance Updated!");
                                setSearchedUser({...searchedUser, balance: Number(newBalanceInput)});
                            }}>UPDATE BALANCE</button>
                    </div>
                    
                    <p>Withdraw History:</p>
                    {searchedUser.withdrawHistory?.map((h, idx) => (
                      <div key={idx} style={{background: '#fff', padding: '5px', margin: '5px 0', border: '1px solid #ccc'}}>
                        <span>{h.amount} TON - {h.status}</span>
                        {h.status !== "Success" && (
                          <button onClick={async () => {
                            const updated = [...searchedUser.withdrawHistory];
                            updated[idx].status = "Success";
                            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({ withdrawHistory: updated }) });
                            alert("Success!"); fetchData();
                          }}>SET SUCCESS</button>
                        )}
                      </div>
                    ))}
                    <button style={{...styles.btn, background: '#ef4444', height: '30px', marginTop:'5px'}} onClick={() => setSearchedUser(null)}>CLOSE</button>
                  </div>
                )}
                
                <hr style={{margin: '15px 0'}}/>
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
              </div>
            )}
            
            {/* Bot, Social, Reward tabs contents go here (same as before) */}
          </div>
        </>
      )}

      {/* Nav bar remains the same */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>{n.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

export default App;
