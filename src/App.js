import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com", // Ensure no trailing slash
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0003, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  AD_LINK_1: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec",
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

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
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Admin states
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState('');

  // 1. Fetch User Data using REST API
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const data = await response.json();
      
      if (data) {
        setBalance(parseFloat(data.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!data.isVip);
        setCompleted(data.completed || []);
        setWithdrawHistory(data.withdrawHistory || []);
        setReferrals(data.referrals ? Object.values(data.referrals) : []);
        setAdsWatched(data.adsWatched || 0);
      } else {
        // Initialize new user if doesn't exist
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PUT',
          body: JSON.stringify({ balance: 0, adsWatched: 0, completed: [], withdrawHistory: [], isVip: VIP_IDS.includes(APP_CONFIG.MY_UID) })
        });
      }

      // Fetch Global Tasks
      const taskRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`);
      const taskData = await taskRes.json();
      if (taskData) {
        setCustomTasks(Object.keys(taskData).map(key => ({ ...taskData[key], firebaseKey: key })));
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Sync every 10 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerAdsSequence = useCallback(() => {
    window.open(APP_CONFIG.AD_LINK_1, '_blank');
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now());
  }, []);

  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 9000) {
      alert("Please view Ads for 9 seconds first to verify!");
      triggerAdsSequence();
      return false;
    }
    return true;
  };

  // 2. Updated Reward Logic to ensure balance updates correctly
  const finalizeReward = async (id, rewardAmount) => {
    try {
      // Get fresh balance from DB before updating to prevent overwrite
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const currentData = await response.json();
      
      const currentBal = parseFloat(currentData?.balance || 0);
      const newBal = parseFloat((currentBal + rewardAmount).toFixed(5));
      
      const updatePayload = { balance: newBal };

      if (id === 'watch_ad') {
        updatePayload.adsWatched = (currentData?.adsWatched || 0) + 1;
      } else {
        const currentCompleted = currentData?.completed || [];
        if (!currentCompleted.includes(id)) {
          updatePayload.completed = [...currentCompleted, id];
        }
      }

      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify(updatePayload)
      });

      setBalance(newBal);
      alert(`Success! +${rewardAmount} TON`);
      setLastAdClickTime(0);
    } catch (e) {
      alert("Update failed. Please check connection.");
    }
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
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" }
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
             <p style={{margin: '0 0 10px 0', fontWeight: 'bold'}}>Watch Video - Get Reward</p>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>
                WATCH ADS
             </button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000', fontSize:'11px' }}>{t}</button>
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
                    setTimeout(() => { processReward(t.id, 0.001); }, 2000);
                }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={async () => {
                    if(!rewardCodeInput) return alert("Enter Code");
                    const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/promo_codes/${rewardCodeInput}.json`);
                    const codeData = await res.json();
                    if(codeData && !completed.includes('code_'+rewardCodeInput)) {
                        triggerAdsSequence();
                        setTimeout(() => finalizeReward('code_'+rewardCodeInput, codeData.reward || APP_CONFIG.CODE_REWARD), 2000);
                    } else { alert("Invalid or Used Code!"); }
                }}>CLAIM CODE</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
            <h3>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
            <input style={styles.input} placeholder="Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
            <button style={styles.btn} onClick={async () => {
                const amt = parseFloat(withdrawAmount);
                if (amt < APP_CONFIG.MIN_WITHDRAW || amt > balance) return alert("Invalid Amount/Balance");
                
                const newBal = parseFloat((balance - amt).toFixed(5));
                const newHistory = [{amount: amt, address: withdrawAddress, date: new Date().toLocaleString(), status: 'Pending'}, ...withdrawHistory];
                
                await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                  method: 'PATCH',
                  body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
                });
                setBalance(newBal);
                alert("Withdraw Requested!");
            }}>WITHDRAW</button>
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
