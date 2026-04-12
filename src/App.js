import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? JSON.parse(saved) : 0.0000;
  });
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('completed_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  const showAdAndVerify = (taskId) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" });
      AdController.show()
        .then(() => {
          if (!completedTasks.includes(taskId)) {
            setBalance(prev => prev + 0.0005);
            setCompletedTasks(prev => [...prev, taskId]);
            setChecking(null);
            alert("✅ Verified! Reward added.");
          }
        })
        .catch(() => {
          alert("⚠️ Please watch the full ad to verify.");
        });
    } else {
      alert("Adsgram SDK not loaded yet.");
    }
  };

  const botTasks = [
    { id: 'bot_1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialChannels = ["GrowTeaNews", "GoldenMinerNews", "cryptogold_online_official", "M9460", "USDTcloudminer_channel", "ADS_TON1", "goblincrypto", "WORLDBESTCRYTO", "kombo_crypta", "easytonfree", "WORLDBESTCRYTO1", "MONEYHUB9_69", "zrbtua", "perviu1million"];
  const socialTasks = socialChannels.map((name, i) => ({ id: `soc_${i}`, name: `@${name}`.toUpperCase(), link: `https://t.me/${name}` }));

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '22px', border: '1px solid #334155', marginBottom: '12px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold' }),
    btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b' }
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.card, textAlign: 'center', borderColor: '#fbbf24'}}>
        <p style={{color: '#94a3b8'}}>AVAILABLE BALANCE</p>
        <h1 style={{color: '#fbbf24', fontSize: '36px'}}>{balance.toFixed(4)} TON</h1>
      </div>

      <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px'}}>
        <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>BOT</button>
        <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>SOCIAL</button>
      </div>

      {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
        <div key={t.id} style={styles.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
            <span>{t.name}</span>
            {checking === t.id ? (
              <button onClick={() => showAdAndVerify(t.id)} style={{...styles.btn, backgroundColor: '#10b981', color: 'white'}}>CHECK</button>
            ) : (
              <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={{...styles.btn, backgroundColor: '#fbbf24'}}>START</button>
            )}
          </div>
        </div>
      ))}

      {activeTab === 'social' && socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
        <div key={t.id} style={styles.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
            <span>{t.name}</span>
            {checking === t.id ? (
              <button onClick={() => showAdAndVerify(t.id)} style={{...styles.btn, backgroundColor: '#10b981', color: 'white'}}>CHECK</button>
            ) : (
              <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={{...styles.btn, backgroundColor: '#fbbf24'}}>JOIN</button>
            )}
          </div>
        </div>
      ))}

      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{color: activeNav === 'earn' ? '#fbbf24' : '#64748b'}}>💰 EARN</div>
        <div onClick={() => setActiveNav('withdraw')} style={{color: activeNav === 'withdraw' ? '#fbbf24' : '#64748b'}}>💸 HISTORY</div>
      </div>
    </div>
  );
}

export default App;
