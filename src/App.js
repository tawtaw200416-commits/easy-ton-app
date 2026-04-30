import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, get } from "firebase/database";

// Safety check for Telegram WebApp
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  AD_LINK_2: "https://data527.click/a674e1237b7e268eb5f6/503a052ca1/?placementName=default"
};

// Initialize Firebase safely
const firebaseApp = initializeApp({ databaseURL: APP_CONFIG.FIREBASE_URL });
const db = getDatabase(firebaseApp);
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
  
  const [isAdCooldown, setIsAdCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const pendingReward = useRef(null);

  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState(APP_CONFIG.CODE_REWARD);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // Expand Telegram WebApp on Load
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const triggerAds = () => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.AD_LINK_2, '_blank');
  };

  const handleAdWatch = (rewardType, customAmt = 0) => {
    if (isAdCooldown) return;
    pendingReward.current = { type: rewardType, amt: customAmt };
    triggerAds();
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

  const processReward = useCallback((id, rewardAmount) => {
    let finalReward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    const newCompleted = (id !== 'watch_ad' && !id.startsWith('refer_')) ? [...completed, id] : completed;
    
    update(ref(db, `users/${APP_CONFIG.MY_UID}`), { 
        balance: newBal, 
        completed: newCompleted, 
        adsWatched: newAdsCount 
    }).then(() => {
        alert(`Success! +${finalReward} TON added.`);
    }).catch(err => alert("Sync Error: " + err.message));
  }, [balance, adsWatched, completed, isVip]);

  // Visibility Check (Strict Anti-Cheat)
  useEffect(() => {
    const handleCheck = () => {
      if (!document.hidden && isAdCooldown) {
        if (timeLeft > 0) {
          alert(`Don't leave! You must wait ${timeLeft} more seconds.`);
          triggerAds(); 
        } else if (timeLeft === 0 && pendingReward.current) {
          processReward(pendingReward.current.type, pendingReward.current.amt);
          pendingReward.current = null;
          setIsAdCooldown(false);
        }
      }
    };
    document.addEventListener("visibilitychange", handleCheck);
    return () => document.removeEventListener("visibilitychange", handleCheck);
  }, [isAdCooldown, timeLeft, processReward]);

  // Data Sync
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
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video Reward</p>
             <button disabled={isAdCooldown} style={{...styles.btn, background: isAdCooldown ? '#444' : '#facc15', color: '#000'}} onClick={() => handleAdWatch('watch_ad')}>
                {isAdCooldown ? `Wait ${timeLeft}s` : "WATCH ADS"}
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <button onClick={() => setActiveTab('reward')} style={{ flex: 1, padding: '10px', background: activeTab === 'reward' ? '#000' : '#fff', color: activeTab === 'reward' ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000' }}>REWARD</button>
            {APP_CONFIG.MY_UID === "1793453606" && (
                <button onClick={() => setActiveTab('admin')} style={{ flex: 1, padding: '10px', background: activeTab === 'admin' ? '#000' : '#fff', color: activeTab === 'admin' ? '#fff' : '#000', borderRadius: '10px', border: '1px solid #000' }}>ADMIN</button>
            )}
          </div>

          {activeTab === 'reward' && (
            <div style={styles.card}>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button disabled={isAdCooldown} style={styles.btn} onClick={async () => {
                    const snap = await get(ref(db, `promo_codes/${rewardCodeInput}`));
                    if(snap.exists() && !completed.includes('code_'+rewardCodeInput)) {
                        handleAdWatch('code_'+rewardCodeInput, snap.val().reward);
                    } else { alert("Invalid or Used Code"); }
                }}>CLAIM CODE</button>
            </div>
          )}

          {activeTab === 'admin' && (
            <div style={styles.card}>
                <h4>Admin Tools</h4>
                <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                <button style={{...styles.btn, background: '#f59e0b', marginBottom: 10}} onClick={async () => {
                    const snap = await get(ref(db, `users/${searchUserId}`));
                    if(snap.exists()) { setSearchedUser(snap.val()); setNewBalanceInput(snap.val().balance); } else alert("No User Found");
                }}>SEARCH USER</button>
                {searchedUser && (
                  <div style={{background:'#f0f0f0', padding:10, borderRadius:10}}>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={() => update(ref(db, `users/${searchUserId}`), {balance: Number(newBalanceInput)})}>UPDATE</button>
                  </div>
                )}
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
            <h3>Invite Friends</h3>
            <p>Reward: 0.001 TON / Ref</p>
            <button style={styles.btn} onClick={() => {
                navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
                alert("Link Copied!");
            }}>COPY INVITE LINK</button>
            <div style={{marginTop: 20}}>
                <h4>Referral History ({referrals.length})</h4>
                {referrals.map((r, i) => (
                    <div key={i} style={{padding: '5px 0', borderBottom: '1px solid #eee', fontSize: 12}}>
                        ID: {r.id} | Reward: +0.001
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
            <h3>Account Profile</h3>
            <p>ID: {APP_CONFIG.MY_UID}</p>
            <p>Status: {isVip ? "VIP ⭐" : "Standard"}</p>
            <hr/>
            <h4>Withdraw TON</h4>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={() => alert("Request Submitted")}>WITHDRAW</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
