import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeCategory, setActiveCategory] = useState('main');
  const [claimCode, setClaimCode] = useState('');

  // Main Tasks Data
  const [mainTasks, setMainTasks] = useState([
    { id: 1, name: 'GrowTea Bot', link: 'https://t.me/GrowTeaBot/app?startapp=1793453606' },
    { id: 2, name: 'Golden Miner', link: 'https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD' },
    { id: 3, name: 'Workers On Ton', link: 'https://t.me/WorkersOnTonBot/app?startapp=r_1793453606' },
    { id: 4, name: 'Easy Bonus Code', link: 'https://t.me/easybonuscode_bot?start=1793453606' },
    { id: 5, name: 'Ton Dragon', link: 'https://t.me/TonDragonBot/myapp?startapp=1793453606' },
    { id: 6, name: 'Pobuzz Bot', link: 'https://t.me/Pobuzzbot/app?startapp=1793453606' }
  ]);

  // Social Tasks Data
  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", "@zrbtua", "@perviu1million"
  ];

  const handleMainTask = (id, link) => {
    window.open(link, '_blank');
    setBalance(prev => prev + 0.0005);
    setMainTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleSocialJoin = (channel) => {
    window.open(`https://t.me/${channel.replace('@', '')}`, '_blank');
    setBalance(prev => prev + 0.0005);
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', paddingBottom: '80px' },
    header: { display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px', borderRadius: '20px', border: '1px solid #334155', gap: '15px' },
    balance: { color: '#fbbf24', fontSize: '20px', fontWeight: 'bold' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '12px', padding: '5px', margin: '20px 0' },
    tabBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#0f172a' : '#94a3b8', fontWeight: 'bold' }),
    taskCard: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' },
    startBtn: { backgroundColor: '#fbbf24', color: '#0f172a', padding: '8px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-around', padding: '12px', borderTop: '1px solid #334155' },
    footerItem: { textAlign: 'center', fontSize: '12px', color: '#94a3b8' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#fbbf24'}}></div>
        <div>
          <div style={{fontSize: '14px'}}>Easy TON User</div>
          <div style={styles.balance}>{balance.toFixed(4)} TON</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button style={styles.tabBtn(activeTab === 'tasks')} onClick={() => setActiveTab('tasks')}>Tasks</button>
        <button style={styles.tabBtn(activeTab === 'social')} onClick={() => setActiveTab('social')}>Social</button>
        <button style={styles.tabBtn(activeTab === 'rewards')} onClick={() => setActiveTab('rewards')}>Reward</button>
      </div>

      {/* Content */}
      <div style={{marginTop: '10px'}}>
        {activeTab === 'tasks' && (
          <div>
            <h4 style={{marginBottom: '15px', color: '#94a3b8'}}>Main Tasks</h4>
            {mainTasks.length > 0 ? mainTasks.map(task => (
              <div key={task.id} style={styles.taskCard}>
                <span>{task.name}</span>
                <button style={styles.startBtn} onClick={() => handleMainTask(task.id, task.link)}>Start</button>
              </div>
            )) : <p style={{textAlign: 'center', color: '#64748b'}}>All tasks completed!</p>}
          </div>
        )}

        {activeTab === 'social' && (
          <div>
            <h4 style={{marginBottom: '15px', color: '#94a3b8'}}>Social Channels</h4>
            {socialTasks.map((channel, index) => (
              <div key={index} style={styles.taskCard}>
                <span style={{fontSize: '14px'}}>{channel}</span>
                <button style={{...styles.startBtn, backgroundColor: '#38bdf8'}} onClick={() => handleSocialJoin(channel)}>Join</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div style={{textAlign: 'center', padding: '20px', backgroundColor: '#1e293b', borderRadius: '20px'}}>
            <h3 style={{color: '#fbbf24'}}>Code Reward</h3>
            <input 
              style={{width: '90%', padding: '12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', textAlign: 'center'}}
              placeholder="Enter Code (YTTPO)"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
            />
            <button style={{...styles.startBtn, width: '100%', padding: '12px'}} onClick={() => {
              if(claimCode === 'YTTPO') { setBalance(prev => prev + 0.0005); alert('Reward Claimed!'); setClaimCode(''); }
              else { alert('Wrong Code!'); }
            }}>Claim</button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.footer}>
        <div style={{...styles.footerItem, color: '#fbbf24'}}>💰<br/>Earn</div>
        <div style={styles.footerItem}>👥<br/>Invite</div>
        <div style={styles.footerItem}>💸<br/>Withdraw</div>
        <div style={styles.footerItem}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
