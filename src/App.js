import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  
  const userUID = "UID17934536";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // Bot Tasks Data
  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  // Social Channels Data
  const [socialTasks, setSocialTasks] = useState([
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ]);

  const handleTaskComplete = (id, type) => {
    setBalance(prev => prev + 0.0005);
    if (type === 'bot') {
      setBotTasks(botTasks.filter(t => t.id !== id));
    } else {
      setSocialTasks(socialTasks.filter((_, index) => index !== id));
    }
  };

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
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '8px 18px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '15px', borderTop: '1px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8' }),
    paymentBox: { border: '1px dashed #fbbf24', padding: '15px', borderRadius: '10px', backgroundColor: '#0f172a', marginTop: '10px' }
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

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false);}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false);}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false);}}>Reward</button>
          </div>

          {activeTab === 'bot' && (
            <div style={styles.card}>
              <h4>Available Bots (0.0005 TON each)</h4>
              {botTasks.length > 0 ? botTasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="icon" style={styles.taskIcon} />
                    <span style={{fontSize: '13px'}}>{t.name}</span>
                  </div>
                  <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start Bot</button>
                </div>
              )) : <p style={{textAlign:'center', color:'#64748b'}}>All bot tasks completed!</p>}
            </div>
          )}

          {activeTab === 'social' && !showPayForm && (
            <div style={styles.card}>
              <h4>Channels (0.0005 TON each)</h4>
              {socialTasks.length > 0 ? socialTasks.map((c, i) => (
                <div key={i} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="icon" style={styles.taskIcon} />
                    <span style={{fontSize: '12px'}}>{c}</span>
                  </div>
                  <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${c.replace('@','')}`, '_blank'); handleTaskComplete(i, 'social'); }}>Join</button>
                </div>
              )) : <p style={{textAlign:'center', color:'#64748b'}}>All channel tasks completed!</p>}
              
              <div style={{marginTop: '15px'}}>
                <button style={{...styles.btn(), width: '100%', padding: '12px'}} onClick={() => setShowAddOptions(!showAddOptions)}>
                   {showAddOptions ? '✕ Close' : '+ Add Task'}
                </button>
                {showAddOptions && (
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button style={{...styles.btn(), flex: 1}} onClick={() => setShowPayForm(true)}>Add Task</button>
                    <button style={{...styles.btn('#38bdf8'), flex: 1}} onClick={() => alert('My Tasks List')}>My Task</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Task Form with Payment */}
          {showPayForm && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>Create New Task</h4>
              <input style={styles.input} placeholder="Task Name (e.g. My Channel)" />
              <input style={styles.input} placeholder="Link (https://t.me/...)" />
              
              <p style={{fontSize: '12px', marginBottom: '5px'}}>Select Package:</p>
              <select style={{...styles.input, cursor:'pointer'}}>
                <option>100 Members - 0.2 TON</option>
                <option>200 Members - 0.4 TON</option>
                <option>300 Members - 0.5 TON</option>
              </select>

              <div style={styles.paymentBox}>
                <p style={{fontSize: '11px', color: '#94a3b8', margin: '0 0 5px 0'}}>Send Payment to:</p>
                <p style={{fontSize: '10px', wordBreak: 'break-all', color: '#fbbf24'}}>{adminAddress}</p>
                <p style={{fontSize: '12px', marginTop: '10px'}}>MEMO (Required):</p>
                <div style={{backgroundColor: '#1e293b', padding: '10px', borderRadius: '5px', color: '#fbbf24', fontWeight: 'bold', textAlign: 'center'}}>
                  {userUID}
                </div>
              </div>
              <button style={{...styles.btn(), width: '100%', marginTop: '15px', padding: '12px'}} onClick={() => { alert('Notification sent to Admin. Please wait for verification.'); setShowPayForm(false); setShowAddOptions(false); }}>
                Confirm Payment
              </button>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4>Redeem Code</h4>
              <input style={{...styles.input, textAlign: 'center'}} placeholder="Enter Code" />
              <button style={{...styles.btn(), width: '100%'}}>Claim</button>
            </div>
          )}
        </>
      )}

      {/* Invite & Withdraw Section */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Invite Friends</h3>
          <input style={{...styles.input, color: '#94a3b8'}} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => alert('Copied!')}>Copy Link</button>
          <div style={{marginTop:'20px', padding:'10px', backgroundColor:'#0f172a', borderRadius:'10px'}}>
             <p>Total Invites: 0</p>
             <p style={{fontSize:'12px', color:'#64748b'}}>Success History: No records</p>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Withdraw</h3>
          <input style={styles.input} placeholder="Amount" type="number" />
          <input style={styles.input} placeholder="Wallet Address" />
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>
          <div style={{marginTop:'20px'}}>
             <h4>History</h4>
             <p style={{fontSize:'12px', color:'#64748b'}}>No withdrawal history found.</p>
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
