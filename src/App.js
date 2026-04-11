import React, { useState } from 'react';

function App() {
  const [userUID] = useState(() => {
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

  const [withdrawHistory, setWithdrawHistory] = useState(() => {
    const saved = localStorage.getItem('withdraw_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [inviteHistory] = useState([
    { id: "User_8821", amount: 0.0005, status: "Verified" },
    { id: "User_9902", amount: 0.0005, status: "Verified" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const [socialTasks] = useState([
    { id: 101, name: "@GrowTeaNews" }, { id: 102, name: "@GoldenMinerNews" },
    { id: 103, name: "@cryptogold_online_official" }, { id: 104, name: "@M9460" },
    { id: 105, name: "@USDTcloudminer_channel" }, { id: 106, name: "@ADS_TON1" },
    { id: 107, name: "@goblincrypto" }, { id: 108, name: "@WORLD_CRYPTO" }
  ]);

  const handleTaskReward = (amount, type) => {
    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem('ton_balance', newBal.toString());
    const newEntry = { type, amount, date: new Date().toLocaleString() };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem('transaction_history', JSON.stringify(updated));
    alert("Access Granted: Joining Task...");
  };

  const cardStyle = { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' };
  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900' };
  const btnStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#fbbf24', color: '#000', fontWeight: '900' };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '30px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>TON BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '8px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={cardStyle}>
            {activeTab === 'reward' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: '900' }}>Redeem Code</h3>
                <input placeholder="ENTER CODE" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
                <button onClick={() => { if(inputCode === 'YTTPO') handleTaskReward(0.0005, 'Promo'); setInputCode(''); }} style={btnStyle}>CLAIM</button>
              </div>
            ) : (
              <>
                {socialTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontWeight: '900' }}>{task.name}</span>
                    <button onClick={() => handleTaskReward(0.0005, 'Social Join')} style={{ backgroundColor: '#60a5fa', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: '900' }}>JOIN</button>
                  </div>
                ))}
                {/* +Add Task kပ်လျက် */}
                {activeTab === 'social' && (
                  <button onClick={() => setShowAddTask(!showAddTask)} style={{ width: '100%', marginTop: '15px', padding: '14px', borderRadius: '12px', backgroundColor: 'transparent', color: '#fbbf24', border: '2px dashed #fbbf24', fontWeight: '900' }}>+ ADD YOUR TASK</button>
                )}
              </>
            )}
          </div>
          
          {showAddTask && activeTab === 'social' && (
            <div style={{ ...cardStyle, border: '2px solid #fbbf24' }}>
              <input placeholder="Channel Name" style={inputStyle} />
              <input placeholder="Link" style={inputStyle} />
              <button style={btnStyle}>SUBMIT TASK</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: '900', textAlign: 'center' }}>Withdrawal Request</h3>
          <input type="number" placeholder="Amount (TON)" style={inputStyle} />
          <input placeholder="TON Wallet Address" style={inputStyle} />
          {/* Memo Box Removed as requested */}
          <button style={btnStyle}>CONFIRM WITHDRAWAL</button>

          <h4 style={{ fontWeight: '900', marginTop: '30px' }}>Withdraw History</h4>
          {withdrawHistory.length > 0 ? withdrawHistory.map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{w.address.slice(0,10)}...</span>
              <span style={{ color: '#f87171', fontWeight: '900' }}>-{w.amount} TON</span>
            </div>
          )) : <p style={{ color: '#64748b', fontSize: '12px' }}>No withdrawal history.</p>}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={cardStyle}>
          <div style={{ backgroundColor: '#ef444422', padding: '15px', borderRadius: '12px', border: '1px solid #ef4444', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#f87171', fontWeight: '900' }}>⚠️ Fake activity or incorrect withdrawal data will result in a permanent ban.</p>
          </div>
          <h4 style={{ fontWeight: '900' }}>Invite History</h4>
          {inviteHistory.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
              <span style={{ fontWeight: 'bold' }}>{inv.id}</span>
              <span style={{ color: '#4ade80', fontWeight: '900' }}>+{inv.amount} TON</span>
            </div>
          ))}
          <h4 style={{ fontWeight: '900', marginTop: '20px' }}>Task History</h4>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
              <span style={{ fontWeight: 'bold' }}>{h.type}</span>
              <span style={{ color: '#4ade80', fontWeight: '900' }}>+{h.amount} TON</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '18px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }}>
        {[
          { id: 'earn', label: 'Earn', icon: '💰' },
          { id: 'invite', label: 'Invite', icon: '👥' },
          { id: 'withdraw', label: 'Withdraw', icon: '💸' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map(item => (
          <div key={item.id} onClick={() => setActiveNav(item.id)} style={{ textAlign: 'center', cursor: 'pointer', opacity: activeNav === item.id ? 1 : 0.4 }}>
            <div style={{ fontSize: '24px' }}>{item.icon}</div>
            <div style={{ fontSize: '11px', color: activeNav === item.id ? '#fbbf24' : '#fff', fontWeight: '900' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
