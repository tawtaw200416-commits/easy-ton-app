import React, { useState, useEffect } from 'react';

function App() {
  // --- 1. Core State & Persistence ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardInput, setRewardInput] = useState("");

  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
  }, [balance, completedTasks, withdrawHistory]);

  // --- 2. Functional Bot Tasks (New List) ---
  const botTasks = [
    { id: 'b1', name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  // --- 3. Logic Functions ---
  const handleTaskAction = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
      alert("Task Completed! +0.0005 TON");
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(label + " Copied!");
  };

  // --- 4. Styles (Premium Look) ---
  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: '"Segoe UI", Roboto, sans-serif' },
    balanceCard: { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '30px 20px', borderRadius: '30px', textAlign: 'center', marginBottom: '25px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '18px', padding: '6px', marginBottom: '25px', gap: '5px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: '0.3s' }),
    taskCard: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '22px', border: '1px solid #334155', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', active: { transform: 'scale(0.98)' } },
    inputField: { width: '100%', padding: '16px', borderRadius: '15px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '15px', boxSizing: 'border-box', fontWeight: '600' },
    copyBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '15px', border: '1px dashed #fbbf24', marginBottom: '15px', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155', borderTopLeftRadius: '25px', borderTopRightRadius: '25px' },
    navIcon: (active) => ({ textAlign: 'center', flex: 1, color: active ? '#fbbf24' : '#64748b', transition: '0.3s' })
  };

  return (
    <div style={styles.container}>
      {/* Top Section */}
      <div style={styles.balanceCard}>
        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL BALANCE</span>
        <h1 style={{ color: '#fbbf24', fontSize: '42px', margin: '8px 0', fontWeight: '900' }}>{balance.toFixed(4)} <span style={{fontSize: '18px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            {['bot', 'social', 'reward'].map((t) => (
              <button key={t} style={styles.tabBtn(activeTab === t)} onClick={() => {setActiveTab(t); setShowPayForm(false);}}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {!showPayForm ? (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.taskCard} onClick={() => handleTaskAction(task)}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{task.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Tap to launch bot</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '8px 12px', borderRadius: '12px', fontWeight: '900', fontSize: '12px' }}>
                    +0.0005
                  </div>
                </div>
              ))}

              {activeTab === 'reward' && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <h3 style={{fontWeight: '800', marginBottom: '20px'}}>Redeem Bonus Code</h3>
                  <input style={styles.inputField} placeholder="Enter your code here..." value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                  <button style={{ ...styles.tabBtn(true), width: '100%', padding: '18px' }}>CLAIM NOW</button>
                </div>
              )}
              
              {/* No more tasks message */}
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).length === 0 && (
                <p style={{textAlign:'center', color:'#64748b', marginTop: '50px'}}>All bots are started! Check back later.</p>
              )}
            </div>
          ) : (
            /* Add Task Section with Memo/Address Copy */
            <div style={{ ...styles.card, padding: '20px', borderRadius: '25px', backgroundColor: '#1e293b' }}>
              <h3 style={{ textAlign: 'center', fontWeight: '900', marginBottom: '20px' }}>ORDER PLACEMENT</h3>
              <input style={styles.inputField} placeholder="Channel Name" />
              <input style={styles.inputField} placeholder="Link (https://t.me/...)" />
              
              <div style={{marginBottom: '10px', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold'}}>PAYMENT DETAILS (TAP TO COPY)</div>
              
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress, "Address")}>
                <div style={{fontSize: '10px', color: '#94a3b8', marginBottom: '5px'}}>TON ADDRESS</div>
                <div style={{fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all', fontWeight: 'bold'}}>{adminAddress}</div>
              </div>

              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID, "Memo")}>
                <div style={{fontSize: '10px', color: '#94a3b8', marginBottom: '5px'}}>MEMO / UID</div>
                <div style={{fontSize: '18px', color: '#fbbf24', fontWeight: '900'}}>{userUID}</div>
              </div>

              <button style={{ ...styles.tabBtn(true), width: '100%', height: '55px', marginTop: '10px' }} onClick={() => setShowPayForm(false)}>BACK TO TASKS</button>
            </div>
          )}
        </>
      )}

      {/* Other Tabs Placeholder */}
      {activeNav === 'invite' && <div style={{textAlign:'center', marginTop: '50px', fontWeight: 'bold'}}>Invite History (Coming Soon)</div>}
      {activeNav === 'withdraw' && <div style={{textAlign:'center', marginTop: '50px', fontWeight: 'bold'}}>Withdraw History (Coming Soon)</div>}
      {activeNav === 'profile' && <div style={{textAlign:'center', marginTop: '50px', fontWeight: 'bold'}}>User Profile Settings</div>}

      {/* Navigation Footer */}
      <div style={styles.footer}>
        <div style={styles.navIcon(activeNav === 'earn')} onClick={() => setActiveNav('earn')}>
          <div style={{ fontSize: '24px' }}>💰</div><div style={{ marginTop: '4px' }}>EARN</div>
        </div>
        <div style={styles.navIcon(activeNav === 'invite')} onClick={() => setActiveNav('invite')}>
          <div style={{ fontSize: '24px' }}>👥</div><div style={{ marginTop: '4px' }}>INVITE</div>
        </div>
        <div style={styles.navIcon(activeNav === 'withdraw')} onClick={() => setActiveNav('withdraw')}>
          <div style={{ fontSize: '24px' }}>💸</div><div style={{ marginTop: '4px' }}>HISTORY</div>
        </div>
        <div style={styles.navIcon(activeNav === 'profile')} onClick={() => setActiveNav('profile')}>
          <div style={{ fontSize: '24px' }}>👤</div><div style={{ marginTop: '4px' }}>PROFILE</div>
        </div>
      </div>
    </div>
  );
}

export default App;
