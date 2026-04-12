import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [isClaimed, setIsClaimed] = useState(() => localStorage.getItem('gift_claimed') === 'true');
  const [invites] = useState(0);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('menu');

  const walletAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('gift_claimed', isClaimed);
  }, [balance, completed, isClaimed]);

  // --- Logic ---
  const copyToClipboard = (txt, msg = "Copied!") => {
    navigator.clipboard.writeText(txt);
    alert(msg);
  };

  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box' },
    copySmall: { background: '#334155', color: '#fbbf24', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '10px', cursor: 'pointer', marginLeft: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
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
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

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
                      <input style={styles.input} placeholder="Channel Name" />
                      <input style={styles.input} placeholder="Link" />
                      <select style={styles.input}><option>100 Views - 0.2 TON</option></select>
                      
                      {/* Copy Section for Address & Memo */}
                      <div style={{ fontSize: '11px', background: '#0f172a', padding: '12px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }}>
                        <div style={{marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span>Address: <small style={{color:'#fbbf24'}}>...{walletAddress.slice(-8)}</small></span>
                          <button onClick={() => copyToClipboard(walletAddress, "Address Copied!")} style={styles.copySmall}>COPY ADDR</button>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span>MEMO ID: <b style={{color:'#fbbf24'}}>{userUID}</b></span>
                          <button onClick={() => copyToClipboard(userUID, "Memo ID Copied!")} style={styles.copySmall}>COPY MEMO</button>
                        </div>
                      </div>
                      
                      <button style={styles.yellowBtn} onClick={() => setShowForm(false)}>SUBMIT PAYMENT</button>
                    </div>
                  )}
                </div>
              )}
              <p style={{textAlign:'center', color:'#64748b'}}>Social Channels List...</p>
            </div>
          )}
        </>
      )}

      {/* --- INVITE PANEL (10% Highlighted) --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
            <h2 style={{ color: '#fbbf24', marginBottom: '15px' }}>INVITE FRIENDS</h2>
            
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', margin: '0' }}>ဖိတ်ခေါ်သူတစ်ဦးလျှင် <b style={{color:'#fbbf24'}}>0.0005 TON</b> ရမည်</p>
              <div style={{ height: '1px', background: '#334155', margin: '12px 0' }}></div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>
                 + 10% COMMISSION
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                (သူတို့ Task လုပ်တိုင်း ၁၀% အမြဲရမည်)
              </p>
            </div>

            <div style={{ ...styles.input, color: '#fbbf24', fontSize: '11px' }}>https://t.me/Bot?start={userUID}</div>
            <button onClick={() => copyToClipboard(`https://t.me/Bot?start=${userUID}`)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}<br/><small style={{fontSize:'10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
