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
  VPN_ANDROID: "https://play.google.com/store/apps/details?id=com.cloudflare.onedotonedotonedotone"
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [isVpnActive, setIsVpnActive] = useState(true); // Default true to prevent flicker
  const [checkingVpn, setCheckingVpn] = useState(true);

  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');
  const [adsterraLinks, setAdsterraLinks] = useState([]);

  // --- VPN Detection Logic ---
  const checkVPN = useCallback(async () => {
    try {
      const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
      const data = await response.text();
      // Check if the user is routing through Cloudflare WARP/1.1.1.1
      if (data.includes('warp=on')) {
        setIsVpnActive(true);
      } else {
        setIsVpnActive(false);
      }
    } catch (error) {
      setIsVpnActive(false);
    } finally {
      setCheckingVpn(false);
    }
  }, []);

  useEffect(() => {
    checkVPN();
    const vpnInterval = setInterval(checkVPN, 10000); // Check every 10 seconds
    return () => clearInterval(vpnInterval);
  }, [checkVPN]);

  // --- Existing Logic ---
  const triggerAdsterra = useCallback(() => {
    if (!isVpnActive) return; // Block Adsterra if no VPN
    if (adsterraLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * adsterraLinks.length);
      window.open(adsterraLinks[randomIndex].url, '_blank');
    }
  }, [adsterraLinks, isVpnActive]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        triggerAdsterra();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [triggerAdsterra]);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/adsterra_links.json`)
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
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], firebaseKey: key })));
      if (adsData) setAdsterraLinks(Object.keys(adsData).map(key => ({ id: key, url: adsData[key].url })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const processReward = (id, rewardAmount) => {
    if (!isVpnActive) return alert("Please connect to 1.1.1.1 VPN to earn rewards!");
    
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${finalReward} TON`);
          fetchData();
        }
      });
    }
  };

  // --- Styles ---
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '2px solid #000', boxShadow: '4px 4px 0px #000', textAlign: 'center' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor:'pointer', marginTop: '10px' },
    vpnOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#facc15', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }
  };

  // --- VPN Restriction UI ---
  if (!isVpnActive && !checkingVpn) {
    return (
      <div style={styles.vpnOverlay}>
        <div style={styles.card}>
          <h2 style={{color: '#ef4444'}}>ACCESS DENIED ⚠️</h2>
          <p>To use this bot and earn TON, you <b>MUST</b> connect to <b>1.1.1.1 Cloudflare VPN (WARP)</b>.</p>
          <p style={{fontSize: '13px', color: '#666'}}>Other VPNs or normal connections are not allowed.</p>
          
          <button style={{...styles.btn, backgroundColor: '#007AFF'}} onClick={() => window.open(APP_CONFIG.VPN_IOS)}>
            DOWNLOAD FOR IOS (APP STORE)
          </button>
          <button style={{...styles.btn, backgroundColor: '#3DDC84'}} onClick={() => window.open(APP_CONFIG.VPN_ANDROID)}>
            DOWNLOAD FOR ANDROID (PLAY STORE)
          </button>
          
          <button style={{...styles.btn, marginTop: '20px', backgroundColor: '#fff', color: '#000', border: '1px solid #000'}} onClick={checkVPN}>
            I HAVE CONNECTED - REFRESH
          </button>
        </div>
      </div>
    );
  }

  // --- Standard Render (Visible only if VPN is active) ---
  return (
    <div style={styles.main}>
      {/* Rest of your existing App UI Code goes here (Header, Nav, Tabs, etc.) */}
      <div style={{textAlign: 'center', background: '#000', padding: '20px', borderRadius: '25px', color: '#fff', border: '3px solid #fff'}}>
         <h1 style={{fontSize: '32px'}}>{balance.toFixed(5)} TON</h1>
         <p>VPN STATUS: <span style={{color: '#4ade80'}}>CONNECTED ✅</span></p>
      </div>

      <div style={styles.card}>
         <button style={styles.btn} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
      </div>

      {/* Include your Navigation and other sections below as in your original code */}
    </div>
  );
}

export default App;
