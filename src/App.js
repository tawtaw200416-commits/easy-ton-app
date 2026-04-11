import React, { useState } from 'react';

function App() {
  const [activeNav, setActiveNav] = useState('earn');
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // User UID (In real app, fetch from TG WebApp)
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
    card: { backgroundColor: '#1c2536', borderRadius: '24px', padding: '20px', border: '1px solid #2d3748', marginBottom: '15px' },
    input: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '15px', boxSizing: 'border-box' },
    yellowBtn: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#facc15', color: '#000', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '16px' },
    planBox: (isSelected) => ({
      flex: 1, padding: '15px 10px', borderRadius: '14px', backgroundColor: isSelected ? '#facc15' : '#0f172a',
      color: isSelected ? '#000' : '#fff', border: isSelected ? 'none' : '1px solid #334155',
      textAlign: 'center', cursor: 'pointer', transition: '0.3s'
    }),
    copyLabel: { color: '#94a3b8', fontSize: '12px', marginBottom: '5px', display: 'block' }
  };

  return (
    <div style={{ backgroundColor: '#131926', color: 'white', minHeight: '100vh', padding: '15px' }}>
      
      {/* Earn Section with Add Task Logic */}
      {activeNav === 'earn' && (
        <>
          {!showPayForm ? (
            <div style={styles.card}>
              <h3 style={{ textAlign: 'center' }}>Social Channels</h3>
              <button style={styles.yellowBtn} onClick={() => setShowPayForm(true)}>+ Add Your Task</button>
            </div>
          ) : (
            <div style={styles.card}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Order Placement</h3>
              
              <input style={styles.input} placeholder="Channel Username (e.g. @yourchannel)" />
              <input style={styles.input} placeholder="Invite Link" />

              <label style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>Select Plan:</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {paymentPlans.map((plan, i) => (
                  <div key={i} style={styles.planBox(selectedPlan === i)} onClick={() => setSelectedPlan(i)}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{plan.members} Subs</div>
                    <div style={{ fontSize: '12px' }}>{plan.price} TON</div>
                  </div>
                ))}
              </div>

              {selectedPlan !== null && (
                <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '16px', border: '1px solid #facc15', marginBottom: '20px' }}>
                  <span style={styles.copyLabel}>Admin TON Address:</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', wordBreak: 'break-all', fontSize: '12px' }}>
                    <code>{adminWallet}</code>
                    <button onClick={() => copyToClipboard(adminWallet)} style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', fontWeight: 'bold' }}>COPY</button>
                  </div>
                  
                  <hr style={{ border: '0.5px solid #2d3748', margin: '15px 0' }} />
                  
                  <span style={styles.copyLabel}>Required MEMO (Your UID):</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ color: '#facc15', fontSize: '16px' }}>{userUID}</b>
                    <button onClick={() => copyToClipboard(userUID)} style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', fontWeight: 'bold' }}>COPY</button>
                  </div>
                  <p style={{ fontSize: '10px', color: '#f87171', marginTop: '10px', textAlign: 'center' }}>
                    ⚠️ Failure to include MEMO will result in loss of funds.
                  </p>
                </div>
              )}

              <button style={{ ...styles.yellowBtn, marginBottom: '10px' }} onClick={() => alert("Submit successful! Pending review.")}>Submit Order</button>
              <button style={{ ...styles.yellowBtn, backgroundColor: '#334155', color: '#fff' }} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {/* Footer Nav Simulation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1c2536', borderTop: '1px solid #2d3748' }}>
        <div style={{ color: activeNav === 'earn' ? '#facc15' : '#94a3b8' }} onClick={() => setActiveNav('earn')}>💰 Earn</div>
        <div style={{ color: '#94a3b8' }}>👥 Invite</div>
        <div style={{ color: '#94a3b8' }}>💸 Withdraw</div>
      </div>
    </div>
  );
}

export default App;
