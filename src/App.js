import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [claimCode, setClaimCode] = useState('');
  const [showAddOptions, setShowAddOptions] = useState(false);
  
  const userUID = "UID87654321";

  const botTasks = [
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' }
  ];

  const socialTasks = ["@GrowTeaNews", "@GoldenMinerNews", "@ADS_TON1"];

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonHeaderLogo: { width: '50px', height: '50px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid #fbbf24', backgroundImage: 'url("https://t3.ftcdn.net/jpg/05/65/15/86/360_F_565158659_9I3kG0f6PzX2EwT6s0Uv5Q9b4bJvFp4w.jpg")' },
    balance: { color: '#fbbf24', fontSize: '22px', fontWeight: 'bold' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px' }),
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    taskIcon: { width: '25px', height: '25px', borderRadius: '50%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', color: '#fbbf24', fontSize: '12px', fontWeight: 'bold' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }),
    popup: { display: 'flex', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #fbbf24' }
  };

  const handleClaim = () => {
    if(claimCode === 'YTTPO') { alert('Code Claimed Successfully!'); setBalance(prev => prev + 0.0005); setClaimCode(''); }
    else { alert('Invalid Code!'); }
  };

  return (
    <div style={styles.container}>
      {/* Header with Ton Splash Logo */}
      <div style={styles.header}>
        <div style={styles.tonHeaderLogo}></div>
        <div>
          <div style={{fontSize: '14px', fontWeight: 'bold'}}>Easy Earn TON</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {/* Main Content */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>Reward</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>Social</button>
          </div>
          
          {activeTab === 'bot' && (
            <div style={styles.card}>
              <h4>Start Bot Tasks</h4>
              {botTasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={styles.taskIcon}>B</div> {/* Bot Icon */}
                    <span style={{fontSize: '14px'}}>{t.name}</span>
                  </div>
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
            <div style={styles.card}>
                <h4 style={{color: '#94a3b8', marginTop: 0}}>Social Channels</h4>
                {socialTasks.map((c, i) => (
                    <div key={i} style={styles.taskItem}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={styles.taskIcon}>S</div> {/* Social Icon */}
                            <span style={{fontSize: '13px'}}>{c}</span>
                        </div>
                        <button style={styles.btn('#38bdf8')} onClick={() => window.open(`https://t.me/${c.replace('@','')}`, '_blank')}>Join</button>
                  </div>
                ))}
                
                {/* +Add Task Button inside Social Tab, outside card */}
                <div style={{marginTop: '20px'}}>
                    <button 
                    style={{...styles.btn(), width: '100%', padding: '14px'}} 
                    onClick={() => setShowAddOptions(!showAddOptions)}
                    >
                    {showAddOptions ? '✕ Close Options' : '+ Add Task'}
                    </button>
                    
                    {showAddOptions && (
                    <div style={styles.popup}>
                        <button style={{...styles.btn(), flex: 1}} onClick={() => alert('Opening Add Task Form...')}>Add Task</button>
                        <button style={{...styles.btn('#38bdf8'), flex: 1}} onClick={() => alert('Opening My Tasks List...')}>My Task</button>
                    </div>
                    )}
                </div>
            </div>
          )}
        </>
      )}

      {/* Other Navs */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Invite Friends</h3>
          <input style={{...styles.input, color: '#94a3b8'}} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => alert('Link Copied!')}>Copy Link</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Withdraw</h3>
          <input style={styles.input} placeholder="Amount" />
          <input style={styles.input} placeholder="Address" />
          <button style={{...styles.btn(), width: '100%'}}>Submit</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={{...styles.card, border: '1px solid #ef4444'}}>
          <h3 style={{color: '#ef4444', textAlign: 'center'}}>Notice</h3>
          <p>Fake accounts will be banned permanently.</p>
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
