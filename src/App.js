import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  MY_UID: "1793453606"
};

function App() {
  // ✅ အသစ်စသုံးသူအတွက် Balance ကို 0.0000 လို့ သတ်မှတ်ထားပါတယ်
  const [balance, setBalance] = useState(() => {
    const savedBal = localStorage.getItem('ton_bal');
    return savedBal !== null ? Number(savedBal) : 0.0000; 
  });

  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // ✅ Ads ကြည့်ပြီးမှ 0.0005 TON ပေါင်းမည့် Logic
  const handleAdsAndReward = (id) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADS_BLOCK_ID });
      AdController.show().then(() => {
        // Ads ကြည့်ပြီးမှ 0.0005 ပေါင်းပေးခြင်း
        const reward = 0.0005;
        const commission = reward * 0.10; // 10% Invite Bonus Logic
        setBalance(prev => Number((prev + reward + commission).toFixed(5)));
        setCompleted(prev => [...prev, id]);
        alert("Success! 0.0005 TON rewarded.");
      }).catch(() => alert("Ads failed. Please try again."));
    } else {
      // Test Mode (SDK မရှိလျှင်)
      setBalance(prev => Number((prev + 0.0005).toFixed(5)));
      setCompleted(prev => [...prev, id]);
      alert("Test: 0.0005 TON added.");
    }
  };

  const startTask = (id, link) => {
    window.open(link, '_blank');
    const btn = document.getElementById(`btn-${id}`);
    if (btn) {
      btn.innerText = "VERIFY TASK";
      btn.style.backgroundColor = "#10b981";
      btn.onclick = () => handleAdsAndReward(id); // ဒုတိယအကြိမ်နှိပ်မှ Ads ပြမည်
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px' },
    balanceCard: { textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', padding: '10px 0', borderTop: '1px solid #334155' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', cursor: 'pointer' })
  };

  return (
    <div style={styles.main}>
      {/* Balance Display */}
      <div style={styles.balanceCard}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === tab ? '#fbbf24' : '#1e293b' }}>{tab.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'bot' && [
            { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
            { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" }
          ].filter(t => !completed.includes(t.id)).map(task => (
            <div key={task.id} style={styles.card}>
              <p>{task.name}</p>
              <button id={`btn-${task.id}`} onClick={() => startTask(task.id, task.link)} style={styles.yellowBtn}>START BOT</button>
            </div>
          ))}
        </>
      )}

      {/* Navigation Buttons */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
