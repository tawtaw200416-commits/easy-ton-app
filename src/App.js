import React, { useState, useEffect } from 'react';

function App() {
  // Persistence Data
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0015);
  const [referralCount, setReferralCount] = useState(() => JSON.parse(localStorage.getItem('ref_count')) || 0);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  
  // UI States
  const [activeNav, setActiveNav] = useState('earn');
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const userUID = "1793453606";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('ref_count', JSON.stringify(referralCount));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
  }, [balance, referralCount, withdrawHistory]);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance.");
      return;
    }
    const newEntry = { 
      amount, 
      address: withdrawAddress, 
      date: new Date().toLocaleString(), 
      status: "Pending" 
    };
    setWithdrawHistory([newEntry, ...withdrawHistory]);
    setBalance(prev => prev - amount);
    setWithdrawAmount("");
    setWithdrawAddress("");
    alert("Withdrawal request successful.");
  };

  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    balanceCard: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '30px 15px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    balanceText: { fontSize: '40px', fontWeight: '900', color: '#eab308', margin: '10px 0' },
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b', justifyContent: 'space-around' },
    btnPrimary: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: 'bold', color: '#000', cursor: 'pointer' },
    warningBox: { borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '15px' },
    historyItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', fontSize: '13px' }
  };

  return (
    <div style={styles.container}>
      {/* Top Balance - Always Visible */}
      <div style={styles.balanceCard}>
        <div style={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '13px' }}>AVAILABLE BALANCE</div>
        <div style={styles.balanceText}>{balance.toFixed(4)} TON</div>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', color: '#eab308' }}>Tasks & Missions</h3>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Claim your rewards from completed tasks here.</p>
        </div>
      )}

      {activeNav === 'invite' && (
        <>
          <div style={styles.card}>
            <h3 style={{ color: '#eab308' }}>Invite Friends</h3>
            <p>Earn 0.01 TON for every successful invitation.</p>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', fontSize: '12px', wordBreak: 'break-all' }}>
              https://t.me/YourBotLink?start={userUID}
            </div>
          </div>
          <div style={styles.card}>
            <h4 style={{ color: '#eab308' }}>Invite History</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Successful Invites:</span>
              <span style={{ fontWeight: 'bold' }}>{referralCount} Users</span>
            </div>
          </div>
        </>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{ color: '#eab308' }}>Withdraw Funds</h3>
            <input 
              style={styles.input} 
              placeholder="Amount (TON)" 
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <input 
              style={styles.input} 
              placeholder="TON Wallet Address" 
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
            <button onClick={handleWithdraw} style={styles.btnPrimary}>Confirm Withdrawal</button>
          </div>
          
          <div style={styles.card}>
            <h4 style={{ color: '#eab308' }}>Withdrawal History</h4>
            {withdrawHistory.length === 0 ? <p style={{ color: '#94a3b8' }}>No history found.</p> : 
              withdrawHistory.map((h, i) => (
                <div key={i} style={styles.historyItem}>
                  <div>{h.date}</div>
                  <div style={{ color: '#eab308' }}>{h.amount} TON</div>
                  <div style={{ color: '#10b981' }}>{h.status}</div>
                </div>
              ))
            }
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ color: '#eab308', textAlign: 'center' }}>Account Profile</h3>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ color: '#94a3b8' }}>User ID:</div>
            <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{userUID}</div>
          </div>
          
          <h4 style={{ color: '#ef4444' }}>Important Notices</h4>
          <div style={styles.warningBox}>
            <p>• Multi-accounting is strictly prohibited.</p>
            <p>• Incorrect wallet addresses cannot be refunded.</p>
            <p>• Withdrawals are processed within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#eab308' : '#94a3b8' }}>
          <div style={{ fontSize: '20px' }}>💰</div><div style={{ fontSize: '10px' }}>EARN</div>
        </div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#eab308' : '#94a3b8' }}>
          <div style={{ fontSize: '20px' }}>👥</div><div style={{ fontSize: '10px' }}>INVITE</div>
        </div>
        <div onClick={() => setActiveNav('withdraw')} style={{ textAlign: 'center', color: activeNav === 'withdraw' ? '#eab308' : '#94a3b8' }}>
          <div style={{ fontSize: '20px' }}>💸</div><div style={{ fontSize: '10px' }}>WITHDRAW</div>
        </div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#eab308' : '#94a3b8' }}>
          <div style={{ fontSize: '20px' }}>👤</div><div style={{ fontSize: '10px' }}>PROFILE</div>
        </div>
      </div>
    </div>
  );
}

export default App;
