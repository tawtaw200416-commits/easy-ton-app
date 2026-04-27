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
  const [balance, setBalance] = useState(() => Number(localStorage.getItem(`ton_bal_${APP_CONFIG.MY_UID}`)) || 0.0000);
  const [isVip, setIsVip] = useState(VIP_IDS.includes(APP_CONFIG.MY_UID));
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(`comp_tasks_${APP_CONFIG.MY_UID}`)) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem(`wd_hist_${APP_CONFIG.MY_UID}`)) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem(`refs_${APP_CONFIG.MY_UID}`)) || []);
  const [adsWatched, setAdsWatched] = useState(() => Number(localStorage.getItem(`ads_watched_${APP_CONFIG.MY_UID}`)) || 0);
  
  const [customTasks, setCustomTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  // --- Enhanced Ads Management States ---
  const [adsgramBlockId, setAdsgramBlockId] = useState("27611");
  const [externalAds, setExternalAds] = useState([]); // List of {type: 'adsterra', link: '...'}
  const [newAdLink, setNewAdLink] = useState('');
  const [newAdType, setNewAdType] = useState('Adsterra'); 

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [adminTaskName, setAdminTaskName] = useState('');
  const [adminTaskLink, setAdminTaskLink] = useState('');
  const [adminTaskType, setAdminTaskType] = useState('bot');

  const [searchUserId, setSearchUserId] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [newBalanceInput, setNewBalanceInput] = useState(''); 

  const handleReferral = useCallback(async () => {
    const startParam = tg?.initDataUnsafe?.start_param; 
    const isNewUser = !localStorage.getItem(`joined_${APP_CONFIG.MY_UID}`);
    if (startParam && isNewUser && startParam !== APP_CONFIG.MY_UID) {
      try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`);
        const inviterData = await res.json();
        if (inviterData) {
          const newInviterBalance = Number((Number(inviterData.balance || 0) + APP_CONFIG.REFER_REWARD).toFixed(5));
          const newInviterRefs = inviterData.referrals ? [...Object.values(inviterData.referrals), { id: APP_CONFIG.MY_UID }] : [{ id: APP_CONFIG.MY_UID }];
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${startParam}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newInviterBalance, referrals: newInviterRefs })
          });
          localStorage.setItem(`joined_${APP_CONFIG.MY_UID}`, 'true');
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [u, t, a] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_v2.json`)
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
        setAdsgramBlockId(adsData.adsgramId || "27611");
        setExternalAds(adsData.externalAds || []);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); handleReferral(); }, [fetchData, handleReferral]);

  const processReward = async (id, rewardAmount) => {
    let isWatchAd = id === 'watch_ad';
    let finalReward = isWatchAd ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;

    if (isWatchAd) {
      // ၁။ ထည့်ထားတဲ့ External Ads အားလုံးကို အရင်ဖွင့်မယ်
      externalAds.forEach(ad => window.open(ad.link, '_blank'));

      // ၂။ Verification အနေနဲ့ Adsgram ကို ပြမယ်
      if (window.Adsgram) {
        const AdController = window.Adsgram.init({ blockId: adsgramBlockId });
        AdController.show().then((result) => {
          if (result.done) {
            updateBalance(finalReward, true);
          }
        });
      }
    } else {
        updateBalance(finalReward, false, id);
    }
  };

  const updateBalance = (reward, isAd, taskId = null) => {
    const newBal = Number((balance + reward).toFixed(5));
    const newAdsCount = isAd ? adsWatched + 1 : adsWatched;
    const newCompleted = taskId && !completed.includes(taskId) ? [...completed, taskId] : completed;

    setBalance(newBal);
    if (isAd) setAdsWatched(newAdsCount);
    if (taskId) setCompleted(newCompleted);

    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, adsWatched: newAdsCount, completed: newCompleted })
    });
    alert(`Success: +${reward} TON`);
  };

  const saveAdsConfig = async () => {
    await fetch(`${APP_CONFIG.FIREBASE_URL}/admin_settings/ads_v2.json`, {
      method: 'PUT',
      body: JSON.stringify({ adsgramId: adsgramBlockId, externalAds: externalAds })
    });
    alert("Ads Config Saved!");
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #000', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.main}>
      <div style={{textAlign: 'center', background: '#000', padding: '25px', borderRadius: '25px', marginBottom: '15px', color: '#fff', border: '3px solid #fff'}}>
        <small style={{color: '#facc15'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize: '38px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{...styles.card, background: '#000', color: '#fff', textAlign: 'center'}}>
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH MULTI-ADS</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' && (
              <div>
                <h4 style={{color: '#3b82f6'}}>📺 ADS MANAGER (MULTI-TYPE)</h4>
                <label>Adsgram ID:</label>
                <input style={styles.input} value={adsgramBlockId} onChange={e => setAdsgramBlockId(e.target.value)} />
                
                <hr/>
                <label>Add External Ad (Adsterra, etc.):</label>
                <select style={styles.input} value={newAdType} onChange={e => setNewAdType(e.target.value)}>
                    <option value="Adsterra">Adsterra</option>
                    <option value="Direct Link">Direct Link</option>
                    <option value="Other">Other</option>
                </select>
                <input style={styles.input} placeholder="Paste Link Here" value={newAdLink} onChange={e => setNewAdLink(e.target.value)} />
                <button style={{...styles.btn, marginBottom: '10px'}} onClick={() => {
                    if(newAdLink) {
                        setExternalAds([...externalAds, { type: newAdType, link: newAdLink }]);
                        setNewAdLink('');
                    }
                }}>ADD TO LIST</button>

                <div style={{maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '5px', borderRadius: '8px'}}>
                    {externalAds.map((ad, i) => (
                        <div key={i} style={{fontSize: '11px', display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid #eee'}}>
                            <span><b>[{ad.type}]</b> {ad.link.substring(0, 20)}...</span>
                            <button onClick={() => setExternalAds(externalAds.filter((_, idx) => idx !== i))} style={{color: 'red', border: 'none', background: 'none'}}>DEL</button>
                        </div>
                    ))}
                </div>
                <button style={{...styles.btn, background: '#10b981', marginTop: '10px'}} onClick={saveAdsConfig}>SAVE ALL ADS CONFIG</button>
                
                {/* --- Other Admin Tools (Search, Tasks) Stay Here --- */}
              </div>
            )}
            
            {/* BOT/SOCIAL lists here... */}
          </div>
        </>
      )}

      {/* Navigation and other screens... */}
    </div>
  );
}

export default App;
