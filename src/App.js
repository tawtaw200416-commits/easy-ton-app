import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  // Admin Information
  ADMIN_UID: "1793453606", 
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  
  // Ad Settings
  ADSGRAM_BLOCK_ID: "27611", // Your Unit ID from the screenshot
  AD_REWARD: 0.0005,
  TASK_REWARD: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('done_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('done_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // Adsgram Ad Handler
  const showAd = () => {
    if (window.Adsgram) {
      const adController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      adController.show()
        .then(() => {
          setBalance(prev => Number((prev + APP_CONFIG.AD_REWARD).toFixed(5)));
          tg.showAlert("Success! Reward added to balance.");
        })
        .catch(() => {
          tg.showAlert("Ad not available. Please try again later.");
        });
    } else {
      tg.showAlert("Connecting to Adsgram... please wait.");
    }
  };

  const handleTask = (id, link) => {
    window.open(link, '_blank');
    if (!completed.includes(id)) {
      setTimeout(() => {
        setBalance(prev => Number((prev + APP_CONFIG.TASK_REWARD).toFixed(5)));
        setCompleted([...completed, id]);
        tg.showAlert("Task Completed!");
      }, 3000);
    }
  };

  const styles = {
    container: { backgroundColor: '#facc15', minHeight: '100vh', padding: '20px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    balanceCard: { background: '#000', color: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '4px solid #fff' },
    videoBtn: { width: '100%', padding: '16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', marginBottom: '20px', fontSize: '16px' },
    taskItem: { background: '#fff', padding: '15px', borderRadius: '15px', border: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#000', display: 'flex', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' })
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.balanceCard}>
        <small style={{ opacity: 0.6 }}>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '36px', margin: '10px 0' }}>{balance.toFixed(5)} TON</h1>
        <div style={{ fontSize: '10px', color: '#4ade80' }}>● SYSTEM ACTIVE</div>
      </div>

      {/* Main Earn Section */}
      {activeNav === 'earn' && (
        <>
          <button onClick={showAd} style={styles.videoBtn}>
            📺 WATCH VIDEO (+0.0005 TON)
          </button>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #000', background: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot" }
            ].filter(t => !completed.includes(t.id)).map(task => (
              <div key={task.id} style={styles.taskItem}>
                <span>{task.name}</span>
                <button onClick={() => handleTask(task.id, task.link)} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px' }}>START</button>
              </div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@EasyTonNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@EasyTonFree", link: "https://t.me/easytonfree" }
            ].filter(t => !completed.includes(t.id)).map(task => (
              <div key={task.id} style={styles.taskItem}>
                <span>{task.name}</span>
                <button onClick={() => handleTask(task.id, task.link)} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px' }}>JOIN</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Profile Section */}
      {activeNav === 'profile' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '2px solid #000' }}>
          <h3>USER PROFILE</h3>
          <p><b>UID:</b> {APP_CONFIG.MY_UID}</p>
          <p><b>Wallet:</b> Verified</p>
        </div>
      )}

      {/* Navigation Bar */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
