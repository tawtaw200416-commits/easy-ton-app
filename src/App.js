import React, { useState, useEffect } from 'react';

function App() {
  // 1. UID နဲ့ ပတ်သက်တဲ့ Logic များ
  const [userUID, setUserUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    // Telegram ကနေ ID ဆွဲထုတ်မယ်၊ မရရင် test id ပြမယ်
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606"; 
  });

  // ကိုယ့်ကို invite လုပ်တဲ့သူ့ ID ကို link ကနေ ဆွဲထုတ်မယ် (tgWebAppStartParam)
  const [inviterID, setInviterID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const startParam = params.get('tgWebAppStartParam'); // Telegram က start param ကို ဒီလိုဖတ်ပါတယ်
    return startParam || null;
  });

  const [balance, setBalance] = useState(0.0000);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // Task lists
  const [botTasks] = useState([{ id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot' }]);
  const [socialTasks] = useState([{ id: 101, name: '@easytonfree' }]);

  const styles = {
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' },
    btn: (bg = '#fbbf24') => ({ padding: '10px 15px', borderRadius: '10px', border: 'none', backgroundColor: bg, color: bg === 'transparent' ? '#fff' : '#000', fontWeight: '900', cursor: 'pointer' }),
    copyBox: { backgroundColor: '#0f172a', padding: '10px', borderRadius: '10px', border: '1px dashed #334155', marginBottom: '10px', cursor: 'pointer' },
    priceRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 5px', fontWeight: '900' },
    historyBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', marginTop: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const handleTaskComplete = (id, type) => {
    setBalance(prev => prev + 0.0005);
    alert("Task verification pending...");
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Header Balance */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
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
                  {botTasks.map(t => (
                    <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '13px', fontWeight: '900'}}>{t.name}</span>
                      <button style={styles.btn()} onClick={() => { window.open(t.link, '_blank'); handleTaskComplete(t.id, 'bot'); }}>Start</button>
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
                  {socialTasks.map((t) => (
                    <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '13px', fontWeight: '900'}}>{t.name}</span>
                      <button style={styles.btn('#38bdf8')} onClick={() => { window.open(`https://t.me/${t.name.replace('@','')}`, '_blank'); handleTaskComplete(t.id, 'social'); }}>Join</button>
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
            <div style={styles.card}>
              <button style={{...styles.btn('#10b981'), width: '100%', marginBottom: '15px'}} onClick={() => alert("No tasks yet.")}>My Tasks</button>
              <h4 style={{fontWeight: '900', textAlign: 'center'}}>Order Placement</h4>
              <div style={{backgroundColor: '#0f172a', borderRadius: '12px', padding: '5px', marginBottom: '15px', border: '1px solid #334155'}}>
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
          {/* Referral Link with actual UID */}
          <input style={styles.input} value={`https://t.me/EasyEarnBot?start=${userUID}`} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(`https://t.me/EasyEarnBot?start=${userUID}`)}>Copy Link</button>
          
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '5px', fontSize: '12px', fontWeight: '900'}}><span>User ID</span><span>Reward</span></div>
            {inviterID && (
               <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #1e293b'}}>
                 <span>Invited by: {inviterID}</span>
                 <span style={{color: '#10b981'}}>Active</span>
               </div>
            )}
            <div style={{textAlign: 'center', color: '#64748b', padding: '10px', fontSize: '12px'}}>No referrals found yet.</div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Withdraw History</h4>
          <div style={styles.historyBox}>
             <div style={{display: 'flex', justifyContent: 'space-between'}}>
               <div><span style={{display: 'block', fontWeight: '900'}}>0.5000 TON</span><small style={{color: '#94a3b8'}}>2026-04-10</small></div>
               <span style={{color: '#4ade80', fontWeight: '900'}}>Completed</span>
             </div>
          </div>
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
            <p style={{fontSize: '12px', color: '#fca5a5', lineHeight: '1.5', fontWeight: '900'}}>Fake accounts and scripts are strictly prohibited. You will be banned permanently if fraud is detected.</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('earn')}>💰<br/>Earn</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
