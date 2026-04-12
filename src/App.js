import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [invites, setInvites] = useState(() => Number(localStorage.getItem('invite_count')) || 0);
  
  const [activeNav, setActiveNav] = useState('earn'); // earn, invite, withdraw, profile
  const [activeTab, setActiveTab] = useState('bot'); // bot, reward, social

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('invite_count', invites.toString());
  }, [balance, completed, invites]);

  // --- Logic ---
  const copyText = (txt, msg = "Copied!") => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => alert(msg));
    } else {
      alert("Clipboard not supported");
    }
  };

  // --- Styles ---
  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif', boxSizing: 'border-box' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: active ? '#fbbf24' : '#1e293b', color: active ? '#000' : '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  const referLink = `https://t.me/YourBot?start=${userUID}`;

  return (
    <div style={styles.main}>
      {/* --- BALANCE HEADER --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px', backgroundColor: '#0f172a' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0', fontSize: '32px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* --- EARN PANEL --- */}
      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'reward', 'social'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={styles.tabBtn(activeTab === t)}>{t.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ textAlign: 'center', color: '#64748b', marginTop: '30px' }}>
            {activeTab.toUpperCase()} content will appear here.
          </div>
        </>
      )}

      {/* --- INVITE PANEL (Fixed & English Text) --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...styles.card, border: '1px solid #fbbf24' }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#fbbf24' }}>INVITE FRIENDS</h2>
            
            <div style={{ padding: '15px', background: '#0f172a', borderRadius: '12px', marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', margin: '0' }}>Get <b style={{color: '#fbbf24'}}>0.0005 TON</b> per friend</p>
              <div style={{ height: '1px', background: '#334155', margin: '12px 0' }}></div>
              {/* Commission Text in English as requested */}
              <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>
                 + 10% COMMISSION
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
                (from every task they complete)
              </p>
            </div>

            <div style={{ ...styles.input, color: '#fbbf24', fontSize: '11px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {referLink}
            </div>
            <button onClick={() => copyText(referLink)} style={styles.yellowBtn}>COPY REFER LINK</button>
          </div>
          
          <h3 style={{ marginTop: '25px', textAlign: 'left', paddingLeft: '5px' }}>INVITE HISTORY</h3>
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>Total Friends Invited:</span>
              <b style={{ color: '#fbbf24', fontSize: '18px' }}>{invites}</b>
            </div>
          </div>
        </div>
      )}

      {/* --- WITHDRAW & PROFILE (Placeholders) --- */}
      {(activeNav === 'withdraw' || activeNav === 'profile') && (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '50px' }}>
          {activeNav.toUpperCase()} panel is coming soon.
        </div>
      )}

      {/* --- FOOTER NAV --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>
              {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}
            </span>
            <br/><small style={{fontSize: '10px'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
