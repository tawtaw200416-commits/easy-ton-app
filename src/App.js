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
  VIP_PRICE: 1.0,
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

// Fixed Task Lists
const fixedBotTasks = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  { id: 'b3', name: "Workers On Ton", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
  { id: 'b4', name: "Easy Bonus Code", link: "https://t.me/easybonuscode_bot?start=1793453606" },
  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
];

const fixedSocialTasks = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
];

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastActionTime, setLastActionTime] = useState(0);
  const [showClaimId, setShowClaimId] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [lastSpinTime, setLastSpinTime] = useState(() => Number(localStorage.getItem(`last_spin_${APP_CONFIG.MY_UID}`)) || 0);

  // Form states
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [newVipStatus, setNewVipStatus] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Fetch Data Logic with Persistence Support
  const fetchData = useCallback(async () => {
    try {
      const [u, t, p, all] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();
      const promoData = await p.json();
      const allData = await all.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(userData.isVip || VIP_IDS.includes(APP_CONFIG.MY_UID));
        setAdsWatched(userData.adsWatched || 0);
        setWithdrawHistory(userData.withdrawHistory || []);
        setCompleted(userData.completedTasks || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
      } else {
        // Initialize new user in Firebase if doesn't exist
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: 0, adsWatched: 0, completedTasks: [], isVip: VIP_IDS.includes(APP_CONFIG.MY_UID) })
        });
      }
      
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (promoData) setPromoCodes(Object.keys(promoData).map(k => ({ code: k, reward: promoData[k] })));
      if (allData) setAllUsers(Object.keys(allData).map(key => ({ id: key, ...allData[key] })));
      
    } catch (e) { 
      console.error("Fetch error", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  const triggerAds = useCallback(() => {
    const adToOpen = Math.random() < 0.5 ? APP_CONFIG.ADVERTICA_URL : APP_CONFIG.ADSTERRA_URL;
    window.open(adToOpen, '_blank');
    setLastActionTime(Date.now()); 
  }, []);

  const handleAction = (callback) => {
    if (APP_CONFIG.MY_UID === "1793453606") return callback();
    const elapsed = (Date.now() - lastActionTime) / 1000;
    if (lastActionTime === 0 || elapsed < 12) {
      alert(`Please visit the sponsor ad for 12 seconds first!`);
      triggerAds();
      return;
    }
    callback();
    setLastActionTime(0);
  };

  const processReward = async (id, amt) => {
    const rewardAmt = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : amt;
    const newBal = Number((balance + rewardAmt).toFixed(5));
    const newAdsWatched = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    const newComp = [...completed, id];

    setBalance(newBal);
    if (id === 'watch_ad') setAdsWatched(newAdsWatched);
    if (id !== 'watch_ad' && !id.startsWith('spin_')) {
      setCompleted(newComp);
      setShowClaimId(null);
    }

    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH', 
        body: JSON.stringify({ 
          balance: newBal, 
          adsWatched: newAdsWatched,
          completedTasks: (id !== 'watch_ad' && !id.startsWith('spin_')) ? newComp : completed 
        })
      });
      alert(`Success! Reward of ${rewardAmt} TON added.`);
    } catch (e) {
      alert("Network error. Please try again.");
    }
  };

  const handleSpin = () => {
    const now = Date.now();
    const cooldown = 2 * 60 * 60 * 1000;
    if (now - lastSpinTime < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastSpinTime)) / 60000);
        return alert(`Lucky wheel cooldown: ${remaining} minutes left.`);
    }
    handleAction(() => {
        setIsSpinning(true);
        const newDeg = spinDeg + 1800 + Math.floor(Math.random() * 360);
        setSpinDeg(newDeg);
        setTimeout(() => {
            setIsSpinning(false);
            setLastSpinTime(Date.now());
            localStorage.setItem(`last_spin_${APP_CONFIG.MY_UID}`, Date.now()); 
            processReward('spin_' + Date.now(), 0.0001);
        }, 4000);
    });
  };

  const startTask = (id, link) => {
    handleAction(() => {
        window.open(link, '_blank');
        setTimeout(() => setShowClaimId(id), 2000);
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif', color: '#000' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    smBtn: (bg) => ({ padding: '8px 12px', background: bg || '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    wheelContainer: { position: 'relative', width: '240px', height: '240px', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    wheel: { width: '100%', height: '100%', borderRadius: '50%', border: '5px solid #000', position: 'relative', overflow: 'hidden', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', background: '#fff' },
    wheelPointer: { position: 'absolute', top: '-10px', zIndex: 10, width: '0', height: '0', borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '25px solid red' }
  };

  if (isLoading) return <div style={{...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2>Loading Profile...</h2></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>TOTAL BALANCE</small>
        <h1 style={{fontSize: '36px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        {isVip && <div style={{background:'#facc15', color:'#000', padding:'3px 12px', borderRadius:20, display:'inline-block', fontSize:11, fontWeight:'bold', marginBottom: 10}}>VIP MEMBER ⭐</div>}
        <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAds(); setTimeout(() => processReward('watch_ad', 0), 1000); }}>
          WATCH VIDEO AD (+{isVip ? '0.0008' : '0.0004'})
        </button>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize: '12px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && [...(activeTab === 'bot' ? fixedBotTasks : fixedSocialTasks), ...customTasks.filter(ct => ct.type === activeTab)].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{opacity: completed.includes(t.id || t.firebaseKey) ? 0.5 : 1, fontSize: '14px', fontWeight: '500'}}>{t.name}</span>
                {completed.includes(t.id || t.firebaseKey) ? (
                    <span style={{color:'green', fontWeight:'bold', fontSize:11}}>COMPLETED ✅</span>
                ) : (
                    <div style={{display:'flex', gap:5}}>
                        {showClaimId === (t.id || t.firebaseKey) ? (
                            <button onClick={() => processReward(t.id || t.firebaseKey, 0.001)} style={styles.smBtn('#22c55e')}>CLAIM</button>
                        ) : (
                            <button onClick={() => startTask(t.id || t.firebaseKey, t.link)} style={styles.smBtn()}>START</button>
                        )}
                    </div>
                )}
              </div>
            ))}

            {activeTab === 'reward' && (
              <div style={{textAlign: 'center'}}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={{...styles.btn, marginBottom: '25px'}} onClick={() => handleAction(() => {
                  const found = promoCodes.find(c => c.code === rewardCodeInput);
                  if(found) processReward(`promo_${rewardCodeInput}`, found.reward); else alert("Invalid Code");
                })}>REDEEM CODE</button>
                
                <div style={{borderTop: '2px solid #eee', paddingTop: '20px'}}>
                    <h3 style={{margin: 0}}>Lucky Wheel</h3>
                    <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>Win up to 0.3 TON every 2 hours!</p>
                    <div style={styles.wheelContainer}>
                        <div style={styles.wheelPointer}></div>
                        <div style={{...styles.wheel, transform: `rotate(${spinDeg}deg)`}}>
                            {[
                                { t: '0.1 TON', c: '#facc15' }, { t: 'EMPTY', c: '#000' }, { t: '0.3 TON', c: '#facc15' }, { t: '0.0001', c: '#000' }, { t: '0.001', c: '#facc15' }, { t: '0.01', c: '#000' }
                            ].map((s, i) => (
                                <div key={i} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${i * 60}deg)`, clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)', background: s.c, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                                    <span style={{ color: s.c === '#000' ? '#fff' : '#000', fontSize: '9px', fontWeight: 'bold', marginTop: '35px', transform: 'rotate(30deg)', width: '60px', textAlign: 'center' }}>{s.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button disabled={isSpinning} style={{...styles.btn, background: isSpinning ? '#666' : '#000'}} onClick={handleSpin}>{isSpinning ? 'SPINNING...' : 'SPIN NOW'}</button>
                </div>
              </div>
            )}
            
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
                <div style={{fontSize: '13px'}}>
                    <h4 style={{borderBottom: '1px solid #000'}}>Admin Control Panel</h4>
                    <p>Total Users: {allUsers.length}</p>
                    <input style={styles.input} placeholder="Search User UID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                    <button style={styles.btn} onClick={async () => {
                        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`);
                        const data = await res.json();
                        if(data) { setSearchedUser(data); setNewBalanceInput(data.balance); } else alert("Not found");
                    }}>FIND USER</button>
                    {searchedUser && (
                        <div style={{marginTop: 10, padding: 10, background: '#eee', borderRadius: 8}}>
                            <p>Current: {searchedUser.balance} TON</p>
                            <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                            <button style={styles.btn} onClick={async () => {
                                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${searchUserId}.json`, { method: 'PATCH', body: JSON.stringify({balance: Number(newBalanceInput)}) });
                                alert("Updated!"); fetchData();
                            }}>UPDATE BALANCE</button>
                        </div>
                    )}
                </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'rank' && (
        <div style={styles.card}>
          <div style={{textAlign: 'center', background: '#000', color: '#facc15', padding: '15px', borderRadius: '12px', marginBottom: '10px'}}>
              <h3 style={{margin: 0}}>GLOBAL RANKING</h3>
              <small>Season 1 Leaderboard</small>
          </div>
          <div style={{maxHeight: '380px', overflowY: 'auto'}}>
              <table style={{width: '100%', fontSize: '12px', borderCollapse: 'collapse'}}>
                  <thead style={{background: '#eee'}}>
                      <tr>
                          <th style={{padding: '8px'}}>#</th>
                          <th style={{padding: '8px', textAlign:'left'}}>User ID</th>
                          <th style={{padding: '8px', textAlign:'right'}}>Balance</th>
                      </tr>
                  </thead>
                  <tbody>
                      {allUsers.sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 30).map((u, i) => (
                          <tr key={i} style={{borderBottom: '1px solid #eee', background: u.id === APP_CONFIG.MY_UID ? '#fff9c4' : 'transparent'}}>
                              <td style={{padding: '10px', textAlign: 'center'}}>{i+1}</td>
                              <td style={{padding: '10px'}}>{u.id.slice(0,6)}... {u.isVip && '⭐'}</td>
                              <td style={{padding: '10px', textAlign: 'right', fontWeight: 'bold'}}>{(u.balance || 0).toFixed(4)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Refer & Earn</h3>
          <p style={{fontSize: '14px'}}>Invite friends and get <b>{APP_CONFIG.REFER_REWARD} TON</b> each!</p>
          <div style={{background: '#f8f9fa', padding: '10px', borderRadius: '8px', wordBreak: 'break-all', fontSize: '11px', marginBottom: '10px', border: '1px dashed #000'}}>
              https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={styles.btn} onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Link copied!"); }}>COPY LINK</button>
          <h4 style={{marginTop: 20}}>Referral Stats: {referrals.length} friends</h4>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{marginTop: 0}}>Withdraw TON</h3>
          <p style={{fontSize: '12px', color: '#666'}}>Minimum withdrawal: {APP_CONFIG.MIN_WITHDRAW} TON</p>
          <input style={styles.input} placeholder="TON Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background: '#3b82f6'}} onClick={async () => {
              const amt = Number(withdrawAmount);
              if(amt < APP_CONFIG.MIN_WITHDRAW || amt > balance) return alert("Invalid amount or insufficient balance.");
              if(!withdrawAddress) return alert("Please enter wallet address.");
              
              const newHistory = [{ amount: amt, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
              await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { 
                method:'PATCH', body: JSON.stringify({ balance: Number((balance - amt).toFixed(5)), withdrawHistory: newHistory })
              });
              alert("Withdrawal request submitted!"); fetchData();
          }}>SUBMIT REQUEST</button>
          
          <h4 style={{marginTop: 20}}>Recent Activity</h4>
          {withdrawHistory.map((h, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #eee', fontSize: '12px'}}>
                  <span>{h.amount} TON</span>
                  <span style={{color: h.status === 'Success' ? 'green' : 'orange', fontWeight: 'bold'}}>{h.status}</span>
              </div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center'}}>My Account</h3>
          <div style={{padding: '15px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee'}}>
              <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
              <p>Type: <b>{isVip ? "VIP Membership" : "Standard Tier"}</b></p>
              <p>Ads Watched: <b>{adsWatched}</b></p>
          </div>
          <button style={{...styles.btn, marginTop: 15, background: '#ef4444'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>GET SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'rank', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
