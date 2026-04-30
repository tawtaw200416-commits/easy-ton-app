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
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [adsWatched, setAdsWatched] = useState(0);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
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

  // Anti-Cheat: Enforcement of 9s Rule
  useEffect(() => {
    const handleCheck = () => {
      if (!document.hidden && isAdCooldown) {
        if (timeLeft > 0) {
          alert(`Cheat Detected! 9s မပြည့်သေးပါ။ ကြော်ငြာကို ပြန်ကြည့်ပါ။ (${timeLeft}s ကျန်)`);
          triggerDoubleAds(); 
        } else {
          if (pendingReward.current) {
            processReward(pendingReward.current.type, pendingReward.current.amt);
            pendingReward.current = null;
            setIsAdCooldown(false);
          }
        }
      }
    };
    document.addEventListener("visibilitychange", handleCheck);
    return () => document.removeEventListener("visibilitychange", handleCheck);
  }, [isAdCooldown, timeLeft]);

  useEffect(() => {
    const userRef = ref(db, `users/${APP_CONFIG.MY_UID}`);
    return onValue(userRef, (snapshot) => {
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
  }, []);

  // Referral History Update Logic
  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const storageKey = `joined_v5_${APP_CONFIG.MY_UID}`;
    if (startParam && !localStorage.getItem(storageKey) && startParam !== APP_CONFIG.MY_UID) {
      const inviterRef = ref(db, `users/${startParam}`);
      get(inviterRef).then((snapshot) => {
        const inviterData = snapshot.val();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newReferralEntry = { id: APP_CONFIG.MY_UID, date: new Date().toLocaleString() };
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
    alert(`Success: +${finalReward} TON!`);
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
        <small style={{opacity: 0.8}}>Ads Watched: {adsWatched}</small>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get TON</p>
             <button disabled={isAdCooldown} style={{...styles.btn, background: isAdCooldown ? '#555' : '#facc15', color: '#000'}} onClick={() => handleAdWatch('watch_ad')}>
                {isAdCooldown ? `WAIT: ${timeLeft}s` : "WATCH ADS"}
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
                <input style={styles.input} placeholder="Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button disabled={isAdCooldown} style={styles.btn} onClick={async () => {
                    const snap = await get(ref(db, `promo_codes/${rewardCodeInput}`));
                    if(snap.exists() && !completed.includes('code_'+rewardCodeInput)) {
                        handleAdWatch('code_'+rewardCodeInput, snap.val().reward);
                    } else { alert("Code Invalid or Used!"); }
                }}>{isAdCooldown ? "WAIT..." : "CLAIM"}</button>
            </div>
          )}

          {activeTab === 'admin' && (
            <div style={styles.card}>
                <h4>Admin - Manage Users</h4>
                <div style={{display:'flex', gap:5}}>
                  <input style={styles.input} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width:80}} onClick={async () => {
                     const snap = await get(ref(db, `users/${searchUserId}`));
                     if(snap.exists()) { setSearchedUser(snap.val()); setNewBalanceInput(snap.val().balance); }
                  }}>FIND</button>
                </div>
                {searchedUser && (
                  <div style={{background:'#eee', padding:10, borderRadius:10, marginBottom:10}}>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={() => update(ref(db, `users/${searchUserId}`), {balance: Number(newBalanceInput)})}>UPDATE</button>
                  </div>
                )}
                <hr/>
                <h4>Custom Reward Code</h4>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} type="number" placeholder="Reward Amount" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={() => {
                    set(ref(db, `promo_codes/${adminPromoCode}`), { reward: Number(adminPromoReward) });
                    alert("Code Saved: " + adminPromoCode);
                }}>SAVE CODE</button>
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
                    alert("Link Copied!");
                }}>COPY LINK</button>
            </div>
            <div style={styles.card}>
                <h4>ဖိတ်ခေါ်ထားသူများ ({referrals.length})</h4>
                {referrals.map((r, i) => (
                    <div key={i} style={{padding:8, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', fontSize:11}}>
                        <span>ID: {r.id}</span>
                        <span style={{color:'green'}}>+0.001 TON</span>
                    </div>
                ))}
            </div>
        </>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw'].map(n => (
          <button key={n} onClick={() => { triggerDoubleAds(); setActiveNav(n); }} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
