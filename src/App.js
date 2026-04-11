import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  
  const userUID = "UID17934536";

  // Task Data
  const botTasks = [
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' }
  ];

  const socialTasks = ["@GrowTeaNews", "@GoldenMinerNews", "@easytonfree"];

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '100px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    profileImg: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fbbf24', objectFit: 'cover' },
    balance: { color: '#fbbf24', fontSize: '22px', fontWeight: 'bold' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    taskIcon: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #fbbf24', marginRight: '10px' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8' }),
    historyBox: { backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', marginTop: '10px', fontSize: '12px' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <img src="https://t3.ftcdn.net/jpg/05/65/15/86/360_F_565158659_9I3kG0f6PzX2EwT6s0Uv5Q9b4bJvFp4w.jpg" alt="logo" style={styles.profileImg} />
        <div>
          <div style={{fontSize: '14px', fontWeight: 'bold'}}>Easy Earn TON</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {/* Earn Section */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowAddOptions(false);}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowAddOptions(false);}}>Reward</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>Social</button>
          </div>

          {activeTab === 'bot' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0, color: '#94a3b8'}}>Bot Tasks</h4>
              {botTasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="icon" style={styles.taskIcon} />
                    <span>{t.name}</span>
                  </div>
                  <button style={styles.btn()} onClick={() => window.open(t.link, '_blank')}>Start</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0, color: '#94a3b8'}}>Channels</h4>
              {socialTasks.map((c, i) => (
                <div key={i} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="icon" style={styles.taskIcon} />
                    <span>{c}</span>
                  </div>
                  <button style={styles.btn('#38bdf8')} onClick={() => window.open(`https://t.me/${c.replace('@','')}`, '_blank')}>Join</button>
                </div>
              ))}
              
              {/* +Add Task Button - Exactly at the bottom of the list */}
              <div style={{marginTop: '15px'}}>
                <button style={{...styles.btn(), width: '100%', padding: '12px'}} onClick={() => setShowAddOptions(!showAddOptions)}>
                   {showAddOptions ? '✕ Close' : '+ Add Task'}
                </button>
                {showAddOptions && (
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button style={{...styles.btn(), flex: 1}} onClick={() => alert('Opening Add Task Form')}>Add Task</button>
                    <button style={{...styles.btn('#38bdf8'), flex: 1}} onClick={() => alert('Opening My Tasks')}>My Task</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4 style={{color: '#fbbf24', marginTop: 0}}>Redeem Reward</h4>
              <input style={{...styles.input, textAlign: 'center'}} placeholder="Enter Code" value={claimCode} onChange={(e)=>setClaimCode(e.target.value.toUpperCase())} />
              <button style={{...styles.btn(), width: '100%'}} onClick={() => alert('Success!')}>Claim</button>
            </div>
          )}
        </>
      )}

      {/* Invite Section */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px'}}>0.0005 TON / Invite</p>
          <input style={{...styles.input, color: '#94a3b8'}} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%', marginBottom: '20px'}} onClick={() => alert('Link Copied!')}>Copy Link</button>
          
          <h4>Invite Status</h4>
          <div style={styles.historyBox}>
             <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>Total Invites:</span>
                <span style={{color: '#fbbf24'}}>0 Users</span>
             </div>
          </div>
          <h4 style={{marginTop: '20px'}}>Success History</h4>
          <div style={{...styles.historyBox, color: '#64748b', textAlign: 'center'}}>No completed tasks from referrals yet.</div>
        </div>
      )}

      {/* Withdraw Section */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Withdrawal</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <button style={{...styles.btn(), width: '100%', padding: '14px', marginBottom: '20px'}}>Withdraw Now</button>
          
          <h4>Withdraw History</h4>
          <div style={styles.historyBox}>
             <div style={{color: '#64748b', textAlign: 'center'}}>No withdrawal records found.</div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      {activeNav === 'profile' && (
        <div style={{...styles.card, border: '1px solid #ef4444'}}>
          <h3 style={{color: '#ef4444', textAlign: 'center'}}>⚠️ Account Notice</h3>
          <p style={{fontSize: '13px', textAlign: 'center'}}>Fake accounts or bot usage will lead to a <b>Permanent Ban</b>. All tasks are manually verified.</p>
        </div>
      )}

      {/* Footer Nav */}
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
