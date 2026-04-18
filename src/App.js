import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27632", // Bro ရဲ့ Unit ID
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // Adsgram Controller Function
  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;

    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });

      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          if (callback) callback();
        })
        .catch((result) => {
          setIsAdLoading(false);
          alert(`Error: ${result.description || "Ad missed"}. VPN ပိတ်ပြီး ပြန်စမ်းပါ။`);
        });
    } else {
      alert("Adsgram Script မတွေ့ပါ။ index.html ကို ပြန်စစ်ပေးပါ။");
    }
  };

  const syncToFirebase = (path, data) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, { method: 'PATCH', body: JSON.stringify(data) });
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`);
        const data = await res.json();
        if (data) { 
          setBalance(Number(data.balance || 0)); 
          setCompleted(data.completed || []); 
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: '#000', padding: '20px', borderRadius: '20px', color: '#fff', border: '4px solid #fff' },
    btn: { width: '100%', padding: '15px', backgroundColor: '#000', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', marginTop: '10px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' })
  };

  if (loading) return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center', background:'#facc15'}}>LOADING...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>MY BALANCE</small>
        <h1 style={{fontSize: '32px', margin: '5px 0'}}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={{marginTop: '25px'}}>
          <h3 style={{textAlign: 'center'}}>Daily Tasks</h3>
          <button 
            style={{...styles.btn, backgroundColor: isAdLoading ? '#555' : '#ef4444'}} 
            disabled={isAdLoading}
            onClick={() => runTaskWithAd(() => {
              const newBal = balance + 0.0001;
              setBalance(newBal);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
              alert("Reward Added!");
            })}
          >
            {isAdLoading ? '⌛ LOADING AD...' : '📺 WATCH VIDEO'}
          </button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
