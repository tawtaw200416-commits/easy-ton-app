import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";

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
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  AD_LINK_2: "https://data527.click/a674e1237b7e268eb5f6/503a052ca1/?placementName=default"
};

// Firebase Config (Using URL directly as you have it)
const db = getDatabase(initializeApp({ databaseURL: APP_CONFIG.FIREBASE_URL }));

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
  
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

  const triggerDoubleAds = () => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.AD_LINK_2, '_blank');
  };

  // Real-time Sync from Firebase
  useEffect(() => {
    const userRef = ref(db, `users/${APP_CONFIG.MY_UID}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBalance(Number(data.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!data.isVip);
        setCompleted(data.completed || []);
        setWithdrawHistory(data.withdrawHistory || []);
        setReferrals(data.referrals ? Object.values(data.referrals) : []);
        setAdsWatched(data.adsWatched || 0);
      }
    });

    const tasksRef = ref(db, 'global_tasks');
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCustomTasks(Object.keys(data).map(key => ({ ...data[key], firebaseKey: key })));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const isNewUser = !localStorage.getItem(`joined_${APP_CONFIG.MY_UID}`);
    if (startParam && isNewUser && startParam !== APP_CONFIG.MY_UID) {
      const inviterRef = ref(db, `users/${startParam}`);
      onValue(inviterRef, (snapshot) => {
        const inviterData = snapshot.val();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newInviterRefs = inviterData.referrals ? [...Object.values(inviterData.referrals), { id: APP_CONFIG.MY_UID }] : [{ id: APP_CONFIG.MY_UID }];
          update(inviterRef, { balance: newInviterBalance, referrals: newInviterRefs });
          localStorage.setItem(`joined_${APP_CONFIG.MY_UID}`, 'true');
        }
      }, { onlyOnce: true });
    }
  }, []);

  useEffect(() => { handleReferral(); }, [handleReferral]);

  const processReward = (id, rewardAmount) => {
    triggerDoubleAds();
    let finalReward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    
    const giveReward = () => {
        const newBal = Number((balance + finalReward).toFixed(5));
        const newAdsCount = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
        const newCompleted = id !== 'watch_ad' ? [...completed, id] : completed;
        
        update(ref(db, `users/${APP_CONFIG.MY_UID}`), { 
            balance: newBal, 
            completed: newCompleted, 
            adsWatched: newAdsCount 
        });
        alert(`Reward Success: +${finalReward} TON`);
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show().then((result) => { if (result.done) giveReward(); });
    } else { giveReward(); }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    triggerDoubleAds();
    if (link) tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const checkStatus = (h) => {
    if (h.status === "Success") return "Success";
    if (Date.now() - h.timestamp >= 300000) return "Success";
    return "Pending";
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
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => { triggerDoubleAds(); setActiveTab(t.toLowerCase()); }} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                    const codeRef = ref(db, `promo_codes/${rewardCodeInput}`);
                    onValue(codeRef, (snap) => {
                        const codeData = snap.val();
                        if(codeData && !completed.includes('code_'+rewardCodeInput)) {
                            processReward('code_'+rewardCodeInput, APP_CONFIG.CODE_REWARD);
                        } else { alert("Invalid or Already Used Code!"); }
                    }, { onlyOnce: true });
                }}>CLAIM CODE</button>
              </div>
            )}
            {activeTab === 'admin' && (
              <div>
                <h4>Admin - Manage Users</h4>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={() => {
                      onValue(ref(db, `users/${searchUserId}`), (snap) => {
                          if(snap.val()) { setSearchedUser(snap.val()); setNewBalanceInput(snap.val().balance || 0); } else alert("Not Found");
                      }, { onlyOnce: true });
                  }}>FIND</button>
                </div>
                {searchedUser && (
                  <div style={{padding:10, background:'#eee', borderRadius:10, marginBottom:10}}>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={() => {
                        update(ref(db, `users/${searchUserId}`), { balance: Number(newBalanceInput) });
                        alert("Balance Updated!");
                    }}>UPDATE BALANCE</button>
                  </div>
                )}
                <hr/>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="New Code" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={() => {
                    set(ref(db, `promo_codes/${adminPromoCode}`), { code: adminPromoCode, reward: APP_CONFIG.CODE_REWARD });
                    alert("Code Created: " + adminPromoCode);
                    setAdminPromoCode('');
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3>Deposit 1 TON (VIP)</h3>
            <div style={{fontSize:12, background:'#f0f0f0', padding:10, borderRadius:10}}>
                Address: <b>{APP_CONFIG.ADMIN_WALLET}</b><br/>
                Memo: <b>{APP_CONFIG.MY_UID}</b>
            </div>
            <button style={{...styles.btn, background:'#0ea5e9', marginTop:10}} onClick={() => {
                navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET);
                alert("Address Copied! Don't forget Memo: " + APP_CONFIG.MY_UID);
            }}>COPY ADDRESS</button>
          </div>
          <div style={styles.card}>
            <h3>Withdraw</h3>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => {
                const amt = Number(withdrawAmount);
                if(amt >= 0.1 && amt <= balance) {
                    const entry = { amount: amt, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString(), status: 'Pending' };
                    update(ref(db, `users/${APP_CONFIG.MY_UID}`), { 
                        balance: Number((balance - amt).toFixed(5)),
                        withdrawHistory: [entry, ...withdrawHistory]
                    });
                    alert("Request Sent!");
                } else { alert("Invalid Amount/Balance"); }
            }}>WITHDRAW</button>
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <>
            <div style={styles.card}>
                <h3>Invite Friends</h3>
                <button style={styles.btn} onClick={() => {
                    navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
                    alert("Invite Link Copied!");
                }}>COPY LINK</button>
            </div>
            <div style={styles.card}>
                <h4>Invite History ({referrals.length})</h4>
                {referrals.map((r, i) => (
                    <div key={i} style={{fontSize:12, padding:5, borderBottom:'1px solid #eee'}}>
                        Joined User ID: <b>{r.id || r}</b> <span style={{color:'green'}}>+0.001 TON</span>
                    </div>
                ))}
            </div>
        </>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => { triggerDoubleAds(); setActiveNav(n); }} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
