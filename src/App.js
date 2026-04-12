import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTaskMenu, setShowAddTaskMenu] = useState(false);
  const [showForm, setShowForm] = useState(null);
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
          alert("Success! 0.0005 TON added.");
        }
      }).catch(() => alert("Please watch the full ad."));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Link Copied!");
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
    container: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    btnYellow: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#fbbf24', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Display */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowAddTaskMenu(false)}}>START BOT</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowAddTaskMenu(false)}}>REWARD</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowAddTaskMenu(false)}}>SOCIAL</button>
          </div>

          {/* Reward Tab with Input Code */}
          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>ENTER REWARD CODE</h4>
              <input style={styles.input} type="text" placeholder="Enter code here..." />
              <button style={styles.btnYellow} onClick={() => alert("Invalid Code!")}>CLAIM NOW</button>
            </div>
          )}

          {/* Start Bot Tab with Copy Feature */}
          {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.name}</span>
                <button onClick={() => copyToClipboard(t.link)} style={{ background: '#334155', color: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '5px', fontSize: '10px' }}>COPY LINK</button>
              </div>
              {checking === t.id ? (
                <button onClick={() => handleShowAd(t.id)} style={{ ...styles.btnYellow, backgroundColor: '#10b981', color: '#fff' }}>CHECK</button>
              ) : (
                <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={styles.btnYellow}>START</button>
              )}
            </div>
          ))}

          {/* Social Tab */}
          {activeTab === 'social' && !showAddTaskMenu && (
            <>
              <button style={{ ...styles.btnYellow, marginBottom: '15px' }} onClick={() => setShowAddTaskMenu(true)}>+ ADD TASK</button>
              {socialTasks.filter(t => !completedTasks.includes(t.id)).map(t => (
                <div key={t.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.name}</span>
                  {checking === t.id ? (
                    <button onClick={() => handleShowAd(t.id)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>CHECK</button>
                  ) : (
                    <button onClick={() => { window.open(t.link, '_blank'); setChecking(t.id); }} style={{ backgroundColor: '#fbbf24', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>START</button>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Add Task Menus (Same as previous) */}
          {activeTab === 'social' && showAddTaskMenu && (
            <div style={styles.card}>
              {!showForm ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.btnYellow} onClick={() => setShowForm('add')}>ADD TASK</button>
                  <button style={{ ...styles.btnYellow, backgroundColor: '#334155', color: '#fff' }} onClick={() => setShowForm('my')}>MY TASK</button>
                </div>
              ) : showForm === 'add' ? (
                <div>
                  <h4 style={{ textAlign: 'center' }}>CREATE TASK</h4>
                  <input style={styles.input} placeholder="Task Name" />
                  <input style={styles.input} placeholder="Telegram Link" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                    <option>200 Views - 0.4 TON</option>
                    <option>300 Views - 0.5 TON</option>
                  </select>
                  <p style={{ fontSize: '10px', color: '#fbbf24' }}>Send to: UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</p>
                  <p style={{ fontSize: '10px' }}>MEMO: {userUID}</p>
                  <button style={styles.btnYellow} onClick={() => {alert("Submitted!"); setShowForm(null); setShowAddTaskMenu(false)}}>SUBMIT</button>
                </div>
              ) : (
                <div>
                  <h4>MY TASKS</h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>No tasks found.</p>
                  <button style={styles.btnYellow} onClick={() => setShowForm(null)}>BACK</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Other Navigation Panels (Invite, Withdraw, Profile) */}
      {activeNav === 'invite' && (
        <div style={{ padding: '10px' }}>
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <h2>INVITE</h2>
            <p>0.0005 TON per refer</p>
            <div style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', fontSize: '11px', color: '#fbbf24' }}>https://t.me/YourBot?start={userUID}</div>
            <button style={{ ...styles.btnYellow, marginTop: '10px' }} onClick={() => copyToClipboard(`https://t.me/YourBot?start=${userUID}`)}>COPY LINK</button>
          </div>
          <h3>HISTORY</h3>
          <div style={styles.card}>Total: 0 invited</div>
        </div>
      )}

      {activeNav === 'history' && (
        <div style={{ padding: '10px' }}>
          <h3>WITHDRAW</h3>
          <div style={styles.card}>
            <input style={styles.input} placeholder="Amount" />
            <input style={styles.input} placeholder="Address" />
            <button style={styles.btnYellow}>WITHDRAW</button>
          </div>
          <h3>HISTORY</h3>
          <p style={{ color: '#94a3b8' }}>No history.</p>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>UID: {userUID}</h3>
          <div style={{ border: '1px solid #ef4444', padding: '15px', borderRadius: '15px', marginTop: '20px' }}>
            <h4 style={{ color: '#ef4444' }}>WARNING</h4>
            <p style={{ fontSize: '12px' }}>Fake accounts or scripts = PERMANENT BAN.</p>
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>💰<br/><small>EARN</small></div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>👥<br/><small>INVITE</small></div>
        <div onClick={() => setActiveNav('history')} style={{ textAlign: 'center', color: activeNav === 'history' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>💸<br/><small>WITHDRAW</small></div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#64748b', cursor: 'pointer' }}>👤<br/><small>PROFILE</small></div>
      </div>
    </div>
  );
}

export default App;
