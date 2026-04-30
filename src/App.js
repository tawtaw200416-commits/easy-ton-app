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
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  AD_LINK_2: "https://data527.click/a674e1237b7e268eb5f6/503a052ca1/?placementName=default"
};

const db = getDatabase(initializeApp({ databaseURL: APP_CONFIG.FIREBASE_URL }));
const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('reward');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  
  // Timer & Anti-Cheat States
  const [isAdCooldown, setIsAdCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const pendingReward = useRef(null);

  // Admin States
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState(APP_CONFIG.CODE_REWARD);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  const triggerDoubleAds = () => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.AD_LINK_2, '_blank');
  };

  const handleAdWatch = (rewardType, customAmt = 0) => {
    if (isAdCooldown) return;
    pendingReward.current = { type: rewardType, amt: customAmt };
    triggerDoubleAds();
    setIsAdCooldown(true);
    setTimeLeft(9);

    if (timerRef.current) clearInterval(timerRef.current);
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

  // Visibility Check (Strict Anti-Cheat)
  useEffect(() => {
    const handleCheck = () => {
      if (!document.hidden && isAdCooldown) {
        if (timeLeft > 0) {
          alert(`Cheat Detected! Please watch the ad for ${timeLeft} more seconds.`);
          triggerDoubleAds(); 
        } else if (timeLeft === 0 && pendingReward.current) {
          processReward(pendingReward.current.type, pendingReward.current.amt);
          pendingReward.current = null;
          setIsAdCooldown(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleCheck);
    return () => document.removeEventListener("visibilitychange", handleCheck);
  }, [isAdCooldown, timeLeft]);

  // Sync Data from Firebase
  useEffect(() => {
    const userRef = ref(db, `users/${APP_CONFIG.MY_UID}`);
    return onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBalance(Number(data.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!data.isVip);
        setCompleted(data.completed || []);
        setReferrals(data.referrals ? Object.values(data.referrals) : []);
        setAdsWatched(data.adsWatched || 0);
      }
    });
  }, []);

  // Referral Handling Logic
  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const storageKey = `joined_v8_${APP_CONFIG.MY_UID}`;
    if (startParam && !localStorage.getItem(storageKey) && startParam !== APP_CONFIG.MY_UID) {
      const inviterRef = ref(db, `users/${startParam}`);
      get(inviterRef).then((snapshot) => {
        const inviterData = snapshot.val();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newReferralEntry = { id: APP_CONFIG.MY_UID, date: new Date().toLocaleString(), reward: APP_CONFIG.REFER_REWARD };
          const currentRefs = inviterData.referrals ? Object.values(inviterData.referrals) : [];
          
          update(inviterRef, { 
            balance: newInviterBalance, 
            referrals: [...currentRefs, newReferralEntry] 
          });
          localStorage.setItem(storageKey, 'true');
        }
      });
    }
  }, []);

  useEffect(() => { handleReferral(); }, [handleReferral]);

  const processReward = (id, rewardAmount) => {
    let finalReward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    const newCompleted = (id !== 'watch_ad' && !id.startsWith('refer_')) ? [...completed, id] : completed;
    
    update(ref(db, `users/${APP_CONFIG.MY_UID}`), { 
        balance: newBal, 
        completed: newCompleted, 
        adsWatched: newAdsCount 
    });
    alert(`Success! +${finalReward} TON added to your balance.`);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
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
             <button disabled={isAdCooldown} style={{...styles.btn, background: isAdCooldown ? '#444' : '#facc15', color: '#000'}} onClick={() => handleAdWatch('watch_ad')}>
                {isAdCooldown ? `Wait... (${timeLeft}s)` : "WATCH ADS"}
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          {activeTab === 'reward' && (
            <div style={styles.card}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button disabled={isAdCooldown} style={styles.btn} onClick={async () => {
                    const snap = await get(ref(db, `promo_codes/${rewardCodeInput}`));
                    if(snap.exists() && !completed.includes('code_'+rewardCodeInput)) {
                        handleAdWatch('code_'+rewardCodeInput, snap.val().reward);
                    } else { alert("Invalid or already used code!"); }
                }}>CLAIM CODE</button>
            </div>
          )}

          {activeTab === 'admin' && (
            <div style={styles.card}>
                <h4>Admin - Manage Users</h4>
                <div style={{display:'flex', gap:5, marginBottom: 10}}>
                  <input style={styles.input} placeholder="Search User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width:80, background: '#f59e0b'}} onClick={async () => {
                     const snap = await get(ref(db, `users/${searchUserId}`));
                     if(snap.exists()) { setSearchedUser(snap.val()); setNewBalanceInput(snap.val().balance); } else alert("User not found!");
                  }}>FIND</button>
                </div>
                {searchedUser && (
                  <div style={{background:'#eee', padding:10, borderRadius:10, marginBottom:10}}>
                    <p style={{fontSize: 11, margin: '0 0 5px 0'}}>Editing ID: {searchUserId}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={() => {
                        update(ref(db, `users/${searchUserId}`), {balance: Number(newBalanceInput)});
                        alert("Balance updated successfully!");
                    }}>UPDATE BALANCE</button>
                  </div>
                )}
                <hr/>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} type="number" placeholder="Reward Amount" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={() => {
                    if(!adminPromoCode) return alert("Enter Code Name!");
                    set(ref(db, `promo_codes/${adminPromoCode}`), { reward: Number(adminPromoReward) });
                    alert("New Promo Code Created!");
                    setAdminPromoCode('');
                }}>SAVE PROMO CODE</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <>
            <div style={{...styles.card, background: '#000', color: '#fff', textAlign:'center'}}>
                <h3>Invite Friends</h3>
                <h4 style={{color:'#facc15'}}>1 Refer = 0.001 TON</h4>
                <button style={{...styles.btn, background:'#fff', color:'#000'}} onClick={() => {
                    navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
                    alert("Invite link copied!");
                }}>COPY LINK</button>
            </div>
            <div style={styles.card}>
                <h4>Referral History ({referrals.length})</h4>
                {referrals.length === 0 ? <p style={{fontSize: 12}}>No referrals yet.</p> : 
                  referrals.map((r, i) => (
                    <div key={i} style={{padding:8, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', fontSize:11}}>
                        <span>ID: <b>{r.id}</b></span>
                        <span style={{color:'green', fontWeight:'bold'}}>+0.001 TON</span>
                    </div>
                ))}
            </div>
        </>
      )}

      {activeNav === 'profile' && (
        <>
            <div style={styles.card}>
                <h3>💎 VIP UPGRADE</h3>
                <p style={{fontSize: 12}}>Deposit 1 TON to become a VIP member.</p>
                <p style={{fontSize: 10, color: '#666', marginTop: 10}}>Admin Wallet:</p>
                <div style={{display:'flex', gap: 5}}>
                    <input style={styles.input} readOnly value={APP_CONFIG.ADMIN_WALLET} />
                    <button style={{...styles.btn, width: 80}} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Wallet Copied!");}}>COPY</button>
                </div>
                <p style={{fontSize: 10, color: '#666'}}>Memo (User ID):</p>
                <div style={{display:'flex', gap: 5}}>
                    <input style={styles.input} readOnly value={APP_CONFIG.MY_UID} />
                    <button style={{...styles.btn, width: 80}} onClick={() => {navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("ID Copied!");}}>COPY</button>
                </div>
                <button style={styles.btn}>VERIFY PAYMENT</button>
            </div>

            <div style={styles.card}>
                <h3>Withdraw Funds</h3>
                <input style={styles.input} placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                <input style={styles.input} placeholder="Your TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if (parseFloat(withdrawAmount) < APP_CONFIG.MIN_WITHDRAW) alert(`Minimum withdrawal is ${APP_CONFIG.MIN_WITHDRAW} TON`);
                  else if (parseFloat(withdrawAmount) > balance) alert("Insufficient balance!");
                  else alert("Withdrawal request sent successfully!");
                }}>WITHDRAW NOW</button>
            </div>
        </>
      )}

      {activeNav === 'withdraw' && (
          <div style={styles.card}>
              <h3>Withdrawal History</h3>
              <p style={{fontSize: 12, textAlign:'center', color: '#999'}}>No history found.</p>
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
