Import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
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
  const [customTasks, setCustomTasks] = useState([]);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // 9s Logic States
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Admin states
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminPromoReward, setAdminPromoReward] = useState(APP_CONFIG.CODE_REWARD);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // Combined Ad Logic
  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now());
  }, []);

  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 9000) { // Changed to 9 seconds
      alert("Please view Ads for 9 seconds first to verify!");
      triggerAdsSequence();
      return false;
    }
    return true;
  };

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

    onValue(ref(db, 'global_tasks'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCustomTasks(Object.keys(data).map(key => ({ ...data[key], firebaseKey: key })));
    });

    return () => unsubscribe();
  }, []);

  const finalizeReward = (id, finalReward) => {
    const newBal = Number((balance + finalReward).toFixed(5));
    const newAdsCount = id === 'watch_ad' ? adsWatched + 1 : adsWatched;
    
    // Task logic: Add to completed list so user can't repeat
    const newCompleted = (id !== 'watch_ad' && !completed.includes(id)) ? [...completed, id] : completed;
    
    update(ref(db, `users/${APP_CONFIG.MY_UID}`), { 
        balance: newBal, 
        completed: newCompleted, 
        adsWatched: newAdsCount 
    });
    alert(`Reward Success: +${finalReward} TON`);
    setLastAdClickTime(0); 
  };

  const processReward = (id, rewardAmount) => {
    if (!checkAdStay()) return;
    if (id !== 'watch_ad' && completed.includes(id)) return alert("Already completed!");

    let finalReward = id === 'watch_ad' ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
    
    if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
        AdController.show().then((result) => {
          if (result.done) finalizeReward(id, finalReward);
        }).catch(() => finalizeReward(id, finalReward)); 
    } else {
        finalizeReward(id, finalReward);
    }
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
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get {isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD} TON</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>
                WATCH ADS
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => { if(checkAdStay()) setActiveTab(t.toLowerCase()) }} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize:'11px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [...fixedBotTasks, ...customTasks.filter(t => t.type === 'bot')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => {
                    if (completed.includes(t.id)) return alert("Already done!");
                    triggerAdsSequence();
                    setTimeout(() => { window.open(t.link, '_blank'); }, 500);
                    setTimeout(() => { processReward(t.id, 0.001); }, 2000); // 2s delay for ad check
                }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}

            {activeTab === 'social' && [...fixedSocialTasks, ...customTasks.filter(t => t.type === 'social')].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => {
                    if (completed.includes(t.id)) return alert("Already joined!");
                    triggerAdsSequence();
                    setTimeout(() => { window.open(t.link, '_blank'); }, 500);
                    setTimeout(() => { processReward(t.id, 0.001); }, 2000);
                }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                    if(!rewardCodeInput) return alert("Enter Code");
                    const codeRef = ref(db, `promo_codes/${rewardCodeInput}`);
                    get(codeRef).then((snap) => {
                        const codeData = snap.val();
                        if(codeData && !completed.includes('code_'+rewardCodeInput)) {
                            triggerAdsSequence();
                            setTimeout(() => processReward('code_'+rewardCodeInput, codeData.reward || APP_CONFIG.CODE_REWARD), 2000);
                        } else { alert("Invalid or Already Used Code!"); }
                    });
                }}>CLAIM CODE</button>
              </div>
            )}

            {activeTab === 'admin' && (
              <div>
                <h4>Admin - User Search</h4>
                <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                  <input style={{...styles.input, marginBottom: 0}} placeholder="User ID" value={searchUserId} onChange={e => setSearchUserId(e.target.value)} />
                  <button style={{...styles.btn, width: '80px', background: '#f59e0b'}} onClick={() => {
                      get(ref(db, `users/${searchUserId}`)).then((snap) => {
                          if(snap.val()) { setSearchedUser(snap.val()); setNewBalanceInput(snap.val().balance || 0); } else alert("Not Found");
                      });
                  }}>FIND</button>
                </div>

                {searchedUser && (
                  <div style={{padding:10, background:'#eee', borderRadius:10, marginBottom:10, border:'2px solid #000'}}>
                    <p>ID: {searchUserId} | VIP: {searchedUser.isVip ? "Yes" : "No"}</p>
                    <input style={styles.input} type="number" value={newBalanceInput} onChange={e => setNewBalanceInput(e.target.value)} />
                    <button style={{...styles.btn, background:'green'}} onClick={() => {
                        update(ref(db, `users/${searchUserId}`), { balance: Number(newBalanceInput) });
                        alert("Balance Updated!");
                    }}>UPDATE BALANCE</button>
                    <button style={{...styles.btn, background:'#0ea5e9', marginTop:5}} onClick={() => {
                        update(ref(db, `users/${searchUserId}`), { isVip: true });
                        alert("VIP Status Given!");
                    }}>GIVE VIP</button>
                    
                    <h5 style={{marginTop:15}}>History Status Control:</h5>
                    {searchedUser.withdrawHistory?.map((h, idx) => (
                        <div key={idx} style={{fontSize:10, display:'flex', justifyContent:'space-between', marginBottom:5}}>
                            <span>{h.amount} TON - {h.status}</span>
                            {h.status === 'Pending' && <button onClick={() => {
                                const newHist = [...searchedUser.withdrawHistory];
                                newHist[idx].status = 'Success';
                                update(ref(db, `users/${searchUserId}`), { withdrawHistory: newHist });
                                alert("Withdraw Success!");
                            }}>SUCCESS</button>}
                        </div>
                    ))}
                  </div>
                )}
                
                <hr/>
                <h5>➕ ADD NEW TASK</h5>
                <input style={styles.input} placeholder="Task Name" value={adminTaskName} onChange={e => setAdminTaskName(e.target.value)} />
                <input style={styles.input} placeholder="Link" value={adminTaskLink} onChange={e => setAdminTaskLink(e.target.value)} />
                <select style={styles.input} value={adminTaskType} onChange={e => setAdminTaskType(e.target.value)}>
                  <option value="bot">BOT</option>
                  <option value="social">SOCIAL</option>
                </select>
                <button style={{...styles.btn, background: 'green'}} onClick={() => {
                   const id = 't_'+Date.now();
                   set(ref(db, `global_tasks/${id}`), { id, name: adminTaskName, link: adminTaskLink, type: adminTaskType });
                   alert("Saved!"); setAdminTaskName(''); setAdminTaskLink('');
                }}>SAVE TASK</button>

                <h5>CREATE PROMO CODE</h5>
                <input style={styles.input} placeholder="Code Name" value={adminPromoCode} onChange={e => setAdminPromoCode(e.target.value)} />
                <input style={styles.input} type="number" placeholder="Reward Amount" value={adminPromoReward} onChange={e => setAdminPromoReward(e.target.value)} />
                <button style={{...styles.btn, background:'purple'}} onClick={() => {
                    set(ref(db, `promo_codes/${adminPromoCode}`), { code: adminPromoCode, reward: Number(adminPromoReward) });
                    alert("Code Created: " + adminPromoCode); setAdminPromoCode('');
                }}>CREATE CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{...styles.card, background: '#000', color: '#fff', textAlign:'center'}}>
            <h3>Invite & Earn</h3>
            <h4 style={{color:'#facc15'}}>1 Refer = 0.001 TON</h4>
            <button style={{...styles.btn, background:'#fff', color:'#000'}} onClick={() => {
                navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`);
                alert("Invite Link Copied!");
            }}>COPY LINK</button>
            <div style={{marginTop: 20, textAlign:'left'}}>
                <h4>Refer History ({referrals.length})</h4>
                {referrals.map((r, i) => (
                    <div key={i} style={{fontSize:11, padding:8, borderBottom:'1px solid #333'}}>ID: {r.id || r}</div>
                ))}
            </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
            <div style={styles.card}>
                <h3 style={{color: '#0ea5e9', marginTop:0}}>💎 BUY VIP</h3>
                <p style={{fontSize:12, margin:'5px 0'}}>Admin Wallet: <b>{APP_CONFIG.ADMIN_WALLET}</b></p>
                <button style={{...styles.btn, padding:8, background: '#0ea5e9'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.ADMIN_WALLET); alert("Wallet Copied!"); }}>COPY WALLET</button>
                <p style={{fontSize:12, margin:'5px 0'}}>Required Memo: <b>{APP_CONFIG.MY_UID}</b></p>
                <button style={{...styles.btn, padding:8, background: '#0ea5e9'}} onClick={() => { navigator.clipboard.writeText(APP_CONFIG.MY_UID); alert("Memo Copied!"); }}>COPY MEMO</button>
            </div>
            <div style={styles.card}>
                <h3>Withdraw TON</h3>
                <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                    const amt = parseFloat(withdrawAmount);
                    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Min ${APP_CONFIG.MIN_WITHDRAW} TON`);
                    if (amt > balance) return alert("Insufficient balance!");
                    
                    const newHistory = [{amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending'}, ...withdrawHistory];
                    const newBal = Number((balance - amt).toFixed(5));
                    update(ref(db, `users/${APP_CONFIG.MY_UID}`), { balance: newBal, withdrawHistory: newHistory });
                    alert("Withdraw Requested!");
                }}>WITHDRAW</button>
            </div>
            <div style={styles.card}>
                <h4>Withdraw History</h4>
                {withdrawHistory.map((h, i) => (
                    <div key={i} style={{fontSize:11, padding:8, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
                        <span>{h.amount} TON</span>
                        <span style={{color: h.status === 'Success' ? 'green' : 'orange'}}>{h.status}</span>
                    </div>
                ))}
            </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
            <h3>User Profile</h3>
            <p>Status: <b>{isVip ? "VIP ⭐" : "ACTIVE ✅"}</b></p>
            <p>User ID: <b>{APP_CONFIG.MY_UID}</b></p>
            <p>Balance: <b>{balance.toFixed(5)} TON</b></p>
            <button style={{...styles.btn, background: '#ef4444', marginTop: 20}} onClick={() => window.open(APP_CONFIG.SUPPORT_BOT)}>SUPPORT</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => { if(checkAdStay()) setActiveNav(n) }} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
