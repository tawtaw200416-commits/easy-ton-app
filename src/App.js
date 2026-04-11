import React, { useState } from 'react';

function App() {
  // 1. Core States
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

  const [inviteHistory, setInviteHistory] = useState(() => {
    const saved = localStorage.getItem('invite_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [inputCode, setInputCode] = useState('');

  // 2. Task Lists
  const [botTasks, setBotTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  const [socialTasks, setSocialTasks] = useState([
    { id: 101, name: "@GrowTeaNews" }, { id: 102, name: "@GoldenMinerNews" },
    { id: 103, name: "@cryptogold_online_official" }, { id: 104, name: "@M9460" },
    { id: 105, name: "@USDTcloudminer_channel" }, { id: 106, name: "@ADS_TON1" },
    { id: 107, name: "@goblincrypto" }, { id: 108, name: "@WORLDBESTCRYTO" },
    { id: 109, name: "@kombo_crypta" }, { id: 110, name: "@easytonfree" },
    { id: 111, name: "@WORLDBESTCRYTO1" }, { id: 112, name: "@MONEYHUB9_69" },
    { id: 113, name: "@zrbtua" }, { id: 114, name: "@perviu1million" }
  ]);

  // 3. Logic Handlers
  const handleTaskReward = (amount, type, id, listType) => {
    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem('ton_balance', newBal.toString());
    
    const newEntry = { type, amount, date: new Date().toLocaleString() };
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('transaction_history', JSON.stringify(updatedHistory));

    if (listType === 'bot') setBotTasks(prev => prev.filter(t => t.id !== id));
    if (listType === 'social') setSocialTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleClaimReward = () => {
    if (inputCode.toUpperCase() === 'YTTPO') {
      handleTaskReward(0.0005, 'Promo Code', null, null);
      setInputCode('');
      alert("0.0005 TON added to balance!");
    } else {
      alert("Invalid Code!");
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  // 4. Shared Styles
  const cardStyle = { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', marginBottom: '10px', fontWeight: 'bold' };
  const buttonStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#fbbf24', color: '#000', fontWeight: '900', cursor: 'pointer' };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', background: 'linear-gradient(to bottom, #1e293b, #0f172a)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>Your Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }}>{t === 'bot' ? 'Start Bot' : t}</button>
            ))}
          </div>

          <div style={cardStyle}>
            {activeTab === 'reward' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: '900', marginBottom: '20px' }}>Redeem Reward Code</h3>
                <input placeholder="ENTER CODE (YTTPO)" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
                <button onClick={handleClaimReward} style={buttonStyle}>Claim Now</button>
              </div>
            ) : (
              (activeTab === 'bot' ? botTasks : socialTasks).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.name}</span>
                  <button onClick={() => { if(task.link) window.open(task.link, '_blank'); handleTaskReward(0.0005, 'Task', task.id, activeTab); }} style={{ backgroundColor: '#60a5fa', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '900' }}>{activeTab === 'bot' ? 'Start' : 'Join'}</button>
                </div>
              ))
            )}
            
            {/* +Add Task ONLY in Social Tab */}
            {activeTab === 'social' && (
              <button onClick={() => setShowAddTask(!showAddTask)} style={{ width: '100%', marginTop: '15px', padding: '12px', borderRadius: '12px', backgroundColor: 'transparent', color: '#fbbf24', border: '2px dashed #fbbf24', fontWeight: '900' }}>+ ADD TASK</button>
            )}
          </div>

          {activeTab === 'social' && showAddTask && (
            <div style={{ ...cardStyle, border: '2px solid #fbbf24' }}>
              <h4 style={{ fontWeight: '900', marginTop: 0 }}>Create New Task</h4>
              <input placeholder="Channel Name (@example)" style={inputStyle} />
              <input placeholder="Invite Link" style={inputStyle} />
              <select style={inputStyle}>
                <option>100 Members - 0.2 TON</option>
                <option>200 Members - 0.4 TON</option>
                <option>300 Members - 0.5 TON</option>
              </select>
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 5px 0' }}>Send TON to Address:</p>
                <code style={{ color: '#fbbf24', fontSize: '10px', wordBreak: 'break-all' }}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</code>
                <button onClick={() => copy('UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9')} style={{ display: 'block', marginTop: '8px', padding: '5px 10px', fontSize: '10px', fontWeight: 'bold' }}>Copy Address</button>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '15px 0 5px 0' }}>Required MEMO (Your UID):</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fbbf24', fontWeight: '900' }}>{userUID}</span>
                  <button onClick={() => copy(userUID)} style={{ padding: '5px 10px', fontSize: '10px', fontWeight: 'bold' }}>Copy Memo</button>
                </div>
              </div>
              <button onClick={() => alert("Verification request sent to Admin!")} style={buttonStyle}>Confirm Payment</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: '900', textAlign: 'center' }}>Invite & Earn</h3>
          <p style={{ fontSize: '13px', textAlign: 'center', color: '#4ade80', fontWeight: 'bold' }}>Earn 0.0005 TON for every verified invite!</p>
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center', margin: '20px 0' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Your Referral Link</span>
            <p style={{ fontWeight: 'bold', wordBreak: 'break-all', fontSize: '12px' }}>https://t.me/EasyTONFree_Bot?start={userUID}</p>
            <button onClick={() => copy(`https://t.me/EasyTONFree_Bot?start=${userUID}`)} style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900' }}>Copy Link</button>
          </div>
          <h4 style={{ fontWeight: '900' }}>Invite History</h4>
          {inviteHistory.length > 0 ? inviteHistory.map((inv, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #334155' }}>
              <span>User ID: {inv.id}</span>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+0.0005 TON</span>
            </div>
          )) : <p style={{ fontSize: '12px', color: '#94a3b8' }}>No invites yet.</p>}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: '900', textAlign: 'center' }}>Withdraw Funds</h3>
          <div style={{ backgroundColor: '#ef444422', padding: '15px', borderRadius: '12px', border: '1px solid #ef4444', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', color: '#f87171', margin: 0, fontWeight: 'bold', lineHeight: '1.4' }}>
              ⚠️ WARNING: Fake addresses or providing incorrect Memo details will result in permanent loss of funds. We do not refund failed transactions due to user error.
            </p>
          </div>
          <input placeholder="Enter TON Address" style={inputStyle} />
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>Memo (Required UID):</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#0f172a', padding: '12px', borderRadius: '10px' }}>
              <span style={{ fontWeight: '900', color: '#fbbf24' }}>{userUID}</span>
              <button onClick={() => copy(userUID)} style={{ fontSize: '10px', fontWeight: 'bold' }}>Copy</button>
            </div>
          </div>
          <button style={buttonStyle}>Confirm Withdrawal</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: '900', marginTop: 0 }}>Activity Logs</h3>
          {history.length > 0 ? history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155', fontSize: '12px' }}>
              <span style={{ fontWeight: 'bold' }}>{h.type} <br/><small style={{color:'#94a3b8', fontWeight:'normal'}}>{h.date}</small></span>
              <span style={{ color: '#4ade80', fontWeight: '900' }}>+{h.amount} TON</span>
            </div>
          )) : <p style={{ fontSize: '12px', color: '#94a3b8' }}>No transactions found.</p>}
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }}>
        {[
          { id: 'earn', label: 'Earn', icon: '💰' },
          { id: 'invite', label: 'Invite', icon: '👥' },
          { id: 'withdraw', label: 'Withdraw', icon: '💸' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map(item => (
          <div key={item.id} onClick={() => setActiveNav(item.id)} style={{ textAlign: 'center', cursor: 'pointer', opacity: activeNav === item.id ? 1 : 0.5 }}>
            <div style={{ fontSize: '20px' }}>{item.icon}</div>
            <div style={{ fontSize: '10px', color: activeNav === item.id ? '#fbbf24' : '#fff', marginTop: '4px', fontWeight: '900' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
