့  const [rewardCodeInput, setRewardCodeInput] = useState('');

  const [lastAdTime, setLastAdTime] = useState(0);
  const [isWaitingForAd, setIsWaitingForAd] = useState(false);

  // --- Mandatory Ad Trigger (10 Seconds) ---
  const triggerAds = useCallback(() => {
    setLastAdTime(Date.now());
    setIsWaitingForAd(true);
    window.open(APP_CONFIG.ADVERTIC_URL, '_blank');
    setTimeout(() => {
        window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    }, 300);
  }, []);

  const checkAdTimer = () => {
    if (!isWaitingForAd) return true;
    const elapsed = (Date.now() - lastAdTime) / 1000;
    if (elapsed < 10) {
      alert("Please stay on the ad for 10 seconds! (ကြော်ငြာကို ၁၀ စက္ကန့်ပြည့်အောင်ကြည့်ပါ)");
      triggerAds();
      return false;
    }
    setIsWaitingForAd(false);
    return true;
  };

  // Trigger ads on every button interaction
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const btn = e.target.closest('button');
      if (btn && !isWaitingForAd) {
        triggerAds();
      }
    };
    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, [triggerAds, isWaitingForAd]);

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

  // --- Reward Processing ---
  const processReward = (id, rewardAmount) => {
    if (!checkAdTimer()) return;

    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then((result) => {
        if (result.done) {
          const isWatchAd = id === 'watch_ad';
          const finalReward = isWatchAd ? (isVip ? APP_CONFIG.VIP_WATCH_REWARD : APP_CONFIG.WATCH_REWARD) : rewardAmount;
          
          const newBal = Number((balance + finalReward).toFixed(5));
          const newAdsCount = isWatchAd ? adsWatched + 1 : adsWatched;
          const newCompleted = !isWatchAd ? [...completed, id] : completed;

          setBalance(newBal);
          if (isWatchAd) setAdsWatched(newAdsCount);
          if (!isWatchAd) setCompleted(newCompleted);

          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ balance: newBal, completed: newCompleted, adsWatched: newAdsCount })
          });
          alert(`Reward Success: +${finalReward} TON`);
          setIsWaitingForAd(false);
          fetchData();
        }
      });
    }
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
             <button style={{...styles.btn, background: '#facc15', color: '#000'}} onClick={() => processReward('watch_ad', 0)}>WATCH ADS (ADSGRAM)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && 
              <button key={t} onClick={() => checkAdTimer() && setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', borderRadius: '10px', fontWeight: 'bold', border: '1px solid #000' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => { window.open(t.link, '_blank'); setTimeout(() => processReward(t.id, 0.001), 1500); }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
              </div>
            ))}
            {activeTab === 'social' && customTasks.filter(t => t.type === 'social').map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span style={{fontWeight:'bold'}}>{t.name}</span>
                <button onClick={() => { window.open(t.link, '_blank'); setTimeout(() => processReward(t.id, 0.001), 1500); }} style={{ background: completed.includes(t.id) ? '#ccc' : '#000', color: '#fff', padding: '6px 12px', borderRadius: '6px', border:'none' }}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
              </div>
            ))}
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCodeInput} onChange={e => setRewardCodeInput(e.target.value)} />
                <button style={styles.btn} onClick={() => processReward('c_'+rewardCodeInput, APP_CONFIG.CODE_REWARD)}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={styles.btn} onClick={() => {
              const amt = Number(withdrawAmount);
              if(amt < APP_CONFIG.MIN_WITHDRAW || amt > balance) return alert("Check Balance");
              const entry = { amount: withdrawAmount, address: withdrawAddress, timestamp: Date.now(), date: new Date().toLocaleString(), status: 'Pending' };
              const newBal = Number((balance - amt).toFixed(5));
              setBalance(newBal);
              fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, { method: 'PATCH', body: JSON.stringify({ balance: newBal, withdrawHistory: [entry, ...withdrawHistory] }) });
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
