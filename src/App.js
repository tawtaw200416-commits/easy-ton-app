import React, { useState, useEffect } from 'react';

function App() {
  // --- 1. Core State & Data Persistence ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  const [rewardClaimed, setRewardClaimed] = useState(() => JSON.parse(localStorage.getItem('reward_claimed')) || false);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardInput, setRewardInput] = useState("");

  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
    localStorage.setItem('reward_claimed', JSON.stringify(rewardClaimed));
  }, [balance, completedTasks, withdrawHistory, rewardClaimed]);

  // --- 2. Functional Tasks Lists ---
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
  ].map((name, index) => ({ id: `s${index}`, name, link: `https://t.me/${name.replace('@','')}` }));

  // --- 3. Logic Functions ---
  const handleTaskClick = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const handleClaimReward = () => {
    if (rewardClaimed) return alert("Already claimed!");
    if (rewardInput.toUpperCase() === "YTTPO") {
      setBalance(prev => prev + 0.0005);
      setRewardClaimed(true);
      setRewardInput("");
      alert("Reward Claimed!");
    } else {
      alert("Invalid Code!");
    }
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px', fontFamily: 'sans-serif' },
    balanceCard: { background: '#1e293b', padding: '25px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', cursor: 'pointer' }),
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '15px' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', boxSizing: 'border-box', fontWeight: '900' },
    btnFull: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.balanceCard}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '36px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px' }}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false)}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false)}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false)}}>Reward</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.card} onClick={() => handleTaskClick(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '900' }}>{task.name}</span>
                    <span style={{ color: '#fbbf24', fontWeight: '900' }}>+0.0005 TON</span>
                  </div>
                </div>
              ))}

              {activeTab === 'social' && (
                <>
                  <button style={{ ...styles.btnFull, marginBottom: '20px' }} onClick={() => setShowPayForm(true)}>+ Add Your Task</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                    <div key={task.id} style={styles.card} onClick={() => handleTaskClick(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '900' }}>{task.name}</span>
                        <span style={{ color: '#38bdf8', fontWeight: '900' }}>Join Channel</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'reward' && (
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontWeight: '900' }}>Enter Reward Code</h4>
                  <input 
                    style={styles.input} 
                    type="text" 
                    placeholder="ENTER CODE" 
                    value={rewardInput} 
                    onChange={(e) => setRewardInput(e.target.value)} 
                  />
                  <button style={styles.btnFull} onClick={handleClaimReward}>Claim Now</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h4 style={{ textAlign: 'center', fontWeight: '900' }}>Order Placement</h4>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Task Link" />
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0f172a', borderRadius: '10px', border: '1px solid #fbbf24' }}>100/0.2T</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0f172a', borderRadius: '10px', border: '1px solid #fbbf24' }}>200/0.4T</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0f172a', borderRadius: '10px', border: '1px solid #fbbf24' }}>300/0.5T</div>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Admin Address:</p>
              <code style={{ fontSize: '10px', color: '#fbbf24', wordBreak: 'break-all' }}>{adminAddress}</code>
              <p style={{ fontWeight: '900', margin: '10px 0' }}>MEMO (UID): {userUID}</p>
              <button style={styles.btnFull} onClick={() => {alert("Sent to Admin!"); setShowPayForm(false)}}>Confirm Payment</button>
              <button style={{ background: 'none', border: 'none', color: '#94a3b8', width: '100%', marginTop: '10px' }} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: '900' }}>Invite History</h3>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Get 0.0005 TON per successful invite.</p>
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center', fontWeight: '900', color: '#fbbf24' }}>
            No Referrals Yet
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ fontWeight: '900' }}>Withdraw History</h3>
          <div style={{ marginBottom: '20px' }}>
            <input style={styles.input} placeholder="Amount (Min 0.1)" />
            <input style={styles.input} placeholder="Wallet Address" />
            <button style={styles.btnFull}>Withdraw Now</button>
          </div>
          <h4 style={{ borderTop: '1px solid #334155', paddingTop: '10px' }}>Logs</h4>
          {withdrawHistory.length === 0 && <p style={{ color: '#64748b', fontSize: '12px' }}>No transactions found.</p>}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: '900' }}>Profile</h3>
          <p style={{ fontWeight: '900' }}>UID: <span style={{ color: '#fbbf24' }}>{userUID}</span></p>
          <div style={{ marginTop: '20px', background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px', border: '1px solid #ef4444' }}>
            <h4 style={{ color: '#ef4444', margin: 0 }}>Policy</h4>
            <p style={{ fontSize: '12px' }}>Fake accounts will be banned permanently.</p>
          </div>
        </div>
      )}

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
