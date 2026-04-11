import React, { useState, useEffect } from 'react';

function App() {
  // Telegram ID ယူခြင်း
  const [userUID, setUserUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "Guest_" + Math.floor(Math.random() * 100000);
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? parseFloat(saved) : 0.0;
  });

  // URL ကနေ Inviter ID (စတင်ဖိတ်ခေါ်သူ) ကို ဖမ်းယူမယ်
  const [inviterID, setInviterID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tgWebAppStartParam'); 
  });

  // Task လုပ်ပြီးကြောင်း မှတ်သားထားမယ့် status
  const [hasDoneTask, setHasDoneTask] = useState(() => {
    return localStorage.getItem('user_done_task') === 'true';
  });

  const [inviteHistory, setInviteHistory] = useState(() => {
    const saved = localStorage.getItem('invite_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeNav, setActiveNav] = useState('earn');

  // --- Task တစ်ခုလုပ်တာနဲ့ Invite Success ပြမယ့် Logic ---
  const handleTaskComplete = (id, type) => {
    // ၁။ Task လုပ်တဲ့အတွက် Reward အရင်ပေါင်းပေးမယ်
    const taskReward = 0.0005;
    const newBalance = balance + taskReward;
    setBalance(newBalance);
    localStorage.setItem('ton_balance', newBalance.toString());

    // ၂။ ပထမဆုံး Task ဖြစ်ပြီး Inviter ရှိနေရင် Success ပြမယ်
    if (!hasDoneTask && inviterID) {
      const inviteReward = 0.0005;
      const successInvite = { 
        id: inviterID, 
        status: 'Success', 
        reward: inviteReward 
      };
      
      const updatedHistory = [successInvite, ...inviteHistory];
      setInviteHistory(updatedHistory);
      localStorage.setItem('invite_history', JSON.stringify(updatedHistory));
      
      // နောက်တစ်ခါ ထပ်မပေါင်းအောင် Task ပြီးကြောင်း မှတ်လိုက်မယ်
      setHasDoneTask(true);
      localStorage.setItem('user_done_task', 'true');
      
      alert("Referral Verified! Invite Success.");
    } else {
      alert("Task Completed!");
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Balance Card */}
      <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '25px', borderRadius: '20px', marginBottom: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your Balance</p>
        <h1 style={{ color: '#fbbf24', fontSize: '30px' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px' }}>
          <h4 style={{ marginTop: 0 }}>Available Tasks</h4>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Complete any 1 task to verify your invite!</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <span>Task #1: Social Join</span>
            <button 
              onClick={() => handleTaskComplete(1, 'social')}
              style={{ backgroundColor: '#fbbf24', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold' }}
            >
              Start
            </button>
          </div>
        </div>
      )}

      {activeNav === 'invite' && (
        <div>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
            <h3>Invite Link</h3>
            <input 
              style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', textAlign: 'center' }}
              value={`https://t.me/EasyTONFree_Bot?start=${userUID}`}
              readOnly
            />
          </div>

          <h4 style={{ marginTop: '20px' }}>Invite History (Success)</h4>
          <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px' }}>
            {inviteHistory.length > 0 ? inviteHistory.map((h, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', padding: '10px 0' }}>
                <span style={{ fontSize: '12px' }}>Referrer ID: {h.id}</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{h.status} (+{h.reward})</span>
              </div>
            )) : <p style={{ fontSize: '12px', color: '#94a3b8' }}>No success invites yet. (Must complete 1 task first)</p>}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '20px', backgroundColor: '#1e293b' }}>
        <span onClick={() => setActiveNav('earn')} style={{ color: activeNav === 'earn' ? '#fbbf24' : '#fff' }}>Earn</span>
        <span onClick={() => setActiveNav('invite')} style={{ color: activeNav === 'invite' ? '#fbbf24' : '#fff' }}>Invite</span>
      </div>
    </div>
  );
}

export default App;
