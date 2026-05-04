import React, { useState, useEffect, useCallback } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  // Firebase URL from your screenshot
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  PROXY_URL: "https://easyton-proxy.dev-it.workers.dev",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot",
  MIN_WITHDRAW: 0.1,
  WATCH_REWARD: 0.0004, 
  VIP_WATCH_REWARD: 0.0008, 
  CODE_REWARD: 0.0008,
  REFER_REWARD: 0.01,
  // Ad URLs
  ADVERTICA_URL: "https://data527.click/a674e1237b7e268eb5f6/ef64792c34/?placementName=default",
  ADSTERRA_URL: "https://www.profitablecpmratenetwork.com/vaiuqbkrs?key=e7bc503795fad73e1b0e552a20539aec"
};

// Prize Logic for Tournament
const getPrize = (index) => {
  const rank = index + 1;
  if (rank === 1) return "5.00";
  if (rank === 2) return "3.00";
  if (rank === 3) return "1.00";
  if (rank >= 4 && rank <= 5) return "0.9";
  if (rank >= 6 && rank <= 8) return "0.8";
  if (rank >= 9 && rank <= 12) return "0.7";
  if (rank >= 13 && rank <= 14) return "0.5";
  if (rank === 15) return "0.4";
  if (rank >= 16 && rank <= 19) return "0.3";
  if (rank >= 20 && rank <= 24) return "0.2";
  if (rank >= 25 && rank <= 30) return "0.1";
  return "0.0";
};

function App() {
  // --- States ---
  const [balance, setBalance] = useState(0);
  const [adsWatched, setAdsWatched] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [lastActionTime, setLastActionTime] = useState(0);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      // Fetch user specific data
      const userRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
      const userData = await userRes.json();
      
      // Fetch all users for Leaderboard (Tournament)
      const allRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users.json`);
      const allData = await allRes.json();

      if (userData) {
        setBalance(Number(userData.balance || 0));
        setAdsWatched(userData.adsWatched || 0);
      }

      if (allData) {
        const formattedUsers = Object.keys(allData).map(key => ({
          id: key,
          balance: Number(allData[key].balance || 0)
        }));
        setAllUsers(formattedUsers);
      }
      setIsLoading(false);
    } catch (e) {
      console.error("Firebase Sync Error:", e);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- Rewards Logic ---
  const handleWatchAd = () => {
    window.open(APP_CONFIG.ADSTERRA_URL, '_blank');
    setLastActionTime(Date.now());
    
    // Simple 30s check simulation
    setTimeout(async () => {
      const newBal = Number((balance + APP_CONFIG.WATCH_REWARD).toFixed(5));
      const newCount = adsWatched + 1;
      
      setBalance(newBal);
      setAdsWatched(newCount);

      // Save to Firebase (Matches your public Rules)
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, adsWatched: newCount })
      });
      alert(`Success! +${APP_CONFIG.WATCH_REWARD} TON added.`);
    }, 2000); // Demo delay
  };

  // --- Styles (Matching your screenshots) ---
  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '80px', fontFamily: 'sans-serif' },
    cardBlack: { backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '15px', color: '#fff', textAlign: 'center', marginBottom: '15px', border: '2px solid #000' },
    cardWhite: { backgroundColor: '#fff', borderRadius: '15px', border: '2px solid #000', overflow: 'hidden', marginBottom: '15px' },
    btnYellow: { width: '100%', padding: '12px', backgroundColor: '#facc15', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', marginTop: '10px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px' },
    navBtn: (active) => ({ flex: 1, background: 'none', border: 'none', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '10px' }),
    tableHeader: { background: '#000', color: '#facc15', padding: '10px' }
  };

  if (isLoading) return <div style={styles.main}>Loading System...</div>;

  return (
    <div style={styles.main}>
      {/* Top Balance Card (From Screenshot) */}
      <div style={styles.cardBlack}>
        <small style={{ opacity: 0.7 }}>AVAILABLE BALANCE</small>
        <h1 style={{ fontSize: '32px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
        <button style={styles.btnYellow} onClick={handleWatchAd}>
          WATCH ADS (30s)
        </button>
      </div>

      {/* Tournament / Leaderboard Section (From Screenshot) */}
      <div style={styles.cardWhite}>
        <div style={styles.tableHeader}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>🏆 TOP 30 LEADERS</h3>
          <small>Season 1 Active Tournament</small>
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ background: '#eee' }}>
              <tr>
                <th style={{ padding: '8px' }}>RANK</th>
                <th style={{ padding: '8px' }}>UID</th>
                <th style={{ padding: '8px' }}>BAL</th>
                <th style={{ padding: '8px' }}>PRIZE</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length > 0 ? (
                allUsers.sort((a, b) => b.balance - a.balance).slice(0, 30).map((user, index) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <td style={{ padding: '10px' }}>#{index + 1}</td>
                    <td style={{ padding: '10px' }}>{user.id}</td>
                    <td style={{ padding: '10px' }}>{user.balance.toFixed(4)}</td>
                    <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>{getPrize(index)} TON</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Refreshing...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={styles.nav}>
        {['earn', 'rank', 'invite', 'withdraw', 'profile'].map(n => (
          <button 
            key={n} 
            onClick={() => setActiveNav(n)} 
            style={styles.navBtn(activeNav === n)}
          >
            {n.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
