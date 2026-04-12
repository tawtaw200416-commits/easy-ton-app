import React, { useState } from 'react';

function App() {
  // 1. Core State & Data
  const [userUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606"; 
  });

  const [balance, setBalance] = useState(0.0000);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // New Social Channels List
  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", 
    "@M9460", "@USDTcloudminer_channel", "@ADS_TON1", 
    "@goblincrypto", "@WORLDBESTCRYTO", "@kombo_crypta", 
    "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", 
    "@zrbtua", "@perviu1million"
  ];

  // New Bot Links List
  const botTasks = [
    { name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { name: "EasyBonusCode Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { name: "TonDragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const styles = {
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' },
    btn: (bg = '#fbbf24') => ({ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: bg, color: bg === 'transparent' ? '#fff' : '#000', fontWeight: '900', cursor: 'pointer' }),
    copyBox: { backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', border: '1px dashed #334155', marginBottom: '10px' },
    priceRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 5px', fontWeight: '900' },
    historyBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', marginTop: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Balance Header */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Tabs - Hidden when Order Placement is open */}
          {!showPayForm && (
            <div style={{display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', marginBottom: '15px'}}>
              <button style={{...styles.btn(activeTab === 'bot' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('bot')}>Start Bot</button>
              <button style={{...styles.btn(activeTab === 'social' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('social')}>Social</button>
              <button style={{...styles.btn(activeTab === 'reward' ? '#fbbf24' : 'transparent'), flex: 1}} onClick={() => setActiveTab('reward')}>Reward</button>
            </div>
          )}

{!showPayForm ? (
            <>
              {activeTab === 'bot' && (
                <div style={styles.card}>
                  <h4 style={{fontWeight: '900'}}>Bot Tasks (0.0005 TON)</h4>
                  {botTasks.map((t, i) => (
                    <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #334155'}}>
                      <span style={{fontSize: '13px', fontWeight: '900'}}>{t.name}</span>
                      <button style={styles.btn()} onClick={() => window.open(t.link, '_blank')}>Start</button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'social' && (
                <div style={styles.card}>
                  <button style={{...styles.btn(), width: '100%', marginBottom: '15px', padding: '15px'}} onClick={() => setShowPayForm(true)}>
                    + Add Your Task
                  </button>
                  <h4 style={{fontWeight: '900'}}>Social Channels (0.0005 TON)</h4>
                  {socialTasks.map((name, i) => (
                    <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #334155'}}>
                      <span style={{fontSize: '13px', fontWeight: '900'}}>{name}</span>
                      <button style={styles.btn('#38bdf8')} onClick={() => window.open(https://t.me/${name.replace('@','')}, '_blank')}>Join</button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reward' && (
                <div style={{...styles.card, textAlign: 'center'}}>
                  <h4 style={{fontWeight: '900'}}>Redeem Reward Code</h4>
                  <input style={{...styles.input, textAlign: 'center'}} placeholder="ENTER CODE (YTTPO)" />
                  <button style={{...styles.btn(), width: '100%'}}>Claim Now</button>
                </div>
              )}
            </>
          ) : (
            /* Order Placement Section */
            <div style={styles.card}>
              <button style={{...styles.btn('#10b981'), width: '100%', marginBottom: '15px'}} onClick={() => alert("No tasks submitted yet.")}>My Tasks</button>
              <h4 style={{fontWeight: '900', textAlign: 'center'}}>Order Placement</h4>
              <div style={{backgroundColor: '#0f172a', borderRadius: '12px', padding: '10px', marginBottom: '15px', border: '1px solid #334155'}}>
                <div style={styles.priceRow}><span>100 Users</span><span style={{color: '#fbbf24'}}>0.2 TON</span></div>
                <div style={styles.priceRow}><span>200 Users</span><span style={{color: '#fbbf24'}}>0.4 TON</span></div>
                <div style={styles.priceRow}><span>300 Users</span><span style={{color: '#fbbf24'}}>0.5 TON</span></div>
              </div>
              <input style={styles.input} placeholder="Channel Name (@Example)" />
              <input style={styles.input} placeholder="Channel Link" />
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress)}>
                <small style={{color: '#94a3b8', fontSize: '10px'}}>Pay Address (Click to Copy)</small><br/>
                <span style={{fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all'}}>{adminAddress}</span>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <small style={{color: '#94a3b8', fontSize: '10px'}}>MEMO / UID (Click to Copy)</small><br/>
                <span style={{color: '#fbbf24', fontWeight: '900'}}>{userUID}</span>
              </div>
              <button style={{...styles.btn(), width: '100%'}} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

{activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px', color: '#fbbf24', fontWeight: 'bold'}}>Get 0.0005 TON per invite!</p>
          <input style={styles.input} value={https://t.me/EasyTONFree_Bot?start=${userUID}} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(https://t.me/EasyTONFree_Bot?start=${userUID})}>Copy Link</button>
          
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '5px', fontSize: '12px', fontWeight: '900'}}><span>User ID</span><span>Status</span></div>
            <div style={{textAlign: 'center', color: '#64748b', padding: '5px', fontSize: '12px'}}>No invites yet.</div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <div style={{backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #fbbf24'}}>
             <small style={{color: '#fbbf24', fontWeight: '900'}}>MEMO: {userUID}</small>
          </div>
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>My Profile</h3>
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155'}}>
            <p style={{fontWeight: '900', margin: '8px 0'}}>UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p style={{fontWeight: '900', margin: '8px 0'}}>Status: <span style={{color: '#10b981'}}>Active</span></p>
          </div>
          <div style={{marginTop: '20px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, fontWeight: '900'}}>⚠️ Policy</h4>
            <p style={{fontSize: '12px', color: '#fca5a5', lineHeight: '1.5', fontWeight: '900'}}>Fake accounts and scripts are strictly prohibited. Permanent ban for fraud.</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => {setActiveNav('earn'); setShowPayForm(false);}}>💰<br/>Earn</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
