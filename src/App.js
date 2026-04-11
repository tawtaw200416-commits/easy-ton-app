import React, { useState } from 'react';

function App() {
  // ၁။ Telegram Data & Balance
  const [userUID, setUserUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "Guest_" + Math.floor(Math.random() * 100000);
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('ton_balance');
    return saved ? parseFloat(saved) : 0.0000;
  });

  const [inviterID, setInviterID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tgWebAppStartParam'); 
  });

  const [hasDoneTask, setHasDoneTask] = useState(localStorage.getItem('user_done_task') === 'true');
  const [inviteHistory, setInviteHistory] = useState(() => {
    const saved = localStorage.getItem('invite_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Tab & Navigation State
  const [activeTab, setActiveTab] = useState('bot'); // Start Bot, Social, Reward
  const [activeNav, setActiveNav] = useState('earn'); // Earn, Invite, Withdraw, Profile
  const [redeemCode, setRedeemCode] = useState('');

  // ၂။ Task စာရင်းများ
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

  // ၃။ Logic Functions
  const handleAction = (rewardValue = 0.0005) => {
    const newBalance = balance + rewardValue;
    setBalance(newBalance);
    localStorage.setItem('ton_balance', newBalance.toString());

    if (inviterID && !hasDoneTask) {
      const updatedHistory = [{ id: inviterID, status: 'Success', reward: 0.0005 }, ...inviteHistory];
      setInviteHistory(updatedHistory);
      localStorage.setItem('invite_history', JSON.stringify(updatedHistory));
      setHasDoneTask(true);
      localStorage.setItem('user_done_task', 'true');
    }
  };

  const handleRedeem = () => {
    if (redeemCode === 'YTTPO') {
      handleAction(0.0005);
      setRedeemCode('');
      alert("Code Redeemed Successfully!");
    } else {
      alert("Invalid Code!");
    }
  };

  return (
    <div style={{ backgroundColor: '#111827', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      
      {/* Header Balance */}
      <div style={{ backgroundColor: '#1f2937', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '15px' }}>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Your Balance</p>
        <h1 style={{ color: '#facc15', fontSize: '32px', margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          {/* Sub-Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#1f2937', borderRadius: '12px', padding: '5px', marginBottom: '15px' }}>
            {['bot', 'social', 'reward'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === tab ? '#facc15' : 'transparent', color: activeTab === tab ? '#000' : '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {tab === 'bot' ? 'Start Bot' : tab}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '20px' }}>
            {/* Start Bot List */}
            {activeTab === 'bot' && botTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span>{task.name}</span>
                <button onClick={() => { window.open(task.link, '_blank'); handleAction(); }} style={{ backgroundColor: '#facc15', border: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: 'bold' }}>Start</button>
              </div>
            ))}

            {/* Social List */}
            {activeTab === 'social' && socialTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span>{task.name}</span>
                <button onClick={() => handleAction()} style={{ backgroundColor: '#60a5fa', border: 'none', padding: '8px 20px', borderRadius: '10px', color: '#fff' }}>Join</button>
              </div>
            ))}

            {/* Reward Code Section */}
            {activeTab === 'reward' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '15px' }}>Redeem Reward Code</h3>
                <input style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #374151', backgroundColor: '#111827', color: '#fff', textAlign: 'center', marginBottom: '15px' }} placeholder="ENTER CODE (YTTPO)" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} />
                <button onClick={handleRedeem} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#facc15', fontWeight: 'bold' }}>Claim Now</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1f2937', borderTop: '1px solid #374151' }}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#facc15' : '#9ca3af' }}>💰<br/><span style={{fontSize: '10px'}}>Earn</span></div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#facc15' : '#9ca3af' }}>👥<br/><span style={{fontSize: '10px'}}>Invite</span></div>
        <div onClick={() => setActiveNav('withdraw')} style={{ textAlign: 'center', color: activeNav === 'withdraw' ? '#facc15' : '#9ca3af' }}>💸<br/><span style={{fontSize: '10px'}}>Withdraw</span></div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#facc15' : '#9ca3af' }}>👤<br/><span style={{fontSize: '10px'}}>Profile</span></div>
      </div>
    </div>
  );
}

export default App;
