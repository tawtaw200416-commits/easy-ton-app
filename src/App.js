import React, { useState } from 'react';

function App() {
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social'); // Default tab
  const [showPayForm, setShowPayForm] = useState(false);
  
  // User Data
  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const styles = {
    container: { backgroundColor: '#101827', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' },
    balanceCard: { backgroundColor: '#1f2937', borderRadius: '25px', padding: '30px', textAlign: 'center', marginBottom: '20px', border: '1px solid #374151' },
    tabContainer: { display: 'flex', backgroundColor: '#1f2937', borderRadius: '12px', padding: '5px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#9ca3af', fontWeight: 'bold', cursor: 'pointer' }),
    taskCard: { backgroundColor: '#1f2937', borderRadius: '20px', padding: '20px', border: '1px solid #374151' },
    joinBtn: { backgroundColor: '#60a5fa', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
    yellowBtn: { backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '15px', borderRadius: '15px', width: '100%', fontWeight: '900', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#111827', color: 'white', border: '1px solid #374151', marginBottom: '15px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1f2937', borderTop: '1px solid #374151' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Section - Always Visible */}
      <div style={styles.balanceCard}>
        <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Available Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '10px 0' }}>0.0000 TON</h1>
      </div>

      {/* Earn Section */}
      {activeNav === 'earn' && (
        <>
          <div style={styles.tabContainer}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => setActiveTab('reward')}>Reward</button>
          </div>

          <div style={styles.taskCard}>
            {activeTab === 'social' && !showPayForm && (
              <>
                <button style={{...styles.yellowBtn, marginBottom: '20px', border: '1px dashed #000'}} onClick={() => setShowPayForm(true)}>+ ADD YOUR TASK</button>
                <p style={{fontWeight: 'bold', marginBottom: '15px'}}>Social Channels (0.0005 TON)</p>
                {["@GrowTeaNews", "@GoldenMinerNews", "@easytonefree"].map((channel, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #374151' }}>
                    <span>{channel}</span>
                    <button style={styles.joinBtn}>Join</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '20px' }}>Redeem Reward Code</h3>
                <input style={{...styles.input, textAlign: 'center'}} placeholder="ENTER CODE (YTTPO)" />
                <button style={styles.yellowBtn}>Claim Now</button>
              </div>
            )}

            {showPayForm && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '20px' }}>Order Placement</h3>
                <input style={styles.input} placeholder="Channel Username" />
                <input style={styles.input} placeholder="Link" />
                {/* Payment Plan Logic can be added here */}
                <button style={styles.yellowBtn} onClick={() => setShowPayForm(false)}>Back</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Withdraw Section */}
      {activeNav === 'withdraw' && (
        <div style={styles.taskCard}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Withdrawal Request</h3>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Amount to Withdraw (TON):</p>
          <input style={styles.input} type="number" placeholder="0.00" />
          
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>TON Wallet Address:</p>
          <input style={styles.input} placeholder="Enter Address" />

          <div style={{ backgroundColor: '#111827', padding: '15px', borderRadius: '12px', border: '1px solid #fbbf24', marginBottom: '15px' }}>
            <p style={{ color: '#fbbf24', fontSize: '13px', margin: 0, fontWeight: 'bold' }}>MEMO (Required): {userUID}</p>
          </div>
          
          <button style={styles.yellowBtn}>CONFIRM WITHDRAWAL</button>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#fbbf24' : '#9ca3af', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>💰</span><br/><small>Earn</small>
        </div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#fbbf24' : '#9ca3af', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>👥</span><br/><small>Invite</small>
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={{ textAlign: 'center', color: activeNav === 'withdraw' ? '#fbbf24' : '#9ca3af', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>💸</span><br/><small>Withdraw</small>
        </div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#fbbf24' : '#9ca3af', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>👤</span><br/><small>Profile</small>
        </div>
      </div>
    </div>
  );
}

export default App;
