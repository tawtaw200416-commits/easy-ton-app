import React, { useState, useEffect } from 'react';

function App() {
  // --- States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [invites, setInvites] = useState(() => Number(localStorage.getItem('invite_count')) || 0);
  const [activeNav, setActiveNav] = useState('invite'); // Default to invite for testing

  // --- Style Helper ---
  const styles = {
    main: { backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #334155' },
    yellowBtn: { width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
    referBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px dashed #fbbf24', color: '#fbbf24', fontSize: '12px', wordBreak: 'break-all' },
    rewardText: { color: '#10b981', fontSize: '14px', fontWeight: 'bold', marginTop: '5px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', zIndex: 100 }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://t.me/YourBot?start=${userUID}`);
    alert("Referral link copied!");
  };

  return (
    <div style={styles.main}>
      {/* --- TOTAL BALANCE --- */}
      <div style={{ textAlign: 'center', border: '1px solid #fbbf24', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
        <small style={{ color: '#94a3b8' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fbbf24', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* --- INVITE PANEL --- */}
      {activeNav === 'invite' && (
        <div style={{ textAlign: 'center' }}>
          <div style={styles.card}>
            <h2 style={{ margin: '0 0 15px 0', color: '#fbbf24', letterSpacing: '1px' }}>INVITE FRIENDS</h2>
            
            {/* Rewards Info Section */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '15px', margin: '0' }}>Earn <span style={{color: '#fbbf24'}}>0.0005 TON</span> per friend</p>
              {/* မိတ်ဆွေတောင်းဆိုထားသော 10% Logic စာသား */}
              <p style={styles.rewardText}>
                + 10% from every task they complete!
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
                (သူတို့ Task တစ်ခုလုပ်တိုင်း ၁၀ ရာခိုင်နှုန်း ကော်မရှင်ရပါမည်)
              </p>
            </div>

            <div style={styles.referBox}>
              https://t.me/YourBot?start={userUID}
            </div>
            
            <button onClick={copyLink} style={styles.yellowBtn}>
              COPY REFER LINK
            </button>
          </div>

          {/* Invite Stats */}
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>INVITE HISTORY</h3>
            <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8' }}>Total Friends Invited:</span>
              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '18px' }}>{invites}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER NAV --- */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ textAlign: 'center', color: activeNav === n ? '#fbbf24' : '#64748b', flex: 1, cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>
              {n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}
            </span>
            <br/><small style={{fontSize: '10px', fontWeight: activeNav === n ? 'bold' : 'normal'}}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
