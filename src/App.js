import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";

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
  AD_WAIT_TIME: 9, // 9 seconds
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  AD_LINK_2: "https://data527.click/a674e1237b7e268eb5f6/503a052ca1/?placementName=default"
};

const firebaseConfig = { databaseURL: APP_CONFIG.FIREBASE_URL };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
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
  
  // Anti-Cheat & Ad States
  const [isAdCooldown, setIsAdCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const pendingReward = useRef(null);
  const startTime = useRef(null);

  // Admin States
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState(APP_CONFIG.CODE_REWARD);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [manualRewardAmt, setManualRewardAmt] = useState('');

  const triggerDoubleAds = () => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.AD_LINK_2, '_blank');
  };

  // Secure Ad Watch Start
  const handleAdWatch = (rewardType, customAmt = 0) => {
    if (isAdCooldown) return;

    pendingReward.current = { type: rewardType, amt: customAmt };
    setIsAdCooldown(true);
    setTimeLeft(APP_CONFIG.AD_WAIT_TIME);
    startTime.current = Date.now();
    
    triggerDoubleAds();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Visibility Check (Anti-Cheat Logic)
  useEffect(() => {
    const handleCheck = () => {
      if (!document.hidden && isAdCooldown) {
        const elapsed = (Date.now() - startTime.current) / 1000;
        
        if (elapsed < APP_CONFIG.AD_WAIT_TIME) {
          // If returned too early
          alert(`Cheat Detected! Please wait ${Math.ceil(APP_CONFIG.AD_WAIT_TIME - elapsed)} more seconds in the ads page.`);
          triggerDoubleAds();
        } else if (timeLeft === 0) {
          // Successfully completed 9 seconds
          if (pendingReward.current) {
            processReward(pendingReward.current.type, pendingReward.current.amt);
            pendingReward.current = null;
            setIsAdCooldown(false);
            startTime.current = null;
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleCheck);
    return () => document.removeEventListener("visibilitychange", handleCheck);
  }, [isAdCooldown, timeLeft]);

  // Firebase Load Data
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
      } else {
        // Init new user
        set(userRef, { balance: 0, adsWatched: 0, completed: [], withdrawHistory: [] });
      }
    });

    onValue(ref(db, 'global_tasks'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCustomTasks(Object.keys(data).map(key => ({ ...data[key], firebaseKey: key })));
    });

    return () => unsubscribe();
  }, []);

  // Referral Handling
  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const isNewUser = !localStorage.getItem(`joined_v4_${APP_CONFIG.MY_UID}`);
    if (startParam && isNewUser && startParam !== APP_CONFIG.MY_UID) {
      const inviterRef = ref(db, `users/${startParam}`);
      get(inviterRef).then((snapshot) => {
        const inviterData = snapshot.val();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newReferralEntry = { id: APP_CONFIG.MY_UID, date: new Date().toLocaleString(), reward: APP_CONFIG.REFER_REWARD };
          const currentRefs = inviterData.referrals ? Object.values(inviterData.referrals) : [];
          update(inviterRef, { balance: newInviterBalance, referrals: [...currentRefs, newReferralEntry] });
          localStorage.setItem(`joined_v4_${APP_CONFIG.MY_UID}`, 'true');
        }
      });
    }
  }, []);

  useEffect(() => { handleReferral(); }, [handleReferral]);

  // Main Reward Process
  const processReward = (id, rewardAmount) => {
    let finalReward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    const newCompleted = (id !== 'watch_ad' && !id.startsWith('refer_') && !id.startsWith('code_')) ? [...completed, id] : completed;
    
    // Check for Promo code already used locally
    if (id.startsWith('code_') && completed.includes(id)) {
        alert("Code already used!");
        return;
    }

    const finalCompleted = id.startsWith('code_') ? [...completed, id] : newCompleted;

    update(ref(db, `users/${APP_CONFIG.MY_UID}`), { 
        balance: newBal, 
        completed: finalCompleted, 
        adsWatched: newAdsCount 
    });
    alert(`Reward Received: +${finalReward} TON`);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'Arial, sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '2px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 },
    taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch & Earn ({isVip ? 'VIP Mode' : 'Normal'})</p>
             <button disabled={isAdCooldown} style={{...styles.btn, background: isAdCooldown ? '#555' : '#facc15', color: '#000'}} onClick={() => handleAdWatch('watch_ad')}>
                {isAdCooldown ? `WAITING... ${timeLeft}s` : "WATCH ADS (9S)"}
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => { triggerDoubleAds(); setActiveTab(t.toLowerCase()); }} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '2px solid #000', fontSize:'11px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && (
                <div>
                    <div style={styles.taskRow}>
                        <span>Join Support Bot</span>
                        <button style={{padding:'5px 10px', background:'#000', color:'#fff', borderRadius:5}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>JOIN</button>
                    </div>
                </div>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button disabled={isAdCooldown} style={styles.btn} onClick={async () => {
                    const codeRef = ref(db, `promo_codes/${rewardCodeInput}`);
                    get(codeRef).then((snap) => {
                        const codeData = snap.val();
                        if(codeData && !completed.includes('code_'+rewardCodeInput)) {
                            handleAdWatch('code_'+rewardCodeInput, codeData.reward || APP_CONFIG.CODE_REWARD);
                        } else { alert("Invalid or Already Used Code!"); }
                    });
                }}>{isAdCooldown ? `WAIT ${timeLeft}s` : "CLAIM CODE"}</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4 style={{marginTop:0}}>Manage Users (Edit Balance)</h4>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={() => {
                      onValue(ref(db, `users/${searchUserId}`), (snap) => {
                          if(snap.val()) { 
                            setSearchedUser(snap.val()); 
                            setNewBalanceInput(snap.val().balance || 0); 
                          } else alert("Not Found");
                      }, { onlyOnce: true });
                  }}>FIND</button>
                </div>

                {searchedUser && (
                  <div style={{padding:10, background:'#eee', borderRadius:10, marginBottom:10, border:'1px solid #000'}}>
                    <p style={{fontSize:12, margin:'0 0 5px 0'}}>Editing ID: {searchUserId}</p>
                    <label style={{fontSize:10}}>Set Total Balance:</label>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    
                    <label style={{fontSize:10}}>Add Reward Amount (Bonus):</label>
                    <input style={styles.input} type="number" placeholder="Amt to add" value={manualRewardAmt} onChange={e => setManualRewardAmt(e.target.value)} />
                    
                    <div style={{display:'flex', gap:5}}>
                        <button style={{...styles.btn, background:'green', flex:1}} onClick={() => {
                            update(ref(db, `users/${searchUserId}`), { balance: Number(newBalanceInput) });
                            alert("Balance Set Successfully!");
                        }}>SET BALANCE</button>
                        
                        <button style={{...styles.btn, background:'blue', flex:1}} onClick={() => {
                            const bonus = Number(manualRewardAmt || 0);
                            const updatedBal = Number((Number(searchedUser.balance || 0) + bonus).toFixed(5));
                            update(ref(db, `users/${searchUserId}`), { balance: updatedBal });
                            alert(`Bonus +${bonus} added!`);
                        }}>ADD BONUS</button>
                    </div>
                  </div>
                )}
                <hr/>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} type="number" placeholder="Reward Amount" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={() => {
                    if(!adminPromoCode) return alert("Enter Code!");
                    set(ref(db, `promo_codes/${adminPromoCode}`), { code: adminPromoCode, reward: Number(adminPromoReward) });
                    alert("Custom Code Created: " + adminPromoCode);
                    setAdminPromoCode('');
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <>
            <div style={{...styles.card, background: '#000', color: '#fff', textAlign:'center'}}>
                <h3>Invite Friends</h3>
                <h4 style={{color:'#facc15'}}>1 Refer = {APP_CONFIG.REFER_REWARD} TON</h4>
                <button style={{...styles.btn, background:'#fff', color:'#000'}} onClick={() => {
                    const link = `https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`;
                    navigator.clipboard.writeText(link);
                    alert("Link Copied!");
                }}>COPY LINK</button>
            </div>
            <div style={styles.card}>
                <h4>Refer History ({referrals.length})</h4>
                {referrals.length === 0 ? <p style={{fontSize:12}}>No referrals yet.</p> : 
                referrals.map((r, i) => (
                    <div key={i} style={styles.taskRow}>
                        <span>ID: <b>{r.id}</b></span>
                        <span style={{color:'green', fontWeight:'bold'}}>+{r.reward} TON</span>
                    </div>
                ))}
            </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <p style={{fontSize:12}}>Min: {APP_CONFIG.MIN_WITHDRAW} TON</p>
            <input style={styles.input} placeholder="Amount" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Wallet Address (TON)" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={() => {
              const amt = parseFloat(withdrawAmount);
              if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw is ${APP_CONFIG.MIN_WITHDRAW}`);
              if (amt > balance) return alert("Insufficient balance!");
              if (withdrawAddress.length < 10) return alert("Invalid Address!");
              
              // Push to Admin/Withdraw node
              const reqId = Date.now();
              set(ref(db, `withdraw_requests/${reqId}`), {
                uid: APP_CONFIG.MY_UID,
                amount: amt,
                address: withdrawAddress,
                status: 'pending',
                date: new Date().toLocaleString()
              });
              
              // Deduct balance
              update(ref(db, `users/${APP_CONFIG.MY_UID}`), { balance: Number((balance - amt).toFixed(5)) });
              alert("Withdraw Sent! Admin will check in 24h.");
              setWithdrawAmount('');
            }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
            <div style={{textAlign:'center', marginBottom:20}}>
                <div style={{width:60, height:60, background:'#000', borderRadius:'50%', margin:'0 auto', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>👤</div>
                <h4>User ID: {APP_CONFIG.MY_UID}</h4>
                {isVip && <p style={{color:'orange', fontWeight:'bold'}}>⭐ VIP MEMBER</p>}
            </div>
            <div style={styles.taskRow}>
                <span>Ads Watched</span>
                <b>{adsWatched}</b>
            </div>
            <div style={styles.taskRow}>
                <span>Total Refers</span>
                <b>{referrals.length}</b>
            </div>
            <button style={{...styles.btn, marginTop:20, background:'red'}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>CONTACT SUPPORT</button>
        </div>
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
