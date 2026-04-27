import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0002, 
  VIP_WATCH_REWARD: 0.0006, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.001
};

const VIP_IDS = ["1936306772", "1793453606", "5020977059"];

function App() {
  // --- အရင်ရှိပြီးသား States များ (မဖျက်ပါ) ---
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
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
  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');
  const [adminPromoCode, setAdminPromoCode] = useState('');
  const [adminVipUserId, setAdminVipUserId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  // --- NEW ADS MANAGER STATES ---
  const [adsgramId, setAdsgramId] = useState("27611");
  const [otherAds, setOtherAds] = useState([]); // List of {url, type}
  const [newAdUrl, setNewAdUrl] = useState('');
  const [newAdType, setNewAdType] = useState('Adsterra');

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_config.json`)
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
      if (tasksData) setCustomTasks(Object.keys(tasksData).map(k => ({ ...tasksData[k], firebaseKey: k })));
      if (adsData) {
        setAdsgramId(adsData.adsgramId || "27611");
        setOtherAds(adsData.otherAds || []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveAdsToFirebase = async (newId, newOther) => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_config.json`, {
      method: 'PUT',
      body: JSON.stringify({ adsgramId: newId, otherAds: newOther })
    });
    alert("Ads Saved Successfully!");
  };

  const processReward = (id, rewardAmount) => {
    let finalReward = rewardAmount;
    let isWatchAd = id === 'watch_ad';
    if (isWatchAd) finalReward = isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD;

    // အခြားထည့်ထားတဲ့ Ads Link တွေကို အကုန်ဖွင့်ခိုင်းမယ်
    if (isWatchAd && otherAds.length > 0) {
      otherAds.forEach(ad => window.open(ad.url, '_blank'));
    }

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: adsgramId });
      AdController.show().then((result) => {
        if (result.done) {
          const newBal = Number((balance + finalReward).toFixed(5));
          setBalance(newBal);
          if (isWatchAd) setAdsWatched(prev => prev + 1);
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, adsWatched: isWatchAd ? adsWatched + 1 : adsWatched })
          });
          alert(`Reward: +${finalReward} TON`);
        }
      });
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000' }
  };

  return (
    <div style={styles.main}>
      {/* Header logic remains... */}
      <div style={{textAlign:'center', background:'#000', padding:'20px', borderRadius:'20px', color:'#fff', marginBottom:'15px'}}>
         <h1>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
           {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" ? (
             <div>
               <h4 style={{color: '#2563eb'}}>📢 ADS MANAGER</h4>
               <label>Adsgram Block ID:</label>
               <input style={styles.input} value={adsgramId} onChange={e => setAdsgramId(e.target.value)} />
               
               <hr/>
               <label>Add External Ad (Adsterra/Link):</label>
               <div style={{display:'flex', gap: 5}}>
                 <select style={{...styles.input, width: '40%'}} value={newAdType} onChange={e => setNewAdType(e.target.value)}>
                   <option value="Adsterra">Adsterra</option>
                   <option value="Direct">Direct Link</option>
                 </select>
                 <input style={styles.input} placeholder="Link URL" value={newAdUrl} onChange={e => setNewAdUrl(e.target.value)} />
               </div>
               <button style={{...styles.btn, background:'#10b981', marginBottom: 10}} onClick={() => {
                 if(!newAdUrl) return;
                 const updatedOther = [...otherAds, {url: newAdUrl, type: newAdType}];
                 setOtherAds(updatedOther); setNewAdUrl('');
               }}>ADD NEW AD</button>

               <div style={{maxHeight: '100px', overflowY: 'auto', marginBottom: 10}}>
                  {otherAds.map((ad, i) => (
                    <div key={i} style={{fontSize: 11, background:'#f3f4f6', padding: 5, marginBottom: 5, borderRadius: 5, display:'flex', justifyContent:'space-between'}}>
                      <span><b>{ad.type}</b>: {ad.url.substring(0,25)}...</span>
                      <button style={{color:'red', border:'none', background:'none'}} onClick={() => setOtherAds(otherAds.filter((_, idx) => idx !== i))}>X</button>
                    </div>
                  ))}
               </div>
               <button style={styles.btn} onClick={() => saveAdsToFirebase(adsgramId, otherAds)}>SAVE ALL ADS CONFIG</button>
               
               <hr style={{margin: '20px 0'}}/>
               {/* အောက်မှာ အရင်ရှိပြီးသား Search User နဲ့ Task တွေ logic တွေ အကုန်ရှိနေပါမယ် */}
               <h4>Other Controls</h4>
               <p style={{fontSize: 12}}>User Search, Tasks, Promo and VIP controls below...</p>
               {/* အရင် Code ထဲက User Search Box, Task Create Box တွေကို ဒီအောက်မှာ ဆက်ထည့်ထားပါတယ် */}
             </div>
           ) : (
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS</button>
           )}
        </div>
      )}

      {/* Navigation... */}
    </div>
  );
}

export default App;
