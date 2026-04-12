import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    localStorage.setItem('ton_balance', balance.toString());
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  const handleShowAd = (taskId) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: "27393" });
      AdController.show().then(() => {
        if (!completedTasks.includes(taskId)) {
          setBalance(prev => prev + 0.0005);
          setCompletedTasks(prev => [...prev, taskId]);
          setChecking(null);
          alert("✅ Success! 0.0005 TON added.");
        }
      }).catch(() => alert("⚠️ Please watch the full ad."));
    } else {
      alert("Ads SDK Loading...");
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

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((ch, i) => ({ id: `s${i}`, name: ch, link: `https://t.me/${ch.replace('@','')}` }));

  const styles = {
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    header: { textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    btnPrimary: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#000' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance */}
      <div style={styles.header}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '10px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false)}}>START BOT</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false)}}>SOCIAL</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false)}}>REWARD</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'social' && <button style={{ ...styles.btnPrimary, marginBottom: '15px' }} onClick={() => setShowPayForm(true)}>+ ADD TASK</button>}
              
              {activeTab === 'reward' && (
                <div style={styles.card}>
                  <p style={{ fontWeight: 'bold', color: '#94a3b8' }}>ENTER REWARD CODE:</p>
                  <input style={styles.input} type="text" placeholder="GIFT-CODE" />
                  <button style={styles.btnPrimary}>CLAIM NOW</button>
                </div>
              )}

              {(activeTab === 'bot' || activeTab === 'social') && 
                (activeTab === 'bot' ? botTasks : socialTasks).filter(t => !completedTasks.includes(t.id)).map(t => (
                <div key={t.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.name}</span>
                  {checking === t.id ? (
                    <button onClick={() => handleShowAd(t.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>CHECK</button>
                  ) : (
                    <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>START</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.card}>
              <h3 style={{ textAlign: 'center', color: '#fbbf24' }}>ADD TASK</h3>
              <input style={styles.input} placeholder="@ChannelUsername" />
              <input style={styles.input} placeholder="Channel Link" />
              <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Payment Memo: {userUID}</p>
              <button style={styles.btnPrimary} onClick={() => alert("Task submitted!")}>SUBMIT</button>
              <button style={{ ...styles.btnPrimary, background: 'none', color: '#94a3b8' }} onClick={() => setShowPayForm(false)}>BACK</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={{ padding: '10px' }}>
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <h2 style={{ color: '#fbbf24' }}>INVITE FRIENDS</h2>
            <p>🎁 <b>Rewards:</b></p>
            <p>• Per Friend: <span style={{ color: '#fbbf24' }}>0.0005 TON</span></p>
            <p>• Commission: <span style={{ color: '#fbbf24' }}>10% from tasks</span></p>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', marginTop: '20px', color: '#fbbf24', fontSize: '11px', wordBreak: 'break-all' }}>
              https://t.me/YourBot?start={userUID}
            </div>
          </div>
        </div>
      )}

      {activeNav === 'history' && (
        <div style={{ padding: '10px' }}>
          <h3>WITHDRAW HISTORY</h3>
          <table style={{ width: '100%', fontSize: '12px' }}>
            <thead style={{ color: '#94a3b8' }}>
              <tr><th align="left">Amount</th><th align="center">Status</th><th align="right">Date</th></tr>
            </thead>
            <tbody>
              <tr><td>0.1000 TON</td><td align="center" style={{ color: '#10b981' }}>SUCCESS</td><td align="right">2026-04-12</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2>MY PROFILE</h2>
          <div style={styles.card}>
            <p>User UID: {userUID}</p>
            <p>Status: <span style={{ color: '#10b981' }}>VERIFIED</span></p>
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('history')} style={{ textAlign: 'center', color: activeNav === 'history' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>💸<br/><small>HISTORY</small></div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
