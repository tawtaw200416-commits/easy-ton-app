import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', balance.toString());
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // Adsgram Show Ad Function
  const handleShowAd = (taskId) => {
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
        .catch((err) => {
          console.error("Ad Error:", err);
          alert("⚠️ Please watch the full ad to get reward.");
        });
    } else {
      alert("Ads SDK Loading... please check your internet.");
    }
  };

  // မိတ်ဆွေ ပို့ထားပေးတဲ့ Bot List အသစ် ၆ ခု
  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    { id: 's1', name: "@GROWTEANEWS", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GOLDENMINERNEWS", link: "https://t.me/GoldenMinerNews" },
    { id: 's3', name: "@CRYPTOGOLD_ONLINE", link: "https://t.me/cryptogold_online_official" },
    { id: 's4', name: "@M9460", link: "https://t.me/M9460" }
  ];

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '80px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold', fontSize: '12px' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
    btnStart: { backgroundColor: '#fbbf24', padding: '8px 15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#000' },
    btnCheck: { backgroundColor: '#10b981', padding: '8px 15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#fff' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '5px 0' }}>{balance.toFixed(4)} <span style={{fontSize:'16px'}}>TON</span></h1>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', backgroundColor: '#1e293b', padding: '5px', borderRadius: '12px' }}>
        <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>START BOT</button>
        <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>SOCIAL</button>
        <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>REWARD</button>
      </div>

      <div>
        {(activeTab === 'bot' ? botTasks : socialTasks).filter(t => !completedTasks.includes(t.id)).map(t => (
          <div key={t.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{t.name}</span>
              {checking === t.id ? (
                <button style={styles.btnCheck} onClick={() => handleShowAd(t.id)}>CHECK</button>
              ) : (
                <button style={styles.btnStart} onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }}>START</button>
              )}
            </div>
          </div>
        ))}
        {activeTab === 'reward' && <div style={{textAlign:'center', color:'#64748b', marginTop:'20px'}}>No rewards currently available.</div>}
      </div>

      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign:'center', color: activeNav === 'earn' ? '#fbbf24' : '#64748b', fontSize: '10px' }}>💰<br/>EARN</div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign:'center', color: activeNav === 'invite' ? '#fbbf24' : '#64748b', fontSize: '10px' }}>👥<br/>INVITE</div>
        <div onClick={() => setActiveNav('history')} style={{ textAlign:'center', color: activeNav === 'history' ? '#fbbf24' : '#64748b', fontSize: '10px' }}>💸<br/>HISTORY</div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign:'center', color: activeNav === 'profile' ? '#fbbf24' : '#64748b', fontSize: '10px' }}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
