import React, { useState, useEffect } from 'react';

function App() {
  // ၁။ Telegram User ID & Balance
  const [userUID, setUserUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "Guest_" + Math.floor(Math.random() * 100000);
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? parseFloat(saved) : 0.0;
  });

  // ၂။ Invite Logic (URL ကနေ ID ဖမ်းမယ်)
  const [inviterID, setInviterID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tgWebAppStartParam'); 
  });

  const [hasDoneTask, setHasDoneTask] = useState(() => {
    return localStorage.getItem('user_done_task') === 'true';
  });

  const [inviteHistory, setInviteHistory] = useState(() => {
    const saved = localStorage.getItem('invite_history');
    return saved ? JSON.parse(saved) : [];
  });

  // ၃။ Tasks စာရင်း (ဒီမှာ အစ်ကို့ task တွေ အကုန်ပြန်ထည့်ပေးထားပါတယ်)
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
    { id: 105, name: "@easytonfree" }, { id: 106, name: "@WORLDBESTCRYTO" }
  ]);

  const [activeTab, setActiveTab] = useState('bot');
  const [activeNav, setActiveNav] = useState('earn');

  // ၄။ Task လုပ်ရင် Balance တက်ပြီး Invite Success ဖြစ်မယ့် Logic
  const handleTaskComplete = (id, type) => {
    const reward = 0.0005;
    const newBalance = balance + reward;
    setBalance(newBalance);
    localStorage.setItem('ton_balance', newBalance.toString());

    // Invite Success Logic
    if (inviterID && !hasDoneTask) {
      const newInvite = { id: inviterID, status: 'Success', reward: reward };
      const updatedHistory = [newInvite, ...inviteHistory];
      setInviteHistory(updatedHistory);
      localStorage.setItem('invite_history', JSON.stringify(updatedHistory));
      setHasDoneTask(true);
      localStorage.setItem('user_done_task', 'true');
    }

    // Task list ထဲက ဖယ်မယ်
    if (type === 'bot') setBotTasks(prev => prev.filter(t => t.id !== id));
    else setSocialTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '100px' }}>
      
      {/* Balance Card */}
      <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 5px 0' }}>Your Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '32px', fontWeight: '900', margin: 0 }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0 }}>Available Tasks</h3>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '15px' }}>Complete any 1 task to verify your invite!</p>
          
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('bot')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'bot' ? '#fbbf24' : '#0f172a', color: activeTab === 'bot' ? '#000' : '#fff', fontWeight: 'bold' }}>Bot</button>
            <button onClick={() => setActiveTab('social')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'social' ? '#fbbf24' : '#0f172a', color: activeTab === 'social' ? '#000' : '#fff', fontWeight: 'bold' }}>Social</button>
          </div>

          {/* Task List */}
          {(activeTab === 'bot' ? botTasks : socialTasks).map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '13px' }}>{task.name}</span>
              <button 
                onClick={() => { if(task.link) window.open(task.link, '_blank'); handleTaskComplete(task.id, activeTab); }}
                style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold' }}
              >
                Start
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invite Tab */}
      {activeNav === 'invite' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
          <h3>Invite Friends</h3>
          <input style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center' }} value={`https://t.me/EasyTONFree_Bot?start=${userUID}`} readOnly />
          <button onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${userUID}`); alert("Link Copied!"); }} style={{ width: '100%', marginTop: '10px', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#fbbf24', fontWeight: 'bold' }}>Copy Link</button>
          <h4 style={{ marginTop: '20px' }}>Invite History (Success)</h4>
          {inviteHistory.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155' }}>
              <span style={{ fontSize: '12px' }}>ID: {h.id}</span>
              <span style={{ color: '#4ade80' }}>{h.status}
