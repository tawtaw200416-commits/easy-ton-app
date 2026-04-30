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
  AD_WAIT_TIME: 9, // 9 Seconds
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  AD_LINK_2: "https://data527.click/a674e1237b7e268eb5f6/503a052ca1/?placementName=default"
};

const app = initializeApp({ databaseURL: APP_CONFIG.FIREBASE_URL });
const db = getDatabase(app);
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
  
  // Timer & Anti-Cheat States
  const [isAdCooldown, setIsAdCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const pendingReward = useRef(null);
  const adStartTime = useRef(null);

  // Admin states
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState(APP_CONFIG.CODE_REWARD);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');
  const [manualAddReward, setManualAddReward] = useState('');

  const triggerDoubleAds = () => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.AD_LINK_2, '_blank');
  };

  const handleAdWatch = (rewardType, customAmt = 0) => {
    if (isAdCooldown) return;

    pendingReward.current = { type: rewardType, amt: customAmt };
    setIsAdCooldown(true);
    setTimeLeft(APP_CONFIG.AD_WAIT_TIME);
    adStartTime.current = Date.now();
    
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

  // Anti-Cheat: Listen for tab focus/visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAdCooldown) {
        const currentTime = Date.now();
        const secondsPassed = (currentTime - adStartTime.current) / 1000;

        if (secondsPassed < APP_CONFIG.AD_WAIT_TIME) {
          // User returned before 9 seconds
          alert(`Cheat Warning! Please watch the ad for full ${APP_CONFIG.AD_WAIT_TIME} seconds to get reward.`);
          triggerDoubleAds(); // Redirect back to ads
        } else {
          // 9 Seconds completed
          if (pendingReward.current) {
            processReward(pendingReward.current.type, pendingReward.current.amt);
            pendingReward.current = null;
            setIsAdCooldown(false);
            adStartTime.current = null;
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAdCooldown]);

  // Firebase Real-time Sync
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
    return () => unsubscribe();
  }, []);

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
    alert(`Reward Success: +${finalReward} TON`);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'Arial, sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 100 }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <div style={{display:'flex', justifyContent:'center', gap:'10px'}}>
            <small>Ads: {adsWatched}</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5}}>VIP ⭐</span>}
        </div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch 9s Video Reward</p>
             <button disabled={isAdCooldown} style={{...styles.btn, background: isAdCooldown ? '#555' : '#facc15', color: '#000'}} onClick={() => handleAdWatch('watch_ad')}>
                {isAdCooldown ? `PLEASE WAIT ${timeLeft}s` : "WATCH ADS NOW"}
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
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
                }}>{isAdCooldown ? "WAITING..." : "CLAIM REWARD"}</button>
              </div>
            )}

            {activeTab === 'bot' && (
              <div style={{textAlign:'center'}}>
                <p>Visit Support Bot for Help</p>
                <button style={styles.btn} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>OPEN BOT</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4>Admin - Manage Balance</h4>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={() => {
                      get(ref(db, `users/${searchUserId}`)).then((snap) => {
                          if(snap.val()) { setSearchedUser(snap.val()); setNewBalanceInput(snap.val().balance || 0); } else alert("User Not Found");
                      });
                  }}>FIND</button>
                </div>
                {searchedUser && (
                  <div style={{padding:10, background:'#f3f4f6', borderRadius:10, marginBottom:10}}>
                    <p style={{fontSize:12}}>User: {searchUserId}</p>
                    <label style={{fontSize:11}}>Current Balance:</label>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green', marginBottom:10}} onClick={() => {
                        update(ref(db, `users/${searchUserId}`), { balance: Number(newBalanceInput) });
                        alert("Total Balance Updated!");
                    }}>SET TOTAL BALANCE</button>
                    
                    <label style={{fontSize:11}}>Add Extra Reward:</label>
                    <input style={styles.input} type="number" placeholder="Amt to add" value={manualAddReward} onChange={e => setManualAddReward(e.target.value)} />
                    <button style={{...styles.btn, background:'blue'}} onClick={() => {
                        const added = Number(newBalanceInput) + Number(manualAddReward);
                        update(ref(db, `users/${searchUserId}`), { balance: added });
                        setNewBalanceInput(added);
                        alert("Extra Reward Added!");
                    }}>ADD TO BALANCE</button>
                  </div>
                )}
                <hr/>
                <h4>Create Promo Code</h4>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} type="number" placeholder="Reward Amt" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={() => {
                    if(!adminPromoCode) return alert("Enter Name");
                    set(ref(db, `promo_codes/${adminPromoCode}`), { code: adminPromoCode, reward: Number(adminPromoReward) });
                    alert("Code Created: " + adminPromoCode);
                    setAdminPromoCode('');
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{...styles.card, textAlign:'center'}}>
            <h3>Invite & Earn</h3>
            <p>1 Friend = 0.001 TON</p>
            <button style={styles.btn} onClick={() => {
                navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
                alert("Invite Link Copied!");
            }}>COPY INVITE LINK</button>
            <div style={{marginTop:20, textAlign:'left'}}>
                <h4>Your Referrals: {referrals.length}</h4>
                {referrals.map((r, i) => (
                    <div key={i} style={{fontSize:12, padding:'5px 0', borderBottom:'1px solid #eee'}}>ID: {r.id} - Reward: {r.reward}</div>
                ))}
            </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <p style={{fontSize:12}}>Minimum: {APP_CONFIG.MIN_WITHDRAW} TON</p>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={() => {
              const amt = parseFloat(withdrawAmount);
              if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min withdraw is ${APP_CONFIG.MIN_WITHDRAW}`);
              if (amt > balance) return alert("Insufficient Balance");
              
              // Push request to Firebase
              const reqId = Date.now();
              set(ref(db, `withdraw_requests/${reqId}`), {
                  uid: APP_CONFIG.MY_UID,
                  amount: amt,
                  address: withdrawAddress,
                  status: 'pending',
                  time: new Date().toLocaleString()
              });
              update(ref(db, `users/${APP_CONFIG.MY_UID}`), { balance: Number((balance - amt).toFixed(5)) });
              alert("Withdraw Request Sent Successfully!");
            }}>SEND WITHDRAW</button>
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
