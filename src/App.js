import React, { useState, useEffect } from 'react';

function App() {
  // ၁။ Telegram User ID ကို ဆွဲထုတ်မယ် (Link ကွဲအောင်လုပ်ခြင်း)
  const [userUID, setUserUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "Guest_" + Math.floor(Math.random() * 100000);
  });

  // ၂။ Balance ကို 0.0000 ကနေ စတင်ခြင်း
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? parseFloat(saved) : 0.0;
  });

  // ၃။ Inviter ID ကို URL ကနေ ဖမ်းယူမယ်
  const [inviterID, setInviterID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tgWebAppStartParam'); 
  });

  // ၄။ Invite History နဲ့ Task Status
  const [hasDoneTask, setHasDoneTask] = useState(() => {
    return localStorage.getItem('user_done_task') === 'true';
  });

  const [inviteHistory, setInviteHistory] = useState(() => {
    const saved = localStorage.getItem('invite_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeNav, setActiveNav] = useState('earn');

  // --- Task တစ်ခုလုပ်တာနဲ့ Invite Success ဖြစ်စေမယ့် Logic ---
  const handleTaskComplete = () => {
    // Task Reward ပေါင်းမယ်
    const taskReward = 0.0005;
    const newBalance = balance + taskReward;
    setBalance(newBalance);
    localStorage.setItem('ton_balance', newBalance.toString());

    // ပထမဆုံးအကြိမ် Task ဖြစ်ပြီး Inviter ရှိရင် Invite Success ပြမယ်
    if (inviterID && !hasDoneTask) {
      const successInvite = { 
        id: inviterID, 
        status: 'Success', 
        reward: 0.0005,
        date: new Date().toLocaleDateString()
      };
      
      const updatedHistory = [successInvite, ...inviteHistory];
      setInviteHistory(updatedHistory);
      localStorage.setItem('invite_history', JSON.stringify(updatedHistory));
      
      setHasDoneTask(true);
      localStorage.setItem('user_done_task', 'true');
      alert("Verification Success! Invite reward verified.");
    } else {
      alert("Task Completed! Reward added to balance.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '100px' }}>
      
      {/* Balance Display */}
      <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '30px', borderRadius: '25px', marginBottom: '20px', border: '1px solid #334155' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 10px 0' }}>Your Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', fontWeight: '900', margin: 0 }}>{balance.toFixed(4)} TON</h1>
      </div>

      {/* Earn Section */}
      {activeNav === 'earn' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155' }}>
          <h3 style={{ marginTop: 0 }}>Available Tasks</h3>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Complete any 1 task to verify your invite!</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '14px' }}>Task #1: Social Join</span>
            <button 
              onClick={handleTaskComplete}
              style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '10px 25px', borderRadius: '12px', fontWeight: 'bold' }}
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* Invite Section */}
      {activeNav === 'invite' && (
        <div>
          <div style={{ backgroundColor: '#1e293b', padding: '25px', borderRadius: '20px', textAlign: 'center', border: '1px solid #334155' }}>
            <h3 style={{ fontWeight: '900' }}>Invite Friends</h3>
            <p style={{ fontSize: '11px', color: '#fbbf24' }}>Your ID: {userUID}</p>
            <input 
              style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '10px', textAlign: 'center', marginTop: '10px' }}
              value={`https://t.me/EasyTONFree_Bot?start=${userUID}`}
              readOnly
            />
            <button 
              onClick={() => copyToClipboard(`https://t.me/EasyTONFree_Bot?start=${userUID}`)}
              style={{ width: '100%', marginTop: '15px', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#fbbf24', fontWeight: 'bold' }}
            >
              Copy Invite Link
            </button>
          </div>

          <h4 style={{ marginTop: '25px' }}>Invite History (Success)</h4>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155' }}>
            {inviteHistory.length > 0 ? inviteHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i !== inviteHistory.length - 1 ? '1px solid #334155' : 'none' }}>
                <span style={{ fontSize: '13px' }}>From: {h.id}</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{h.status} (+{h.reward})</span>
              </div>
            )) : <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>No successful invites yet.</p>}
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '20px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }}>
        <div onClick={() => setActiveNav('earn')} style={{ color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>💰 Earn</div>
        <div onClick={() => setActiveNav('invite')} style={{ color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>👥 Invite</div>
      </div>
    </div>
  );
}

export default App;
