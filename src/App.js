import React, { useState, useEffect } from 'react';

const APP_CONFIG = {
  ADS_BLOCK_ID: "27393",
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: "1793453606"
};

function App() {
  // ✅ Data State
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  // ✅ Copy Logic
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} ကို Copy ကူးလိုက်ပါပြီ!`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '110px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copySection: { background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px dashed #fbbf24', marginTop: '10px' },
    copyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    miniBtn: { backgroundColor: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#1e293b', borderTop: '2px solid #334155', padding: '10px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#fbbf24' : '#94a3b8', fontSize: '11px', cursor: 'pointer' })
  };

  return (
    <div style={styles.main}>
      {/* Balance Display */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {activeTab === 'social' && (
            <div style={styles.card}>
              {!showAddTask ? (
                <>
                  <button onClick={() => setShowAddTask(true)} style={{ ...styles.yellowBtn, marginBottom: '15px' }}>+ ADD TASK (PROMOTE)</button>
                  <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>Available Tasks will appear here</p>
                </>
              ) : (
                <div>
                  <h3 style={{ marginTop: 0 }}>Add Task</h3>
                  <input style={styles.input} placeholder="Channel Name (@Channel)" />
                  <input style={styles.input} placeholder="Link" />
                  <select style={styles.input}>
                    <option>100 Views - 0.2 TON</option>
                    <option>200 Views - 0.4 TON</option>
                  </select>

                  <div style={styles.copySection}>
                    <div style={styles.copyRow}>
                      <span style={{ fontSize: '11px' }}>Address: <b style={{ fontSize: '9px' }}>{APP_CONFIG.ADMIN_WALLET.substring(0, 15)}...</b></span>
                      <button style={styles.miniBtn} onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, 'Wallet Address')}>COPY</button>
                    </div>
                    <div style={styles.copyRow}>
                      <span style={{ fontSize: '11px' }}>MEMO: <b style={{ color: '#fbbf24' }}>{APP_CONFIG.MY_UID}</b></span>
                      <button style={styles.miniBtn} onClick={() => handleCopy(APP_CONFIG.MY_UID, 'MEMO ID')}>COPY</button>
                    </div>
                  </div>

                  <button style={{ ...styles.yellowBtn, marginTop: '15px' }} onClick={() => setShowAddTask(false)}>CONFIRM PAYMENT</button>
                  <button onClick={() => setShowAddTask(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '10px' }}>Back</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Navigation Bar */}
      <div style={styles.navBar}>
        <div onClick={() => setActiveNav('earn')} style={styles.navBtn(activeNav === 'earn')}>💰<br/>EARN</div>
        <div onClick={() => setActiveNav('invite')} style={styles.navBtn(activeNav === 'invite')}>👥<br/>INVITE</div>
        <div onClick={() => setActiveNav('withdraw')} style={styles.navBtn(activeNav === 'withdraw')}>💸<br/>WITHDRAW</div>
        <div onClick={() => setActiveNav('profile')} style={styles.navBtn(activeNav === 'profile')}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
