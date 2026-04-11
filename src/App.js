import React, { useState } from 'react';

function App() {
  const [userUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606"; 
  });

  const [balance, setBalance] = useState(0.0000);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);

  // Styles object for consistency
  const styles = {
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900', outline: 'none' },
    btn: (isActive = true) => ({ 
      padding: '15px', borderRadius: '12px', border: 'none', 
      backgroundColor: isActive ? '#fbbf24' : '#1e293b', 
      color: isActive ? '#000' : '#fff', fontWeight: '900', cursor: 'pointer' 
    }),
    historyBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', marginTop: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', opacity: active ? 1 : 0.4, cursor: 'pointer', fontSize: '12px', fontWeight: '900', color: active ? '#fbbf24' : '#fff' })
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Balance Header */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '30px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>YOUR BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '8px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.btn(activeTab === t), flex: 1, padding: '12px' }}>
                {t === 'bot' ? 'START BOT' : t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'reward' ? (
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontWeight: '900', marginBottom: '15px' }}>Redeem Code</h4>
                <input style={{ ...styles.input, textAlign: 'center' }} placeholder="ENTER CODE" />
                <button style={{ ...styles.btn(), width: '100%' }}>Claim</button>
              </div>
            ) : (
              <div>
                {/* Social Tasks List */}
                {['@GrowTeaNews', '@GoldenMinerNews', '@easytonfree'].map((task, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontWeight: '900' }}>{task}</span>
                    <button style={{ backgroundColor: '#60a5fa', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '900' }}>JOIN</button>
                  </div>
                ))}
                
                {/* +Add Task ခလုတ်ကို အောက်ခြေတွင် ကပ်လျက်ထားခြင်း */}
                {activeTab === 'social' && (
                  <button 
                    onClick={() => setShowAddTask(!showAddTask)}
                    style={{ width: '100%', marginTop: '15px', padding: '14px', borderRadius: '12px', backgroundColor: 'transparent', color: '#fbbf24', border: '2px dashed #fbbf24', fontWeight: '900' }}
                  >
                    + ADD YOUR TASK
                  </button>
                )}
              </div>
            )}
          </div>
          
          {showAddTask && activeTab === 'social' && (
            <div style={{ ...styles.card, border: '2px solid #fbbf24' }}>
              <input placeholder="Channel Username" style={styles.input} />
              <input placeholder="Task Link" style={styles.input} />
              <button style={{ ...styles.btn(), width: '100%' }}>Submit for Review</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ color: '#fbbf24', textAlign: 'center', fontWeight: '900' }}>Refer & Earn 0.0005 TON</h3>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>Every friend you invite earns you a reward!</p>
          <input style={{ ...styles.input, color: '#fbbf24' }} value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} readOnly />
          <button style={{ ...styles.btn(), width: '100%' }} onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${userUID}`)}>Copy Link</button>
          
          <h4 style={{ marginTop: '25px', fontWeight: '900' }}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontWeight: '900', fontSize: '13px' }}>User_7721</span>
              <span style={{ color: '#10b981', fontWeight: '900' }}>+0.0005 TON</span>
            </div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ color: '#fbbf24', textAlign: 'center', fontWeight: '900' }}>Withdraw TON</h3>
          {/* Amount နှင့် Address input များ */}
          <input style={styles.input} placeholder="Amount (Minimum 0.5)" type="number" />
          <input style={styles.input} placeholder="Enter TON Wallet Address" />
          {/* Memo ကို ဖျောက်ထားပါသည် */}
          <button style={{ ...styles.btn(), width: '100%' }}>Confirm Withdrawal</button>
          
          <h4 style={{ marginTop: '25px', fontWeight: '900' }}>Withdrawal History</h4>
          <div style={styles.historyBox}>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px' }}>No transactions yet.</p>
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ fontWeight: '900', textAlign: 'center' }}>My Profile</h3>
          <div style={styles.historyBox}>
            <p style={{ fontWeight: '900' }}>UID: <span style={{ color: '#fbbf24' }}>{userUID}</span></p>
            <p style={{ fontWeight: '900' }}>Status: <span style={{ color: '#10b981' }}>Verified</span></p>
          </div>
          
          {/* သတိပေးစာကို Profile အောက်တွင်ထားရှိခြင်း */}
          <div style={{ marginTop: '20px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px' }}>
            <h4 style={{ color: '#ef4444', marginTop: 0, fontWeight: '900' }}>⚠️ SECURITY POLICY</h4>
            <p style={{ fontSize: '13px', color: '#fca5a5', fontWeight: '900' }}>
              Fake accounts or multiple UIDs are strictly prohibited. Detected fraud will result in a permanent ban and balance forfeit.
            </p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div style={styles.footerItem(activeNav === 'earn')} onClick={() => setActiveNav('earn')}>💰<br/>Earn</div>
        <div style={styles.footerItem(activeNav === 'invite')} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={styles.footerItem(activeNav === 'withdraw')} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={styles.footerItem(activeNav === 'profile')} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
