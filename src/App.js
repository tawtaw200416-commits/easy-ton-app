import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [rewardClaimed, setRewardClaimed] = useState(() => localStorage.getItem('reward_claimed') === 'true');
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTaskMenu, setShowAddTaskMenu] = useState(false);
  const [showForm, setShowForm] = useState(null);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', balance.toString());
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('reward_claimed', rewardClaimed);
  }, [balance, completedTasks, rewardClaimed]);

  const handleShowAd = (taskId) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" });
      AdController.show().then(() => {
        if (!completedTasks.includes(taskId)) {
          setBalance(prev => prev + 0.0005);
          setCompletedTasks(prev => [...prev, taskId]);
          setChecking(null);
          alert("Success! 0.0005 TON added.");
        }
      }).catch(() => alert("Please watch the full ad."));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const claimRewardCode = (code) => {
    if (rewardClaimed) {
      alert("You have already claimed this reward!");
      return;
    }
    // ဒီမှာ မိတ်ဆွေ ပေးချင်တဲ့ Code ကို သတ်မှတ်ပါ (ဥပမာ: GIFT77)
    if (code.toUpperCase() === "GIFT77") {
      setBalance(prev => prev + 0.005); // Reward အနေနဲ့ 0.005 ပေးမယ်ဆိုပါစို့
      setRewardClaimed(true);
      alert("Congratulations! 0.005 TON rewarded.");
    } else {
      alert("Invalid Reward Code!");
    }
  };

  const botTasks = [
    { id: 'b1', name: "GROW TEA BOT", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GOLDEN MINER BOT", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WORKERS ON TON BOT", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "EASY BONUS BOT", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "TON DRAGON BOT", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "POBUZZ BOT", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    btnYellow: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#fbbf24', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Balance */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>START BOT</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>REWARD</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>SOCIAL</button>
          </div>

          {/* Start Bot with COPY Link */}
          {activeTab === 'bot' && botTasks.map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.name}</span>
                <button onClick={() => copyToClipboard(t.link)} style={{ background: '#334155', color: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px' }}>COPY</button>
              </div>
              <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={styles.btnYellow}>START BOT</button>
              {checking === t.id && (
                <button onClick={() => handleShowAd(t.id)} style={{ ...styles.btnYellow, backgroundColor: '#10b981', color: '#fff', marginTop: '10px' }}>CHECK TASK</button>
              )}
            </div>
          ))}

          {/* Reward Tab (Single Use Code) */}
          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>DAILY REWARD CODE</h4>
              {rewardClaimed ? (
                <p style={{ color: '#10b981', textAlign: 'center' }}>✅ Code already claimed!</p>
              ) : (
                <>
                  <input id="rewardInput" style={styles.input} type="text" placeholder="Enter code (e.g. GIFT77)" />
                  <button 
                    style={styles.btnYellow} 
                    onClick={() => claimRewardCode(document.getElementById('rewardInput').value)}
                  >
                    CLAIM REWARD
                  </button>
                </>
              )}
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px' }}>* You can claim a reward code only once.</p>
            </div>
          )}

          {/* Social Tab (Same logic) */}
          {activeTab === 'social' && (
            <div style={{ textAlign: 'center' }}>
               <button style={styles.btnYellow} onClick={() => alert("Social tasks coming soon!")}>+ ADD TASK</button>
            </div>
          )}
        </>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#64748b' }}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#64748b' }}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('history')} style={{ textAlign: 'center', color: activeNav === 'history' ? '#fbbf24' : '#64748b' }}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#64748b' }}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
