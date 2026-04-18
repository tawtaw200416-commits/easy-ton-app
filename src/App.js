import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27611", // Corrected Unit ID
  REWARD_AMOUNT: 0.0005
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  const handleAdsAction = (taskId, link) => {
    if (isAdLoading) return;

    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      
      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          setBalance(prev => Number((prev + APP_CONFIG.REWARD_AMOUNT).toFixed(5)));
          setCompleted(prev => [...prev, taskId]);
          window.open(link, '_blank');
          alert(`Reward Received! +${APP_CONFIG.REWARD_AMOUNT} TON`);
        })
        .catch((err) => {
          setIsAdLoading(false);
          alert("Ad failed to load. Please check your internet or VPN.");
        });
    } else {
      alert("Error: Adsgram Script is not loaded properly.");
    }
  };

  const styles = {
    header: { textAlign: 'center', background: '#000', color: '#fff', padding: '30px', borderRadius: '0 0 30px 30px', borderBottom: '5px solid #fff' },
    card: { background: '#fff', margin: '15px', padding: '20px', borderRadius: '20px', border: '3px solid #000' },
    btn: { width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, width: '100%', display: 'flex', background: '#000', padding: '15px 0', borderTop: '3px solid #fff' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' })
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={styles.header}>
        <small>BALANCE</small>
        <h1 style={{ fontSize: '40px', margin: '10px 0' }}>{balance.toFixed(5)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <h3>Daily Tasks</h3>
          {[
            { id: 't1', name: "Watch Ad & Join Channel", link: "https://t.me/easytonfree" },
            { id: 't2', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" }
          ].filter(t => !completed.includes(t.id)).map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span>{task.name}</span>
              <button onClick={() => handleAdsAction(task.id, task.link)} style={{ ...styles.btn, width: '80px', padding: '10px' }}>
                {isAdLoading ? '...' : 'START'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3>USER PROFILE</h3>
          <p>UID: {APP_CONFIG.MY_UID}</p>
          <p>Status: <span style={{ color: 'green' }}>Verified</span></p>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
