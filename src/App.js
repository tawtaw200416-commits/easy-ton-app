import React, { useState, useEffect } from 'react';

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', balance.toString());
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // Adsgram Show Ad
  const handleShowAd = (taskId) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" });
      AdController.show()
        .then(() => {
          if (!completedTasks.includes(taskId)) {
            setBalance(prev => prev + 0.0005);
            setCompletedTasks(prev => [...prev, taskId]);
            setChecking(null);
            alert("✅ Reward received: 0.0005 TON!");
          }
        })
        .catch(() => alert("⚠️ Please watch the full ad."));
    } else {
      alert("Adsgram SDK Loading... Check index.html script link.");
    }
  };

  // မိတ်ဆွေ ပို့ထားသော Bot List ၆ ခု အတိအကျ
  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'Arial' },
    header: { textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '15px', marginBottom: '20px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Display */}
      <div style={styles.header}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '32px', margin: '10px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>START BOT</button>
        <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>SOCIAL</button>
        <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>REWARD</button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'bot' && botTasks.map(t => (
          <div key={t.id} style={styles.card}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.name}</span>
            {checking === t.id ? (
              <button onClick={() => handleShowAd(t.id)} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>CHECK</button>
            ) : (
              <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>START</button>
            )}
          </div>
        ))}
        {activeTab === 'social' && <div style={{textAlign:'center', marginTop:'20px'}}>Social tasks coming soon...</div>}
        {activeTab === 'reward' && <div style={{textAlign:'center', marginTop:'20px'}}>No rewards available.</div>}
      </div>

      {/* Navigation Footer */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign:'center', color: activeNav === 'earn' ? '#fbbf24' : '#64748b', cursor:'pointer' }}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign:'center', color: activeNav === 'invite' ? '#fbbf24' : '#64748b', cursor:'pointer' }}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('history')} style={{ textAlign:'center', color: activeNav === 'history' ? '#fbbf24' : '#64748b', cursor:'pointer' }}>💸<br/><small>HISTORY</small></div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign:'center', color: activeNav === 'profile' ? '#fbbf24' : '#64748b', cursor:'pointer' }}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
