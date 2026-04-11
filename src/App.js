import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  
  const userUID = "UID17934536";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // Bot Tasks
  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  // Social Channels
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
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '110px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '25px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonHeaderImg: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fbbf24', objectFit: 'cover' },
    balance: { color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold', fontSize: '11px' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    taskIcon: { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #fbbf24', marginRight: '10px' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '18px', borderTop: '1px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8' })
  };

  return (
    <div style={styles.container}>
      {/* Header with improved Ton Logo */}
      <div style={styles.header}>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_SAt0O7R4-A0N93T0O9x7I0h6S6-7oN5kAw&s" alt="TON-Logo" style={styles.tonHeaderImg} />
        <div>
          <div style={{fontSize: '14px', fontWeight: 'bold'}}>Easy Earn TON</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Tab Sequence: Bot -> Social -> Reward */}
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false);}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false);}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false);}}>Reward</button>
          </div>

          {activeTab === 'bot' && (
            <div style={styles.card}>
              <h4>Bot Tasks (0.0005 TON)</h4>
              {botTasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="icon" style={styles.taskIcon} />
                    <span>{t.name}</span>
                  </div>
                  <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && !showPayForm && (
            <div style={styles.card}>
              <h4 style={{marginTop: 0}}>Join Channels (0.0005 TON)</h4>
              <div style={{maxHeight: '40vh', overflowY: 'auto', marginBottom: '10px'}}>
                {socialTasks.map((c, i) => (
                  <div key={i} style={styles.taskItem}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="icon" style={styles.taskIcon} />
                      <span style={{fontSize: '12px'}}>{c}</span>
                    </div>
                    <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${c.replace('@','')}`, '_blank'); handleTaskComplete(i, 'social'); }}>Join</button>
                  </div>
                ))}
              </div>
              
              {/* +Add Task - Positioned tightly below the list */}
              <div style={{borderTop: '1px solid #334155', paddingTop: '15px'}}>
                <button style={{...styles.btn(), width: '100%', padding: '15px'}} onClick={() => setShowAddOptions(!showAddOptions)}>
                   {showAddOptions ? '✕ Close Options' : '+ Add Task'}
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

          {showPayForm && (
            <div style={styles.card}>
              <h4>Create New Task</h4>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Link (https://t.me/...)" />
              <select style={styles.input}>
                <option>100 Members - 0.2 TON</option>
                <option>200 Members - 0.4 TON</option>
                <option>300 Members - 0.5 TON</option>
              </select>
              <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '10px', fontSize: '12px', border: '1px dashed #fbbf24'}}>
                <p>Send TON to:</p>
                <p style={{color: '#fbbf24', wordBreak: 'break-all', fontSize: '11px'}}>{adminAddress}</p>
                <p style={{marginTop: '10px'}}>MEMO (Required):</p>
                <p style={{color: '#fbbf24', fontSize: '18px', fontWeight: 'bold'}}>{userUID}</p>
              </div>
              <button style={{...styles.btn(), width: '100%', marginTop: '15px', padding: '12px'}} onClick={() => setShowPayForm(false)}>Confirm Payment</button>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4>Redeem Code</h4>
              <input style={{...styles.input, textAlign: 'center'}} placeholder="Enter Promo Code" value={claimCode} onChange={(e)=>setClaimCode(e.target.value.toUpperCase())} />
              <button style={{...styles.btn(), width: '100%'}} onClick={() => alert('Code processing...')}>Claim Now</button>
            </div>
          )}
        </>
      )}

      {/* Other Navigation Sections */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Invite & Earn</h3>
          <input style={styles.input} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => alert('Link Copied!')}>Copy Link</button>
          <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#0f172a', borderRadius: '15px'}}>
            <p>Total Referrals: 0</p>
            <p style={{fontSize: '12px', color: '#64748b'}}>Success History: No data</p>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center'}}>Withdraw</h3>
          <input style={styles.input} placeholder="Amount" type="number" />
          <input style={styles.input} placeholder="Wallet Address" />
          <button style={{...styles.btn(), width: '100%', padding: '14px'}}>Submit Withdrawal</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center'}}>Account Information</h3>
          <div style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '15px', borderRadius: '15px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0}}>⚠️ Policy Warning</h4>
            <p style={{fontSize: '13px', lineHeight: '1.6', color: '#fca5a5'}}>
              <b>English:</b> Creating multiple or fake accounts is strictly prohibited. Any detected fraud will result in a <b>Permanent Ban</b> and loss of all funds. We verify all activities before processing payments.
            </p>
          </div>
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
