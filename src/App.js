import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest",
  ADSGRAM_BLOCK_ID: "27633", // သင်အသုံးပြုမဲ့ Block ID
  AD_REWARD: 0.0005
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // --- Watch Video ကြော်ငြာပြသရန် Function ---
  const handleWatchAd = () => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then(() => {
          setBalance(prev => Number((prev + APP_CONFIG.AD_REWARD).toFixed(5)));
          tg.showAlert("Success! +0.0005 TON received.");
        })
        .catch(() => tg.showAlert("Ad not available. Try again later."));
    } else {
      tg.showAlert("Adsgram Connection Error. Please reload.");
    }
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    if (!completed.includes(id)) {
      setBalance(prev => Number((prev + 0.0005).toFixed(5)));
      setCompleted(prev => [...prev, id]);
      tg.showAlert("Task Completed! +0.0005 TON");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    balanceCard: { background: '#000', color: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' },
    adBtn: { width: '100%', padding: '15px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginBottom: '20px' },
    card: { background: '#fff', padding: '15px', borderRadius: '15px', border: '2px solid #000' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.balanceCard}>
        <p style={{ margin: 0, opacity: 0.7 }}>BALANCE</p>
        <h1 style={{ fontSize: '32px', margin: '10px 0' }}>{balance.toFixed(5)} TON</h1>
        <small>UID: {APP_CONFIG.MY_UID}</small>
      </div>

      {/* Watch Video Button */}
      <button onClick={handleWatchAd} style={styles.adBtn}>
        📺 WATCH VIDEO (+0.0005 TON)
      </button>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        {['bot', 'social', 'reward'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
        ))}
      </div>

      <div style={styles.card}>
        {/* --- Task များ ပေါ်လာအောင် ဤနေရာတွင် Map လုပ်ထားပါသည် --- */}
        {activeTab === 'bot' && [
          { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
          { id: 'b2', name: "Golden Miner", link: "https://t.me/GoldenMinerBot" }
        ].filter(t => !completed.includes(t.id)).map(task => (
          <div key={task.id} style={styles.row}>
            <span>{task.name}</span>
            <button onClick={() => handleTaskAction(task.id, task.link)} style={{ background: '#000', color: '#fff', padding: '8px 15px', borderRadius: '8px', border: 'none' }}>START</button>
          </div>
        ))}

        {activeTab === 'social' && [
          { id: 's1', name: "@EasyTonNews", link: "https://t.me/GrowTeaNews" },
          { id: 's2', name: "@M9460 Channel", link: "https://t.me/M9460" }
        ].filter(t => !completed.includes(t.id)).map(task => (
          <div key={task.id} style={styles.row}>
            <span>{task.name}</span>
            <button onClick={() => handleTaskAction(task.id, task.link)} style={{ background: '#000', color: '#fff', padding: '8px 15px', borderRadius: '8px', border: 'none' }}>JOIN</button>
          </div>
        ))}

        {activeTab === 'reward' && <p style={{textAlign:'center'}}>Enter Promo Codes to earn more.</p>}
      </div>

      {/* Navigation Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', background: '#000', padding: '15px' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, textAlign: 'center', color: activeNav === n ? '#facc15' : '#fff', fontSize: '12px' }}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
