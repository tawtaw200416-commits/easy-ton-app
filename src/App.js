import React, { useState, useEffect } from 'react';

function App() {
  // --- 1. State Management & Data Persistence ---
  const [userUID] = useState(() => {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user?.id?.toString() || "1793453606";
  });

  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot'); // Default tab
  const [showPayForm, setShowPayForm] = useState(false);

  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // --- 2. Task Lists ---
  const botTasks = [
    { id: 'b1', name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((name, index) => ({ id: `s${index}`, name }));

  // --- 3. Functional Logic ---
  const completeTask = (id) => {
    if (!completedTasks.includes(id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, id]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  // --- 4. Styles ---
  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'Arial, sans-serif' },
    balanceCard: { background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '25px', borderRadius: '24px', textAlign: 'center', marginBottom: '20px', border: '1px solid #475569', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' },
    tabContainer: { display: 'flex', backgroundColor: '#1e293b', padding: '5px', borderRadius: '15px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }),
    taskCard: { backgroundColor: '#1e293b', padding: '15px', borderRadius: '18px', marginBottom: '12px', border: '1px solid #334155' },
    btnJoin: { backgroundColor: '#38bdf8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' },
    btnCheck: { backgroundColor: '#fbbf24', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', boxSizing: 'border-box' },
    priceOption: { flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#334155', borderRadius: '12px', border: '1px solid #fbbf24', fontSize: '12px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
    footerItem: (active) => ({ textAlign: 'center', fontSize: '10px', color: active ? '#fbbf24' : '#64748b', fontWeight: 'bold' })
  };

  return (
    <div style={styles.container}>
      {/* Balance Display */}
      <div style={styles.balanceCard}>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, letterSpacing: '1px' }}>AVAILABLE BALANCE</p>
        <h1 style={{ fontSize: '36px', margin: '10px 0', color: '#fbbf24' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabContainer}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false);}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false);}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false);}}>Reward</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.taskCard}>
                  <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>{task.name}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ ...styles.btnJoin, flex: 1 }} onClick={() => window.open(task.link, '_blank')}>1. Start Bot</button>
                    <button style={{ ...styles.btnCheck, flex: 1 }} onClick={() => completeTask(task.id)}>2. Check Start</button>
                  </div>
                </div>
              ))}

              {activeTab === 'social' && (
                <>
                  <button 
                    style={{ width: '100%', padding: '15px', borderRadius: '15px', backgroundColor: '#fbbf24', border: 'none', fontWeight: 'bold', marginBottom: '15px' }}
                    onClick={() => setShowPayForm(true)}
                  >
                    + Add Your Task
                  </button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                    <div key={task.id} style={styles.taskCard}>
                      <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>{task.name}</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ ...styles.btnJoin, flex: 1 }} onClick={() => window.open(`https://t.me/${task.name.replace('@','')}`, '_blank')}>1. Join Link</button>
                        <button style={{ ...styles.btnCheck, flex: 1 }} onClick={() => completeTask(task.id)}>2. Check Join</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            /* Add Task Payment Form */
            <div style={{ ...styles.taskCard, animation: 'fadeIn 0.5s' }}>
              <h3 style={{ textAlign: 'center', color: '#fbbf24' }}>Add New Task</h3>
              <input style={styles.input} placeholder="Channel or Bot Name" />
              <input style={styles.input} placeholder="Link (https://t.me/...)" />
              
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Select Members Count:</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={styles.priceOption}><b>100</b><br/>0.2 TON</div>
                <div style={styles.priceOption}><b>200</b><br/>0.4 TON</div>
                <div style={styles.priceOption}><b>300</b><br/>0.5 TON</div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '15px' }}>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 5px 0' }}>ADMIN TON ADDRESS:</p>
                <code style={{ fontSize: '11px', wordBreak: 'break-all', color: '#38bdf8' }} onClick={() => copyToClipboard(adminAddress)}>{adminAddress}</code>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '15px 0 5px 0' }}>MEMO (YOUR UID):</p>
                <h4 style={{ margin: 0, color: '#fbbf24' }}>{userUID}</h4>
              </div>

              <button 
                style={{ ...styles.btnCheck, width: '100%', padding: '15px' }} 
                onClick={() => alert("Order submitted to Admin!")}
              >
                Confirm Payment
              </button>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', width: '100%', marginTop: '10px' }} onClick={() => setShowPayForm(false)}>Cancel</button>
            </div>
          )}
        </>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div style={styles.footerItem(activeNav === 'earn')} onClick={() => setActiveNav('earn')}>💰<br/>EARN</div>
        <div style={styles.footerItem(activeNav === 'invite')} onClick={() => setActiveNav('invite')}>👥<br/>INVITE</div>
        <div style={styles.footerItem(activeNav === 'withdraw')} onClick={() => setActiveNav('withdraw')}>💸<br/>WITHDRAW</div>
        <div style={styles.footerItem(activeNav === 'profile')} onClick={() => setActiveNav('profile')}>👤<br/>PROFILE</div>
      </div>
    </div>
  );
}

export default App;
