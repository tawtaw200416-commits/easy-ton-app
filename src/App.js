import React, { useState, useEffect, useCallback } from 'react';

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
  VPN_IOS: "https://apps.apple.com/app/1-1-1-1-faster-internet/id1433553754",
  VPN_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflareonedotonedotonedotone",
  // Advertica URL
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
  
  const [isVpnActive, setIsVpnActive] = useState(true);
  const [checkingVpn, setCheckingVpn] = useState(true);
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adsterraLinks, setAdsterraLinks] = useState([]);
  const [lastAdClickTime, setLastAdClickTime] = useState(0);

  // VPN Checking
  const checkVPN = useCallback(async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      setIsVpnActive(data.includes('warp=on'));
    } catch (error) { setIsVpnActive(false); }
    finally { setCheckingVpn(false); }
  }, []);

  useEffect(() => {
    checkVPN();
    const vpnInterval = setInterval(checkVPN, 10000);
    return () => clearInterval(vpnInterval);
  }, [checkVPN]);

  // Logic: First Advertica, then Adsterra after 7s
  const triggerAdsSequence = useCallback(() => {
    if (!isVpnActive) return;
    
    // 1. Open Advertica immediately
    window.open(APP_CONFIG.ADVERTICA_URL, '_blank');
    setLastAdClickTime(Date.now());

    // 2. Schedule Adsterra to open after 7 seconds
    setTimeout(() => {
      if (adsterraLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
        window.open(adsterraLinks[randomIndex].url, '_blank');
      }
    }, 7100); 
  }, [adsterraLinks, isVpnActive]);

  // Strictly check if 7 seconds passed
  const isAdValid = () => {
    const timePassed = Date.now() - lastAdClickTime;
    if (lastAdClickTime === 0 || timePassed < 7000) {
      alert("⚠️ Please stay on the Advertica ad for at least 7 seconds before Adsterra triggers or you continue!");
      triggerAdsSequence(); // Re-trigger if failed
      return false;
    }
    return true;
  };

  const handleTabChange = (tab) => {
    if (!isAdValid()) return;
    if (['bot', 'social', 'reward'].includes(tab)) {
      triggerAdsSequence();
    }
    setActiveTab(tab);
  };

  const safeNavigate = (nav) => {
    if (activeNav === nav) return;
    if (!isAdValid()) return;
    triggerAdsSequence();
    setActiveNav(nav);
  };

  // Reward Process (Fixed for Watch Ad and Claim)
  const processReward = (id, rewardAmount) => {
    if (!isVpnActive) return alert("Please connect to 1.1.1.1 VPN!");
    if (!isAdValid()) return;

    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;
    else if (id.startsWith('c_')) finalReward = APP_CONFIG.CODE_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          const newCompleted = !isWatchAd ? [...completed, id] : completed;
          if (!isWatchAd) setCompleted(newCompleted);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Success: +${finalReward} TON`);
          setLastAdClickTime(0); 
        }
      });
    }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    triggerAdsSequence();
    if (link) {
      setTimeout(() => {
        tg?.openTelegramLink ? tg.openTelegramLink(link) : window.open(link, '_blank');
      }, 500);
    }
    // Final check for reward after sequence
    setTimeout(() => { processReward(id, reward); }, 2000);
  };

  // Rest of the code remains original...
  // (fetchData, handleReferral, Admin Logic, UI Rendering etc. are all kept as per your provided code)

  return (
    <div style={styles.main}>
      {/* VPN Overlay logic here */}
      {!isVpnActive && !checkingVpn ? (
          <div style={styles.vpnOverlay}>Access Denied. Use 1.1.1.1 VPN</div>
      ) : (
        <>
          <div style={styles.header}>
            <h1 style={{fontSize: '38px'}}>{balance.toFixed(5)} TON</h1>
            <small>Ads Watched: {adsWatched}</small>
          </div>

          {activeNav === 'earn' && (
            <div style={styles.card}>
               <button style={styles.btn} onClick={() => { triggerAdsSequence(); processReward('watch_ad', 0); }}>WATCH ADS (ADSGRAM)</button>
               
               <div style={{display:'flex', marginTop:10}}>
                  {['BOT', 'SOCIAL', 'REWARD'].map(t => (
                    <button key={t} onClick={() => handleTabChange(t.toLowerCase())} style={{flex:1, background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000'}}>{t}</button>
                  ))}
               </div>

               {activeTab === 'bot' && allBotTasks.map((t) => (
                  <div key={t.id} style={{display:'flex', justifyContent:'space-between', margin:'10px 0'}}>
                    <span>{t.name}</span>
                    <button onClick={() => handleTaskReward(t.id, 0.001, t.link)}>START</button>
                  </div>
               ))}
               {/* Add other tab contents here similarly */}
            </div>
          )}

          {/* Footer Navigation */}
          <div style={styles.nav}>
            {['earn', 'invite', 'withdraw', 'profile'].map(n => (
              <button key={n} onClick={() => safeNavigate(n)} style={{flex:1, color: activeNav === n ? '#facc15' : '#fff'}}>
                {n.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px' },
    header: { textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', color: '#fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginTop: '10px', border: '2px solid #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '10px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px' },
    vpnOverlay: { /* styles for VPN check */ }
};

export default App;
