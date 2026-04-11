import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0015);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  
  const userUID = "UID17934536";
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const blockId = "27393"; 

  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  const [socialTasks, setSocialTasks] = useState([
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ]);

  const handleTaskComplete = (id, type) => {
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: blockId });
      AdController.show().then(() => {
        setBalance(prev => prev + 0.0005);
        if (type === 'bot') {
          setBotTasks(botTasks.filter(t => t.id !== id));
        } else {
          setSocialTasks(socialTasks.filter((_, index) => index !== id));
        }
      }).catch((err) => {
        console.error(err);
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '110px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '25px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonHeaderImg: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fbbf24', objectFit: 'cover' },
    balance: { color: '#fbbf24', fontSize: '24px', fontWeight: '900' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: '900', fontSize: '11px' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    taskIcon: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fbbf24', marginRight: '10px' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', fontWeight: '900' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '18px', borderTop: '1px solid #334155', zIndex: 100 },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8', fontWeight: '900' }),
    historyBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', marginTop: '10px', border: '1px solid #334155' },
    copyBadge: { display: 'inline-block', backgroundColor: '#fbbf24', color: '#0f172a', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', marginLeft: '10px', cursor: 'pointer', fontWeight: '900' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" style={styles.tonHeaderImg} />
        <div>
          <div style={{fontSize: '15px', fontWeight: '900'}}>Easy Earn TON</div>
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
              <h4 style={{fontWeight: '900'}}>Bot Tasks (0.0005 TON)</h4>
              {botTasks.map(t => (
                <div key={t.id} style={styles.taskItem}>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="icon" style={styles.taskIcon} />
                    <span style={{fontWeight: '900', fontSize: '13px'}}>{t.name}</span>
                  </div>
                  <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && !showPayForm && (
            <div style={styles.card}>
              <h4 style={{fontWeight: '900'}}>Social Channels (0.0005 TON)</h4>
              <div style={{maxHeight: '40vh', overflowY: 'auto'}}>
                {socialTasks.map((c, i) => (
                  <div key={i} style={styles.taskItem}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="icon" style={styles.taskIcon} />
                      <span style={{fontSize: '12px', fontWeight: '900'}}>{c}</span>
                    </div>
                    <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${c.replace('@','')}`, '_blank'); handleTaskComplete(i, 'social'); }}>Join</button>
                  </div>
                ))}
              </div>
              <div style={{marginTop: '15px', borderTop: '1px solid #334155', paddingTop: '15px'}}>
                <button style={{...styles.btn(), width: '100%', padding: '15px'}} onClick={() => setShowAddOptions(!showAddOptions)}>
                   {showAddOptions ? '✕ Close' : '+ Add Task'}
                </button>
                {showAddOptions && (
                  <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <button style={{...styles.btn(), flex: 1}} onClick={() => setShowPayForm(true)}>Add Task</button>
                    <button style={{...styles.btn('#38bdf8'), flex: 1}}>My Task</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showPayForm && (
            <div style={styles.card}>
              <h4 style={{fontWeight: '900'}}>Order Placement</h4>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Link" />
              <div style={styles.historyBox}>
                <p style={{fontSize: '11px', fontWeight: '900'}}>Pay Address: <span style={styles.copyBadge} onClick={() => copyToClipboard(adminAddress)}>COPY</span></p>
                <p style={{color: '#fbbf24', fontSize: '10px', wordBreak: 'break-all'}}>{adminAddress}</p>
                <p style={{marginTop: '10px', fontSize: '11px', fontWeight: '900'}}>MEMO: <span style={styles.copyBadge} onClick={() => copyToClipboard(userUID)}>COPY</span></p>
                <p style={{color: '#fbbf24', fontSize: '18px'}}>{userUID}</p>
              </div>
              <button style={{...styles.btn(), width: '100%', marginTop: '15px'}} onClick={() => setShowPayForm(false)}>Confirm Order</button>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4 style={{fontWeight: '900'}}>Redeem Reward Code</h4>
              <input style={{...styles.input, textAlign: 'center'}} placeholder="CODE (YTTPO)" />
              <button style={{...styles.btn(), width: '100%'}}>Claim Now</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center', fontWeight: '900'}}>Refer & Earn 10%</h3>
          <input style={styles.input} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(`https://t.me/EasyEarnBot?start=${userUID}`)}>Copy Referral Link</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center', fontWeight: '900'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount" type="number" />
          <input style={styles.input} placeholder="Wallet Address" />
          <button style={{...styles.btn(), width: '100%'}}>Submit Request</button>
        </div>
      )}

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
