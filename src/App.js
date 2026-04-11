import React, { useState } from 'react';

function App() {
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  const paymentPlans = [
    { members: 100, price: 0.2 },
    { members: 200, price: 0.4 },
    { members: 300, price: 0.5 }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155', marginBottom: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    balanceCard: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '25px', padding: '30px', textAlign: 'center', marginBottom: '20px', border: '2px solid #fbbf24' },
    tabContainer: { display: 'flex', backgroundColor: '#0f172a', borderRadius: '15px', padding: '5px', marginBottom: '20px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', cursor: 'pointer', transition: '0.3s' }),
    input: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#020617', color: '#fff', border: '1px solid #475569', marginBottom: '15px', boxSizing: 'border-box', fontWeight: '900', outline: 'none' },
    btn: (bg = '#fbbf24', color = '#000') => ({ backgroundColor: bg, color: color, border: 'none', padding: '15px', borderRadius: '15px', fontWeight: '900', fontSize: '15px', cursor: 'pointer', width: '100%', transition: '0.3s' }),
    planBox: (isSelected) => ({ flex: 1, padding: '15px 10px', borderRadius: '16px', backgroundColor: isSelected ? '#fbbf24' : '#020617', color: isSelected ? '#000' : '#fff', border: isSelected ? 'none' : '2px solid #334155', textAlign: 'center', cursor: 'pointer', transition: '0.3s' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1e293b', borderTop: '2px solid #334155' },
    historyBox: { backgroundColor: '#020617', borderRadius: '15px', padding: '15px', marginTop: '10px', border: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Wallet Balance Display */}
      <div style={styles.balanceCard}>
        <p style={{ color: '#fbbf24', fontSize: '13px', margin: 0, fontWeight: '900', letterSpacing: '1px' }}>TOTAL TON BALANCE</p>
        <h1 style={{ color: '#ffffff', fontSize: '42px', margin: '10px 0', fontWeight: '900', textShadow: '0 0 10px rgba(251, 191, 36, 0.3)' }}>0.0000</h1>
      </div>

      {/* EARN SECTION */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabContainer}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>Reward</button>
          </div>

          {!showPayForm ? (
            <div style={styles.card}>
              {activeTab === 'social' && (
                <>
                  <button style={{...styles.btn('#fbbf24', '#000'), border: '2px dashed #000', marginBottom: '20px'}} onClick={() => setShowPayForm(true)}>+ ADD YOUR TASK</button>
                  <p style={{fontWeight: '900', color: '#fbbf24', marginBottom: '15px'}}>Active Channels (0.0005 TON)</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{fontWeight: '900', color: '#e2e8f0'}}>@easytonefree</span>
                    <button style={{...styles.btn('#38bdf8', '#fff'), width: 'auto', padding: '8px 25px'}}>Join</button>
                  </div>
                </>
              )}
              {activeTab === 'reward' && (
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontWeight: '900', color: '#fbbf24' }}>Redeem Code</h3>
                  <input style={{...styles.input, textAlign: 'center'}} placeholder="EX: YTTPO" />
                  <button style={styles.btn()}>Claim Now</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#fbbf24', marginBottom: '20px' }}>Order Placement</h3>
              <input style={styles.input} placeholder="Channel Username (@...)" />
              <input style={styles.input} placeholder="Invite Link" />
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                {paymentPlans.map((plan, i) => (
                  <div key={i} style={styles.planBox(selectedPlan === i)} onClick={() => setSelectedPlan(i)}>
                    <div style={{ fontSize: '14px', fontWeight: '900' }}>{plan.members} Subs</div>
                    <div style={{ fontSize: '12px', fontWeight: '900', opacity: 0.8 }}>{plan.price} TON</div>
                  </div>
                ))}
              </div>

              {selectedPlan !== null && (
                <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '20px', border: '2px solid #fbbf24', marginBottom: '20px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '900', display: 'block', marginBottom: '8px' }}>ADMIN TON ADDRESS</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code style={{ fontSize: '11px', wordBreak: 'break-all', color: '#fff', fontWeight: '900' }}>{adminWallet}</code>
                    <button onClick={() => copyToClipboard(adminWallet)} style={{ background: '#fbbf24', border: 'none', color: '#000', fontWeight: '900', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', marginLeft: '10px' }}>COPY</button>
                  </div>
                  
                  <div style={{ height: '1px', background: '#334155', margin: '15px 0' }} />
                  
                  <label style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '900', display: 'block', marginBottom: '8px' }}>REQUIRED MEMO (UID)</label>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ color: '#fbbf24', fontSize: '18px', fontWeight: '900' }}>{userUID}</b>
                    <button onClick={() => copyToClipboard(userUID)} style={{ background: '#fbbf24', border: 'none', color: '#000', fontWeight: '900', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>COPY</button>
                  </div>
                </div>
              )}
              <button style={{...styles.btn(), marginBottom: '12px'}}>Submit Order</button>
              <button style={styles.btn('#334155', '#fff')} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {/* INVITE SECTION */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900', color: '#fbbf24'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px', color: '#ffffff', fontWeight: '900', marginBottom: '20px'}}>Earn 0.0005 TON per successful invite!</p>
          <input style={styles.input} value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} readOnly />
          <button style={styles.btn()} onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${userUID}`)}>Copy Link</button>
          
          <h4 style={{marginTop: '30px', fontWeight: '900', color: '#fbbf24'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px', fontWeight: '900', borderBottom: '1px solid #334155', paddingBottom: '10px'}}><span>User ID</span><span>Status</span></div>
            <div style={{textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '13px', fontWeight: '900'}}>No invites yet.</div>
          </div>
        </div>
      )}

      {/* WITHDRAW SECTION */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900', textAlign: 'center', color: '#fbbf24'}}>Withdraw TON</h3>
          <label style={{fontWeight: '900', fontSize: '12px', color: '#94a3b8'}}>Amount (Min 0.1):</label>
          <input style={styles.input} placeholder="0.00" type="number" />
          <label style={{fontWeight: '900', fontSize: '12px', color: '#94a3b8'}}>TON Wallet Address:</label>
          <input style={styles.input} placeholder="Enter your address" />
          <div style={{backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '2px solid #fbbf24', textAlign: 'center'}}>
             <small style={{color: '#fbbf24', fontWeight: '900', fontSize: '14px'}}>MEMO: {userUID}</small>
          </div>
          <button style={styles.btn()}>Withdraw Now</button>
        </div>
      )}

      {/* PROFILE SECTION */}
      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900', color: '#fbbf24'}}>User Profile</h3>
          <div style={{backgroundColor: '#020617', padding: '20px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '20px'}}>
            <p style={{fontWeight: '900', margin: '10px 0', color: '#fff'}}>UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p style={{fontWeight: '900', margin: '10px 0', color: '#fff'}}>Status: <span style={{color: '#10b981'}}>Active Verified</span></p>
          </div>
          <div style={{border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '18px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, fontWeight: '900'}}>⚠️ Security Policy</h4>
            <p style={{fontSize: '12px', color: '#fca5a5', lineHeight: '1.6', fontWeight: '900'}}>Fake accounts and scripts are strictly prohibited. We use AI to detect fraud. Permanent ban will be issued for violations.</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map((nav) => (
          <div key={nav} onClick={() => {setActiveNav(nav); setShowPayForm(false);}} style={{ textAlign: 'center', flex: 1, cursor: 'pointer', transition: '0.3s' }}>
            <span style={{ fontSize: '22px', display: 'block', marginBottom: '4px' }}>
              {nav === 'earn' ? '💰' : nav === 'invite' ? '👥' : nav === 'withdraw' ? '💸' : '👤'}
            </span>
            <small style={{ color: activeNav === nav ? '#fbbf24' : '#94a3b8', fontWeight: '900', textTransform: 'capitalize' }}>{nav}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
