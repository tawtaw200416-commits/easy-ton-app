import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0015);
  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');
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
    if (type === 'bot') {
      setBotTasks(prev => prev.filter(t => t.id !== id));
    } else {
      setSocialTasks(prev => prev.filter((_, index) => index !== id));
    }
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: blockId });
      AdController.show().then(() => {
        setBalance(prev => prev + 0.0005);
      }).catch((err) => console.error(err));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '110px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '25px', border: '1px solid #334155', gap: '15px', marginBottom: '20px' },
    tonHeaderImg: { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #fbbf24' },
    balance: { color: '#fbbf24', fontSize: '24px', fontWeight: '900' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: '900', fontSize: '11px' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #334155' },
    btn: (color='#fbbf24') => ({ backgroundColor: color, color: '#0f172a', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '18px', borderTop: '1px solid #334155', zIndex: 100 },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '11px', color: active ? '#fbbf24' : '#94a3b8', fontWeight: '900' }),
    copyBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #334155', position: 'relative', cursor: 'pointer' },
    copyLabel: { fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' },
    copyValue: { fontSize: '13px', color: '#fbbf24', wordBreak: 'break-all', fontWeight: '700' }
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
                  <span style={{fontWeight: '900', fontSize: '13px'}}>{t.name}</span>
                  <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && !showPayForm && (
            <div style={styles.card}>
              <h4 style={{fontWeight: '900'}}>Social Channels</h4>
              {socialTasks.map((c, i) => (
                <div key={i} style={styles.taskItem}>
                  <span style={{fontSize: '12px', fontWeight: '900'}}>{c}</span>
                  <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${c.replace('@','')}`, '_blank'); handleTaskComplete(i, 'social'); }}>Join</button>
                </div>
              ))}
              {/* +Add Task Button - Right under social list */}
              <button style={{...styles.btn(), width: '100%', marginTop: '10px', padding: '15px'}} onClick={() => setShowPayForm(true)}>
                + Add Your Task
              </button>
            </div>
          )}

          {showPayForm && (
            <div style={styles.card}>
              <h4 style={{fontWeight: '900'}}>Order Placement</h4>
              <input style={styles.input} placeholder="Channel Name (@Example)" />
              <input style={styles.input} placeholder="Channel Link (https://t.me/...)" />
              
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress)}>
                <span style={styles.copyLabel}>Pay Address (Click to Copy)</span>
                <span style={styles.copyValue}>{adminAddress}</span>
              </div>
              
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <span style={styles.copyLabel}>MEMO / UID (Click to Copy)</span>
                <span style={styles.copyValue}>{userUID}</span>
              </div>
              
              <button style={{...styles.btn(), width: '100%', marginTop: '10px'}} onClick={() => setShowPayForm(false)}>Confirm & Back</button>
            </div>
          )}

          {activeTab === 'reward' && (
            <div style={{...styles.card, textAlign: 'center'}}>
              <h4 style={{fontWeight: '900'}}>Redeem Code</h4>
              <input style={{...styles.input, textAlign: 'center'}} placeholder="ENTER CODE" />
              <button style={{...styles.btn(), width: '100%'}}>Claim</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center', fontWeight: '900'}}>Refer & Earn 10%</h3>
          <input style={styles.input} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(`https://t.me/EasyEarnBot?start=${userUID}`)}>Copy Link</button>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{color: '#fbbf24', textAlign: 'center', fontWeight: '900'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount" type="number" />
          <input style={styles.input} placeholder="Wallet Address" />
          <button style={{...styles.btn(), width: '100%'}}>Withdraw</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900', textAlign: 'center'}}>My Profile</h3>
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155'}}>
            <p style={{fontWeight: '900'}}>UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p style={{fontWeight: '900'}}>Status: <span style={{color: '#10b981'}}>Active</span></p>
          </div>
          <div style={{marginTop: '20px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, fontWeight: '900'}}>⚠️ Policy</h4>
            <p style={{fontSize: '13px', color: '#fca5a5', fontWeight: '900'}}>Fake accounts are strictly prohibited. You will be banned permanently if fraud is detected.</p>
          </div>
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
