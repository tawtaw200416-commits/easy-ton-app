import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [taskSubTab, setTaskSubTab] = useState('add');
  const [showPayForm, setShowPayForm] = useState(false);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // Adsgram logic
  const showAdAndVerify = (taskId) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" });
      AdController.show()
        .then(() => {
          if (!completedTasks.includes(taskId)) {
            setBalance(prev => prev + 0.0005);
            setCompletedTasks(prev => [...prev, taskId]);
            setChecking(null);
            alert("✅ Verified! 0.0005 TON added.");
          }
        })
        .catch(() => {
          alert("⚠️ Please watch the full ad to verify.");
        });
    } else {
      alert("Ads SDK not found. Check your index.html");
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

  const startTask = (task) => {
    window.open(task.link, '_blank');
    setChecking(task.id); 
  };

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '22px', border: '1px solid #334155', marginBottom: '12px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', fontSize: '12px' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      <div style={{...styles.card, textAlign: 'center', border: '1px solid #fbbf24'}}>
        <p style={{color: '#94a3b8', fontSize: '11px'}}>TOTAL BALANCE</p>
        <h1 style={{color: '#fbbf24', fontSize: '42px', margin: '10px 0'}}>{balance.toFixed(4)} <span style={{fontSize: '18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px'}}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>BOT</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>SOCIAL</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>REWARD</button>
          </div>

          {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                <span>{t.name}</span>
                {checking === t.id ? (
                  <button onClick={() => showAdAndVerify(t.id)} style={{backgroundColor: '#10b981', color: 'white', padding: '8px', borderRadius: '8px', border: 'none'}}>CHECK</button>
                ) : (
                  <button onClick={() => startTask(t)} style={{backgroundColor: '#fbbf24', padding: '8px', borderRadius: '8px', border: 'none'}}>START</button>
                )}
              </div>
            </div>
          ))}

          {activeTab === 'social' && socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                <span>{t.name}</span>
                {checking === t.id ? (
                  <button onClick={() => showAdAndVerify(t.id)} style={{backgroundColor: '#10b981', color: 'white', padding: '8px', borderRadius: '8px', border: 'none'}}>CHECK</button>
                ) : (
                  <button onClick={() => startTask(t)} style={{color: '#38bdf8', background: 'none', border: 'none'}}>JOIN</button>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h2>WITHDRAW</h2>
          <input style={styles.input} placeholder="AMOUNT" />
          <input style={styles.input} placeholder="TON ADDRESS" />
          <button style={styles.btn}>WITHDRAW NOW</button>
        </div>
      )}

      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{color: activeNav === 'earn' ? '#fbbf24' : '#64748b'}}>💰 EARN</div>
        <div onClick={() => setActiveNav('withdraw')} style={{color: activeNav === 'withdraw' ? '#fbbf24' : '#64748b'}}>💸 HISTORY</div>
      </div>
    </div>
  );
}

export default App;
