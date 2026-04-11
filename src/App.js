import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('main'); 
  const [balance, setBalance] = useState(0.0010);
  const [code, setCode] = useState('');
  const tonIcon = "https://i.imgur.com/8QO5Kz8.png";

  const claim = () => {
    if (code.toUpperCase() === 'YTTPO') {
      setBalance(b => b + 0.0005); alert("0.0005 TON Added!"); setCode('');
    } else alert("Invalid Code!");
  };

  const tasks = [
    { name: "بوت ربح سریع", reward: "0.0010" },
    { name: "Join channel", reward: "0.0010" },
    { name: "Wool Rush", reward: "0.0010" }
  ];

  return (
    <div style={{ backgroundColor: '#0b101b', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a2233' }}>
        <b style={{ color: '#f3ba2f' }}>Easy TON Free</b>
        <div style={{ background: '#131926', padding: '5px 12px', borderRadius: '50px', border: '1px solid #2d364a' }}>{balance.toFixed(4)} TON</div>
      </div>
      <div style={{ display: 'flex', background: '#131926', borderRadius: '15px', padding: '5px', margin: '20px 15px', gap: '5px' }}>
        {['main', 'reward', 'social'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px 0', borderRadius: '12px', border: 'none', background: activeTab === t ? '#f3ba2f' : 'transparent', color: activeTab === t ? '#000' : '#888', fontWeight: 'bold', fontSize: '11px' }}>{t.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ padding: '0 15px' }}>
        {(activeTab === 'main' || activeTab === 'social') && (
          <div style={{ background: '#131926', padding: '20px', borderRadius: '25px' }}>
            {tasks.map((task, i) => (
              <div key={i} style={{ background: '#1c2436', padding: '12px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <img src={tonIcon} alt="ton" style={{ width: '30px' }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: 'bold' }}>{task.name}</div><div style={{ fontSize: '10px', color: '#f3ba2f' }}>+{task.reward} TON</div></div>
                <button style={{ background: '#f3ba2f', border: 'none', width: '30px', height: '30px', borderRadius: '50%' }}>→</button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'reward' && (
          <div style={{ background: '#131926', padding: '30px 20px', borderRadius: '25px', textAlign: 'center' }}>
            <input type="text" placeholder="ENTER CODE" value={code} onChange={e => setCode(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #333', background: '#0b101b', color: '#fff', textAlign: 'center', marginBottom: '15px' }} />
            <button onClick={claim} style={{ width: '100%', background: '#f3ba2f', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>CLAIM NOW</button>
          </div>
        )}
      </div>
    </div>
  );
}
