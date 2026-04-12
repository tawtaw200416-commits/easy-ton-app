import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('menu');

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((ch, i) => ({ id: `s${i}`, name: ch, link: `https://t.me/${ch.replace('@','')}` }));

  const handleClaim = () => {
    const codeInput = document.getElementById('giftInput');
    const code = codeInput.value.trim().toUpperCase();

    if (isClaimed) {
      alert("This code has already been used by you!");
      return;
    }

    if (code === "GIFT77") { // မိတ်ဆွေ စိတ်ကြိုက် code ပြောင်းနိုင်သည်
      setBalance(prev => prev + 0.01);
      setIsClaimed(true);
      alert("Congratulations! 0.01 TON added to your balance.");
    } else {
      alert("Invalid Code! Please check and try again.");
    }
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.main}>
      {/* --- BALANCE --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {/* --- REWARD TAB (Updated Logic) --- */}
          {activeTab === 'reward' && (
            <div style={styles.card}>
              <h4 style={{ marginTop: 0 }}>DAILY REWARD CODE</h4>
              {isClaimed ? (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <p style={{ color: '#fbbf24', fontSize: '16px', fontWeight: 'bold' }}>✅ SUCCESS</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px' }}>You have already claimed this reward. Come back tomorrow!</p>
                </div>
              ) : (
                <>
                  <input id="giftInput" style={styles.input} placeholder="Enter your gift code..." />
                  <button onClick={handleClaim} style={styles.yellowBtn}>CLAIM NOW</button>
                </>
              )}
            </div>
          )}

          {/* --- SOCIAL TAB --- */}
          {activeTab === 'social' && (
            <div>
              <button style={{ ...styles.yellowBtn, marginBottom: '15px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
              
              {showForm && (
                <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
                   {formType === 'menu' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={styles.yellowBtn} onClick={() => setFormType('add')}>ADD TASK</button>
                      <button style={{ ...styles.yellowBtn, background: '#334155', color: '#fff' }} onClick={() => setFormType('my')}>MY TASK</button>
                    </div>
                  ) : (
                    <div>
                      <input style={styles.input} placeholder="Name" />
                      <input style={styles.input} placeholder="Link" />
                      <select style={styles.input}><option>100 Views - 0.2 TON</option></select>
                      <p style={{fontSize: '11px'}}>MEMO: <b>{userUID}</b></p>
                      <button style={styles.yellowBtn} onClick={() => setShowForm(false)}>SUBMIT</button>
                    </div>
                  )}
                </div>
              )}

              {socialChannels.map(s => (
                <div key={s.id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>{s.name}</span>
                    <button style={{ ...styles.yellowBtn, width: '90px', fontSize: '11px' }}>JOIN</button>
                  </div>
                </div>
              ))}
              <button style={{ ...styles.yellowBtn, marginTop: '10px' }} onClick={() => setShowForm(!showForm)}>+ ADD TASK</button>
            </div>
          )}
          
          {/* Bot Tab logic here... */}
        </>
      )}

      {/* --- FOOTER --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}<br/><small style={{fontSize: '10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
