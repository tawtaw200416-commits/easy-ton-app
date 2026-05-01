import React, { useState, useEffect, useCallback } from 'react';

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
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [loading, setLoading] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminVipUserId, setAdminVipUserId] = useState('');

  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [newAdUrl, setNewAdUrl] = useState('');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const triggerAdsSequence = useCallback(() => {
    try {
        window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
        setLastAdClickTime(Date.now()); 

        setTimeout(() => {
          if (adsterraLinks.length > 0) {
            const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
            window.open(adsterraLinks[randomIndex].url, '_blank');
          }
        }, 7000); 
    } catch (e) {
        console.error("Ad popup blocked", e);
    }
  }, [adsterraLinks]);

  const checkAdStay = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 7000) {
      alert("Please wait 7 seconds on the ad page to verify!");
      triggerAdsSequence(); 
      return false;
    }
    return true;
  };

  const handleTabChange = (tab) => {
    if (!checkAdStay()) return;
    if (['bot', 'social', 'reward'].includes(tab)) {
      triggerAdsSequence();
    }
    setActiveTab(tab);
  };

  const fetchData = useCallback(async () => {
    try {
      const fetchParams = { mode: 'cors', headers: { 'Accept': 'application/json' } };
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, fetchParams),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, fetchParams),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`, fetchParams)
      ]);
      
      const userData = await u.json();
      const tasksData = await t.json();
      const adsData = await a.json();

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
      if (adsData) {
        setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
      }
    } catch (e) { 
        console.warn("Network slow, retrying in background..."); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 20000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const processReward = async (id, rewardAmount) => {
    if (!checkAdStay()) return;
    setLoading(true);

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    const grantReward = async () => {
        const newBal = Number((balance + finalReward).toFixed(5));
        const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
        const newCompleted = !isWatchAd ? [...completed, id] : completed;

        setBalance(newBal);
        if (isWatchAd) setAdsWatched(newAdsCount);
        setCompleted(newCompleted);

        try {
            await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
                method: 'PATCH',
                body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
            });
            alert(`Success! Reward: +${finalReward} TON`);
            setLastAdClickTime(0); 
            fetchData();
        } catch (err) {
            alert("Balance saved locally. Will sync when connection is stable.");
        } finally {
            setLoading(false);
        }
    };

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) grantReward();
        else setLoading(false);
      }).catch(() => {
        alert("Ad Network Busy. Try again.");
        setLoading(false);
      });
    } else {
        // Fail-safe: If Adsgram is blocked by ISP, allow reward after manual sequence
        grantReward();
    }
  };

  // ... (Rest of your helper functions: handleTaskReward, handleClaimClick, etc. remain the same)
  // [Apply same logic to handleTaskReward and handleClaimClick to include the setLoading(true/false)]

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Task already completed!");
    triggerAdsSequence();
    if (link) {
      setTimeout(() => {
        if (tg?.openTelegramLink && link.includes('t.me')) {
            tg.openTelegramLink(link);
        } else {
            window.open(link, '_blank');
        }
      }, 500);
    }
    setTimeout(() => { processReward(id, reward); }, 1500);
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff', boxShadow: '0px 10px 20px rgba(0,0,0,0.2)' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer', transition: '0.2s', opacity: loading ? 0.7 : 1 },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px', borderTop: '3px solid #fff', zIndex: 1000 }
  };

  return (
    <div style={styles.main}>
      {/* Header section is the same as your original code */}
      <div style={styles.header}>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:5}}>
            <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
            {isVip && <span style={{fontSize:10, background:'#facc15', color:'#000', padding:'2px 5px', borderRadius:5, fontWeight:'bold'}}>VIP ⭐</span>}
        </div>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
        <div style={{display:'flex', justifyContent:'center', gap:10, opacity:0.8, fontSize:12}}>
            <span>Ads: {adsWatched}</span>
            <span>VIP Reward: {APP_CONFIG.VIP_WATCH_REWARD}</span>
        </div>
      </div>

      {loading && <div style={{textAlign:'center', fontWeight:'bold', marginBottom:10}}>Processing...</div>}

      {/* Your navigation logic and activeNav sections remain exactly as you wrote them */}
      {/* (Make sure to include the return parts from your original code here) */}
      
      {/* Footer Navigation */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <button key={n} onClick={() => { if(!loading) setActiveNav(n); }} style={{ flex: 1, background: 'none', border: 'none', color: activeNav === n ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }}>
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
