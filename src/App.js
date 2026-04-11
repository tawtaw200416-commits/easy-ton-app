import React, { useState } from 'react';

function App() {
  // 1. Core State Management
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

  // 3. Handlers
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
      handleTaskReward(0.0005, 'Reward Code', null, null);
      setInputCode('');
      alert("Reward Claimed!");
    } else {
      alert("Invalid Code!");
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  // 4. Styles
  const cardStyle = { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' };
  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', fontWeight: '900', fontSize: '15px' };
  const btnStyle = { width: '100%', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#fbbf24', color: '#000', fontWeight: '900', fontSize: '14px' };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Dynamic Balance Header */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '30px', borderRadius: '25px', marginBottom: '20px', border: '2px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Available Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '8px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: '900', textTransform: 'uppercase' }}>{t === 'bot' ? 'Start Bot' : t}</button>
            ))}
          </div>

          <div style={cardStyle}>
            {activeTab === 'reward' ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: '900', marginBottom: '20px' }}>Redeem Reward Code</h3>
                <input placeholder="ENTER CODE" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
                <button onClick={handleClaimReward} style={btnStyle}>Claim Now</button>
              </div>
            ) : (
              <>
                {(activeTab === 'bot' ? botTasks : socialTasks).map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontWeight: '900', fontSize: '14px', color: '#f8fafc' }}>{task.name}</span>
                    <button onClick={() => { if(task.link) window.open(task.link, '_blank'); handleTaskReward(0.0005, 'Task Reward', task.id, activeTab); }} style={{ backgroundColor: '#60a5fa', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '12px', fontWeight: '900' }}>{activeTab === 'bot' ? 'START' : 'JOIN'}</button>
                  </div>
                ))}
                
                {activeTab === 'social' && (
                  <button onClick={() => setShowAddTask(!showAddTask)} style={{ width: '100%', marginTop: '15px', padding: '14px', borderRadius: '12px', backgroundColor: 'transparent', color: '#fbbf24', border: '2px dashed #fbbf24', fontWeight: '900' }}>+ ADD YOUR TASK</button>
                )}
              </>
            )}
          </div>

          {activeTab === 'social' && showAddTask && (
            <div style={{ ...cardStyle, border: '2px solid #fbbf24' }}>
              <h4 style={{ fontWeight: '900', color: '#fbbf24', marginTop: 0 }}>Create Task</h4>
              <input placeholder="Channel/Bot Name" style={inputStyle} />
              <input placeholder="Invite Link" style={inputStyle} />
              <select style={inputStyle}>
                <option>100 Members - 0.2 TON</option>
                <option>200 Members - 0.4 TON</option>
                <option>300 Members - 0.5 TON</option>
              </select>
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #fbbf24' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 5px 0' }}>Send Payment to:</p>
                <code style={{ color: '#fbbf24', fontSize: '10px', wordBreak: 'break-all' }}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</code>
                <button onClick={() => copy('UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9')} style={{ display: 'block', marginTop: '10px', padding: '6px 12px', fontWeight: '900', borderRadius: '6px' }}>COPY ADDRESS</button>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '15px 0 5px 0' }}>MEMO (Your UID):</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fbbf24', fontWeight: '900' }}>{userUID}</span>
                  <button onClick={() => copy(userUID)} style={{ padding: '6px 12px', fontWeight: '900', borderRadius: '6px' }}>COPY MEMO</button>
                </div>
              </div>
              <button onClick={() => alert("Payment Verification Sent!")} style={{ ...btnStyle, marginTop: '15px' }}>I HAVE PAID</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={cardStyle}>
          <h2 style={{ fontWeight: '900', textAlign: 'center', marginBottom: '10px' }}>Referral Program</h2>
          <p style={{ textAlign: 'center', color: '#4ade80', fontWeight: '900', fontSize: '15px' }}>Earn 0.0005 TON per successful invite!</p>
          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '15px', margin: '20px 0', border: '1px solid #334155' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>Your Unique Link:</p>
            <p style={{ fontWeight: '900', wordBreak: 'break-all', color: '#fff' }}>https://t.me/EasyTONFree_Bot?start={userUID}</p>
            <button onClick={() => copy(`https://t.me/EasyTONFree_Bot?start=${userUID}`)} style={btnStyle}>COPY LINK</button>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={cardStyle}>
          <h3 style={{ fontWeight: '900', textAlign: 'center' }}>Withdrawal Request</h3>
          <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#94a3b8' }}>Amount to Withdraw (TON):</p>
          <input type="number" placeholder="0.00" style={inputStyle} />
          <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#94a3b8' }}>TON Wallet Address:</p>
          <input placeholder="Enter Address" style={inputStyle} />
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '900' }}>MEMO (Required): {userUID}</p>
          </div>
          <button style={btnStyle}>CONFIRM WITHDRAWAL</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={cardStyle}>
          <div style={{ backgroundColor: '#ef444422', padding: '15px', borderRadius: '12px', border: '1px solid #ef4444', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', color: '#f87171', fontWeight: '900', lineHeight: '1.5' }}>
              ⚠️ SECURITY ALERT: Fake activity or incorrect withdrawal memos will result in a permanent ban and loss of funds. Ensure all data is accurate.
            </p>
          </div>
          <h4 style={{ fontWeight: '900', textTransform: 'uppercase' }}>Transaction Logs</h4>
          {history.length > 0 ? history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '2px solid #0f172a' }}>
              <span style={{ fontWeight: '900', fontSize: '13px' }}>{h.type} <br/><small style={{color:'#64748b', fontWeight:'bold'}}>{h.date}</small></span>
              <span style={{ color: '#4ade80', fontWeight: '900' }}>+{h.amount} TON</span>
            </div>
          )) : <p style={{ textAlign: 'center', color: '#64748b' }}>No activity recorded.</p>}
        </div>
      )}

      {/* Persistent Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '18px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }}>
        {[
          { id: 'earn', label: 'Earn', icon: '💰' },
          { id: 'invite', label: 'Invite', icon: '👥' },
          { id: 'withdraw', label: 'Withdraw', icon: '💸' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map(item => (
          <div key={item.id} onClick={() => setActiveNav(item.id)} style={{ textAlign: 'center', cursor: 'pointer', opacity: activeNav === item.id ? 1 : 0.4 }}>
            <div style={{ fontSize: '24px' }}>{item.icon}</div>
            <div style={{ fontSize: '11px', color: activeNav === item.id ? '#fbbf24' : '#fff', marginTop: '5px', fontWeight: '900' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
