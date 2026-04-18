import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  ADMINS: ["1793453606", "5020977059"], 
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY3", // User instruction အရ EASY3 သို့ ပြောင်းထားသည်
  REWARD_AMT: 0.001,
  VIDEO_REWARD: 0.0002, // ပုံထဲကအတိုင်း 0.0002 ထားပေးသည်
  TASK_REWARD: 0.0005,
  REFER_REWARD: 0.0005
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [rewardCode, setRewardCode] = useState('');
  const [promoForm, setPromoForm] = useState({ name: '', link: '' });

  // --- Firebase Sync ---
  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  const sendAdminNotify = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  // --- Adsgram Logic ---
  const runWithAd = (callback, isNav = false) => {
    if (isAdLoading) return;
    
    // Adsgram Script ရှိမရှိ စစ်ဆေးခြင်း
    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      
      AdController.show()
        .then(() => { 
          setIsAdLoading(false); 
          callback(); 
        })
        .catch((err) => { 
          setIsAdLoading(false); 
          // Navigation အတွက်ဆို Ad မပွင့်လည်း ပေးသွားမည်၊ Reward အတွက်ဆို alert ပြမည်
          if (isNav) callback();
          else alert("Ad closed or No ads available. Try again later."); 
        });
    } else {
      if (isNav) callback();
      else alert("Ads system is still loading. Please wait a moment.");
    }
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    
    const initApp = async () => {
      // 5 second အတွင်း data မရရင် loading ပိတ်ရန် (App တန်းမနေစေရန်)
      const timeout = setTimeout(() => setLoading(false), 5000);

      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();
        
        if (userData) {
          setBalance(Number(userData.balance || 0));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { 
        console.error("Sync error:", e);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' }
  };

  if (loading) return (
    <div style={{...styles.main, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <h2 style={{fontWeight:'bold'}}>SYNCING DATA...</h2>
    </div>
  );

  return (
    <div style={styles.main}>
      {/* Balance Display */}
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Watch Video Section */}
          <div style={styles.card}>
            <button onClick={() => runWithAd(() => {
               const newBal = Number((balance + APP_CONFIG.VIDEO_REWARD).toFixed(5));
               setBalance(newBal);
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert(`Watched! +${APP_CONFIG.VIDEO_REWARD} TON`);
            })} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+{APP_CONFIG.VIDEO_REWARD} TON)</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              <button key={t} onClick={() => runWithAd(() => setActiveTab(t.toLowerCase()), true)} 
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && (
              <div>
                <button style={{...styles.btn, backgroundColor:'#facc15', color:'#000', border:'2px solid #000', marginBottom:'15px'}}>+ ADD TASK (PROMOTE)</button>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Channel Link" />
                <button style={{...styles.btn, backgroundColor:'#3b82f6', marginBottom:'20px'}}>SEND PROOF</button>
                
                {/* Task List Example */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                    <b>@EasyTonNews</b>
                    <button style={{...styles.btn, width:'80px', padding:'8px'}} onClick={() => window.open(APP_CONFIG.HELP_BOT)}>JOIN</button>
                </div>
              </div>
            )}

            {activeTab === 'reward' && (
              <div style={{textAlign:'center'}}>
                <input style={styles.input} placeholder="Enter Code (EASY3)" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE) {
                    runWithAd(() => {
                        const newBal = Number((balance + APP_CONFIG.REWARD_AMT).toFixed(5));
                        setBalance(newBal);
                        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
                        alert("Code Claimed!");
                    });
                  } else alert("Invalid Code!");
                }}>CLAIM REWARD</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Withdraw Section */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2 style={{marginTop:0}}>WITHDRAW TON</h2>
          <small style={{color:'red'}}>* Minimum withdrawal is 0.1 TON</small>
          <div style={{marginTop:15}}>
            <input style={styles.input} placeholder="Amount (e.g. 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Your TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={() => {
              if(parseFloat(withdrawAmount) >= 0.1 && balance >= parseFloat(withdrawAmount)) {
                runWithAd(() => {
                    sendAdminNotify(`💰 WD REQ: ${withdrawAmount} TON\nUID: ${APP_CONFIG.MY_UID}\nAddr: ${withdrawAddress}`);
                    alert("Request Submitted!");
                });
              } else alert("Insufficient balance or invalid amount!");
            }}>SUBMIT REQUEST</button>
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.nav}>
        {['EARN', 'INVITE', 'WITHDRAW', 'PROFILE'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n.toLowerCase()), true)} style={styles.navItem(activeNav === n.toLowerCase())}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
