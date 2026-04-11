import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeNav, setActiveNav] = useState('earn');
  const [claimCode, setClaimCode] = useState('');
  
  // Fake User UID for Demo
  const userUID = "UID87654321";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  const [mainTasks, setMainTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' }
  ]);

  const socialTasks = ["@GrowTeaNews", "@GoldenMinerNews", "@ADS_TON1"];

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    balance: { color: '#fbbf24', fontSize: '22px', fontWeight: 'bold' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold', fontSize: '13px' }),
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8', cursor: 'pointer' })
  };

  const handleClaim = () => {
    if(claimCode === 'YTTPO') { alert('Code Claimed Successfully!'); setClaimCode(''); }
    else { alert('Invalid Code!'); }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fbbf24'}}></div>
        <div>
          <div style={{fontSize: '14px'}}>Shadow Bee's Empire</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {/* Main Content based on activeNav */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>Tasks</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>Reward</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>Social</button>
          </div>
          {activeTab === 'tasks' && (
            <div style={styles.card}>
              <h4>Main Tasks (0.0005 TON)</h4>
              {mainTasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                  <span style={{fontSize: '14px'}}>{t.name}</span>
                  <button style={styles.btn()} onClick={() => window.open(t.link, '_blank')}>Start</button>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4 style={{color: '#fbbf24'}}>Enter Code</h4>
              <input style={{...styles.input, textAlign: 'center'}} placeholder="Type Code Here" value={claimCode} onChange={(e)=>setClaimCode(e.target.value.toUpperCase())} />
              <button style={{...styles.btn(), width: '100%', padding: '12px'}} onClick={handleClaim}>CLAIM NOW</button>
            </div>
          )}
          {activeTab === 'social' && (
            <>
              <div style={styles.card}>
                <h4>Social Channels</h4>
                {socialTasks.map((c, i) => (
                  <div key={i} style={styles.taskItem}>
                    <span style={{fontSize: '13px'}}>{c}</span>
                    <button style={styles.btn('#38bdf8')} onClick={() => window.open(`https://t.me/${c.replace('@','')}`, '_blank')}>Join</button>
                  </div>
                ))}
              </div>
              <button style={{...styles.btn(), width: '100%', padding: '15px', fontSize: '14px'}}>+ Add Task</button>
            </>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Invite Friends</h3>
          <p style={{fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>Earn 0.0005 TON per invite.</p>
          <input style={{...styles.input, color: '#94a3b8', fontSize: '12px'}} value={`https://t.me/YourBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%', marginBottom: '20px'}} onClick={() => alert('Link Copied!')}>Copy Link</button>
          <h4>Invite History (0 users)</h4>
          <div style={{fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px'}}>No invites yet.</div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Withdraw TON</h3>
          <input style={styles.input} type="number" placeholder="Amount (Min: 0.1 TON)" />
          <input style={styles.input} placeholder="Enter TON Wallet Address" />
          <button style={{...styles.btn(), width: '100%', marginBottom: '20px', padding: '12px'}}>Withdraw Now</button>
          <h4>Withdraw History</h4>
          <div style={{fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px'}}>No history.</div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{...styles.card, border: '1px solid #ef4444'}}>
          <h3 style={{color: '#ef4444', textAlign: 'center'}}>⚠️ Account Policy</h3>
          <p style={{fontSize: '14px', color: '#fca5a5', lineHeight: '1.6'}}>
            Using multiple or fake accounts to exploit rewards is strictly prohibited. 
            All accounts involved in such activities will be <strong style={{color: 'white'}}>PERMANENTLY BANNED</strong> without notice.
            Withdrawals will only be processed for valid, unique accounts.
          </p>
        </div>
      )}

      {/* Bottom Navigation */}
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
