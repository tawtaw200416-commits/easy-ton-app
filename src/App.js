import React, { useState, useEffect } from 'react';

function App() {
  // 1. Core Data (UID, Balance, Histories)
  const [userUID, setUserUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606"; 
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? parseFloat(saved) : 0.0000;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('transaction_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Referral & Task Status
  const [inviterID, setInviterID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tgWebAppStartParam'); 
  });

  const [hasVerifiedInvite, setHasVerifiedInvite] = useState(() => {
    return localStorage.getItem('invite_verified') === 'true';
  });

  // 3. UI States
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [inputCode, setInputCode] = useState('');

  // 4. Task Lists
  const botTasks = [
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' }
  ];

  const socialTasks = [
    { id: 101, name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 102, name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 103, name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 104, name: "@easytonfree", link: "https://t.me/easytonfree" }
  ];

  // 5. Logic Handlers
  const updateBalance = (amount, type) => {
    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem('ton_balance', newBal.toString());
    
    const newEntry = { type, amount, date: new Date().toLocaleString() };
    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('transaction_history', JSON.stringify(newHistory));

    // Verify Invite on first task completion
    if (inviterID && !hasVerifiedInvite) {
      setHasVerifiedInvite(true);
      localStorage.setItem('invite_verified', 'true');
    }
  };

  const handleRewardClaim = () => {
    if (inputCode.toUpperCase() === 'YTTPO') {
      updateBalance(0.0005, 'Promo Code');
      setInputCode('');
      alert("Success! 0.0005 TON added.");
    } else {
      alert("Invalid Reward Code!");
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      
      {/* Balance Display */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Your Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '34px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* Main Content */}
      {activeNav === 'earn' && (
        <div>
          <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '5px', borderRadius: '15px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === tab ? '#fbbf24' : 'transparent', color: activeTab === tab ? '#000' : '#94a3b8', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {tab === 'bot' ? 'Start Bot' : tab}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
            {activeTab === 'reward' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>Redeem Reward Code</h3>
                <input type="text" placeholder="ENTER CODE (YTTPO)" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', marginBottom: '15px', fontSize: '16px' }} />
                <button onClick={handleRewardClaim} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#fbbf24', color: '#000', fontWeight: 'bold' }}>Claim Now</button>
              </div>
            ) : (
              (activeTab === 'bot' ? botTasks : socialTasks).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{ fontSize: '14px' }}>{task.name}</span>
                  <button onClick={() => { window.open(task.link, '_blank'); updateBalance(0.0005, 'Task'); }} style={{ backgroundColor: '#60a5fa', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold' }}>{activeTab === 'bot' ? 'Start' : 'Join'}</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Withdraw Section */}
      {activeNav === 'withdraw' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
          <h3 style={{ textAlign: 'center', marginTop: 0 }}>Withdrawal</h3>
          <div style={{ backgroundColor: '#f59e0b11', padding: '15px', borderRadius: '12px', border: '1px solid #f59e0b', marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', color: '#fbbf24', margin: 0, lineHeight: '1.5' }}>
              ⚠️ <b>IMPORTANT:</b> You MUST include your <b>UID: {userUID}</b> in the <b>MEMO</b> field of your transaction. Failure to do so will result in permanent loss of funds.
            </p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(userUID); alert("UID Copied!"); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #fbbf24', backgroundColor: 'transparent', color: '#fbbf24', marginBottom: '15px' }}>Copy UID for Memo</button>
          <input placeholder="Enter Wallet Address" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', marginBottom: '15px' }} />
          <button style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#fbbf24', color: '#000', fontWeight: 'bold' }}>Confirm Withdrawal</button>
        </div>
      )}

      {/* History & Profile */}
      {activeNav === 'profile' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
          <h4 style={{ marginTop: 0 }}>Transaction History</h4>
          {history.length > 0 ? history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', fontSize: '12px' }}>
              <span>{h.type} ({h.date.split(',')[0]})</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{h.amount} TON</span>
            </div>
          )) : <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>No transactions found.</p>}
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }}>
        {[
          { id: 'earn', label: 'Earn', icon: '💰' },
          { id: 'withdraw', label: 'Withdraw', icon: '💸' },
          { id: 'profile', label: 'History', icon: '📜' }
        ].map(item => (
          <div key={item.id} onClick={() => setActiveNav(item.id)} style={{ textAlign: 'center', cursor: 'pointer', opacity: activeNav === item.id ? 1 : 0.5 }}>
            <div style={{ fontSize: '20px' }}>{item.icon}</div>
            <div style={{ fontSize: '10px', color: activeNav === item.id ? '#fbbf24' : '#fff', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
