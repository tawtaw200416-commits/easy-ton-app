import React, { useState, useEffect } from 'react';

function App() {
  // --- 1. Core States ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [inviteHistory] = useState([
    { id: 1, name: "User_7721", status: "Success", reward: "0.0005" },
    { id: 2, name: "User_9012", status: "Success", reward: "0.0005" }
  ]);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);

  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // --- 2. Fixed Bot Tasks List ---
  const botTasks = [
    { id: 'b1', name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  // --- 3. Logic Functions ---
  const handleTaskClick = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // --- 4. Styles ---
  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', padding: '25px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px', gap: '5px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '12px' },
    copyBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
    historyItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', fontSize: '13px' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance */}
      <div style={styles.balanceCard}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false)}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false)}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false)}}>Reward</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.card} onClick={() => handleTaskClick(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{task.name}</span>
                    <span style={{ color: '#fbbf24', fontSize: '12px' }}>+0.0005 TON</span>
                  </div>
                </div>
              ))}
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).length === 0 && (
                <p style={{textAlign:'center', color:'#64748b'}}>No missions available.</p>
              )}
              {activeTab === 'social' && <button style={{...styles.tabBtn(true), width:'100%'}} onClick={() => setShowPayForm(true)}>+ Add Task</button>}
            </div>
          ) : (
            <div style={styles.card}>
              <h4 style={{ textAlign: 'center', color: '#fbbf24' }}>PAYMENT INFO</h4>
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress)}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>TON ADDRESS (Tap to Copy)</div>
                <div style={{ fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all' }}>{adminAddress}</div>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>MEMO / UID (Tap to Copy)</div>
                <div style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 'bold' }}>{userUID}</div>
              </div>
              <button style={{ ...styles.tabBtn(false), width: '100%', color: '#fff' }} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>Invite Friends</h3>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#fbbf24', marginBottom: '20px' }}>
            Earn 10% bonus from your friend's task completions!
          </p>
          
          <div style={styles.copyBox} onClick={() => copyToClipboard(`https://t.me/EasyTON_Bot?start=${userUID}`)}>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>YOUR REFERRAL LINK</div>
            <div style={{ fontSize: '12px' }}>https://t.me/EasyTON_Bot?start={userUID}</div>
          </div>

          <h4 style={{ marginTop: '25px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>Invite History</h4>
          {inviteHistory.map(item => (
            <div key={item.id} style={styles.historyItem}>
              <span>{item.name}</span>
              <span style={{ color: '#10b981' }}>{item.status} (+{item.reward} TON)</span>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center' }}>Withdraw History</h3>
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>No withdrawal records found.</p>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center' }}>Profile</h3>
          <div style={{ padding: '10px 0' }}>User UID: <b>{userUID}</b></div>
          <div style={{ padding: '10px 0' }}>Status: <b style={{ color: '#10b981' }}>Verified Account</b></div>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        <div style={{ color: activeNav === 'earn' ? '#fbbf24' : '#64748b', textAlign: 'center' }} onClick={() => setActiveNav('earn')}>💰<br/><small>Earn</small></div>
        <div style={{ color: activeNav === 'invite' ? '#fbbf24' : '#64748b', textAlign: 'center' }} onClick={() => setActiveNav('invite')}>👥<br/><small>Invite</small></div>
        <div style={{ color: activeNav === 'withdraw' ? '#fbbf24' : '#64748b', textAlign: 'center' }} onClick={() => setActiveNav('withdraw')}>💸<br/><small>History</small></div>
        <div style={{ color: activeNav === 'profile' ? '#fbbf24' : '#64748b', textAlign: 'center' }} onClick={() => setActiveNav('profile')}>👤<br/><small>Profile</small></div>
      </div>
    </div>
  );
}

export default App;
