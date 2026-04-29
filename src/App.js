import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, // Updated Normal Reward
  VIP_WATCH_REWARD: 0.0008, // Updated VIP Reward
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001,
  // Fixed Ad Links
  ADVERTIC_URL: "Https://data527.click/a674e1237b7e268eb5f6/ef896b9a82/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  // Ad Timing State
  const [lastAdTriggerTime, setLastAdTriggerTime] = useState(0);
  const [isAdActive, setIsAdActive] = useState(false);

  // --- Mandatory Ad Function ---
  const triggerMandatoryAds = useCallback(() => {
    setLastAdTriggerTime(Date.now());
    setIsAdActive(true);
    // Open both ads
    window.open(APP_CONFIG.ADVERTIC_URL, '_blank');
    setTimeout(() => {
      window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    }, 500);
  }, []);

  const checkAdTimer = () => {
    if (!isAdActive) return true;
    const timeSpent = (Date.now() - lastAdTriggerTime) / 1000;
    if (timeSpent < 10) {
      alert("Please view ads for 10 seconds to continue! (ကြော်ငြာကို ၁၀ စက္ကန့်ပြည့်အောင်ကြည့်ပေးပါ)");
      triggerMandatoryAds(); // Force reopen if they return too early
      return false;
    }
    setIsAdActive(false);
    return true;
  };

  // Trigger on every button click
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const btn = e.target.closest('button');
      if (btn && !isAdActive) {
        triggerMandatoryAds();
      }
    };
    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, [triggerMandatoryAds, isAdActive]);

  const fetchData = useCallback(async () => {
    try {
      const [u, t] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      const userData = await u.json();
      const tasksData = await t.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setIsVip(VIP_IDS.includes(APP_CONFIG.MY_UID) || !!userData.isVip);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals ? Object.values(userData.referrals) : []);
        setAdsWatched(userData.adsWatched || 0);
      }
      if (tasksData) {
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Adsgram Processing (Only for Watch Ads) ---
  const processAdsgram = () => {
    if (!checkAdTimer()) return;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = adsWatched + 1;
          
          setBalance(newBal);
          setAdsWatched(newAdsCount);

          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount })
          });
          alert(`Success: +${finalReward} TON`);
        }
      }).catch((e) => alert("Ad error or skipped"));
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (!checkAdTimer()) return;
    if (completed.includes(id)) return alert("Already completed!");
    
    if (link) {
      tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
    }

    setTimeout(async () => {
        const newBal = Number((balance + reward).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBal);
        setCompleted(newCompleted);
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newCompleted })
        });
        alert(`Task Reward: +${reward} TON`);
    }, 2000);
  };

  const safeNavigate = (nav) => {
    if (checkAdTimer()) setActiveNav(nav);
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
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={processAdsgram}>WATCH ADS (ADSGRAM)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => checkAdTimer() && setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {(activeTab === 'bot' || activeTab === 'social') && customTasks.filter(t => t.type === activeTab).map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => handleTaskReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}
            {activeTab === 'admin' && <div style={{fontSize: '12px', textAlign: 'center'}}>Admin Tasks Manager Enabled</div>}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={() => {
              if (!checkAdTimer()) return;
              const amt = Number(withdrawAmount);
              if(amt < APP_CONFIG.MIN_WITHDRAW || amt > balance) return alert("Check Balance");
              alert("Withdrawal Requested!");
          }}>WITHDRAW</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => safeNavigate(n)} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
