import React, { useState, useEffect } from 'react';

function App() {
  // 1. Core State Management
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

  // 2. Navigation & View States
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);

  // 3. Dynamic Task Lists
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

  // 4. Handlers: Balance, Tasks, & History
  const updateBalance = (amount, type, taskId, listType) => {
    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem('ton_balance', newBal.toString());
    
    const newEntry = { type, amount, date: new Date().toLocaleString() };
    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('transaction_history', JSON.stringify(newHistory));

    // Remove task after completion
    if (listType === 'bot') setBotTasks(prev => prev.filter(t => t.id !== taskId));
    if (listType === 'social') setSocialTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      
      {/* Header Balance */}
      <div style={{ textAlign: 'center', background: '#1e293b', padding: '20px', borderRadius: '20px', marginBottom: '15px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Your Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '32px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#1e293b', color: activeTab === t ? '#000' : '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>{t === 'bot' ? 'Start Bot' : t}</button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155' }}>
            {(activeTab === 'bot' ? botTasks : socialTasks).map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: '14px' }}>{task.name}</span>
                <button onClick={() => { if(task.link) window.open(task.link, '_blank'); updateBalance(0.0005, 'Task Reward', task.id, activeTab); }} style={{ backgroundColor: '#60a5fa', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', fontWeight: 'bold' }}>{activeTab === 'bot' ? 'Start' : 'Join'}</button>
              </div>
            ))}
            {activeTab === 'reward' && <p style={{textAlign:'center', color:'#94a3b8'}}>Enter YTTPO to claim reward.</p>}
          </div>

          {/* +Add Task Button & Form */}
          <button onClick={() => setShowAddTask(!showAddTask)} style={{ width: '100%', marginTop: '15px', padding: '15px', borderRadius: '15px', backgroundColor: '#334155', color: '#fff', border: '1px dashed #fbbf24', fontWeight: 'bold' }}>+ Add Your Task</button>
          
          {showAddTask && (
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', marginTop: '15px', border: '2px solid #fbbf24' }}>
              <input placeholder="Task Name (@Channel or BotName)" style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', marginBottom: '10px' }} />
              <input placeholder="Task Link (URL)" style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', marginBottom: '15px' }} />
              
              <p style={{ fontSize: '13px', color: '#fbbf24', marginBottom: '10px' }}>Select Budget Plan:</p>
              <select style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', marginBottom: '15px' }}>
                <option>100 Members - 0.2 TON</option>
                <option>200 Members - 0.4 TON</option>
                <option>300 Members - 0.5 TON</option>
              </select>

              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8' }}>Send Payment to TON Address:</p>
                <code style={{ fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all' }}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</code>
                <button onClick={() => copyToClipboard('UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9')} style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#334155', border: 'none', color: '#fff', borderRadius: '5px', fontSize: '10px' }}>Copy Address</button>
                
                <p style={{ margin: '15px 0 5px 0', fontSize: '12px', color: '#94a3b8' }}>Include this Required MEMO:</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{userUID}</span>
                  <button onClick={() => copyToClipboard(userUID)} style={{ padding: '5px 10px', backgroundColor: '#334155', border: 'none', color: '#fff', borderRadius: '5px', fontSize: '10px' }}>Copy Memo</button>
                </div>
              </div>
              <button onClick={() => alert("Order sent to Admin for verification!")} style={{ width: '100%', marginTop: '15px', padding: '14px', borderRadius: '12px', backgroundColor: '#fbbf24', color: '#000', fontWeight: 'bold', border: 'none' }}>I Have Paid</button>
            </div>
          )}
        </>
      )}

      {/* History View */}
      {activeNav === 'history' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px' }}>
          <h3>Transaction History</h3>
          {history.length > 0 ? history.map((h, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>{h.type} <br/><small style={{color:'#94a3b8'}}>{h.date}</small></span>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{h.amount} TON</span>
            </div>
          )) : <p style={{ color: '#94a3b8' }}>No history found.</p>}
        </div>
      )}

      {/* Invite View with 10% Info */}
      {activeNav === 'invite' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
          <h3>Invite Friends</h3>
          <p style={{ fontSize: '14px', color: '#fbbf24' }}>Get 10% commission from your friends' earnings!</p>
          <input readOnly value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#fff', border: 'none', textAlign: 'center', margin: '15px 0' }} />
          <button onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${userUID}`)} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#fbbf24', fontWeight: 'bold', border: 'none' }}>Copy Invite Link</button>
        </div>
      )}

      {/* Footer Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }}>
        <button onClick={() => setActiveNav('earn')} style={{ background: 'none', border: 'none', color: activeNav === 'earn' ? '#fbbf24' : '#fff', textAlign: 'center' }}>💰<br/><span style={{fontSize:'10px'}}>Earn</span></button>
        <button onClick={() => setActiveNav('invite')} style={{ background: 'none', border: 'none', color: activeNav === 'invite' ? '#fbbf24' : '#fff', textAlign: 'center' }}>👥<br/><span style={{fontSize:'10px'}}>Invite</span></button>
        <button onClick={() => setActiveNav('history')} style={{ background: 'none', border: 'none', color: activeNav === 'history' ? '#fbbf24' : '#fff', textAlign: 'center' }}>📜<br/><span style={{fontSize:'10px'}}>History</span></button>
      </div>
    </div>
  );
}

export default App;
