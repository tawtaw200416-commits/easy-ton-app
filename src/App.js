import React, { useState, useEffect } from 'react';

function App() {
  // Persistence Data
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [rewardClaimed, setRewardClaimed] = useState(() => JSON.parse(localStorage.getItem('reward_claimed')) || false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('user_history')) || []);
  
  // UI States
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardInput, setRewardInput] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(100);

  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('reward_claimed', JSON.stringify(rewardClaimed));
    localStorage.setItem('user_history', JSON.stringify(history));
  }, [balance, completedTasks, rewardClaimed, history]);

  const botMissions = [
    { id: "b1", name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: "b2", name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: "b3", name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: "b4", name: "EasyBonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: "b5", name: "TonDragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: "b6", name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialChannels = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460", 
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO", 
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69", 
    "@zrbtua", "@perviu1million"
  ].map((name, index) => ({ id: `s${index}`, name, link: `https://t.me/${name.replace('@', '')}` }));

  const handleCompleteTask = (task) => {
    if (!completedTasks.includes(task.id)) {
      setCompletedTasks([...completedTasks, task.id]);
      setBalance(prev => prev + 0.0005);
      setHistory([{ type: 'Task Reward', amount: 0.0005, date: new Date().toLocaleString(), name: task.name }, ...history]);
      alert(`${task.name} Completed! 0.0005 TON added.`);
    }
  };

  const handleClaimReward = () => {
    if (rewardClaimed) return alert("Already Claimed!");
    if (rewardInput.toUpperCase() === "YTTPO") {
      setBalance(prev => prev + 0.0005);
      setRewardClaimed(true);
      setHistory([{ type: 'Promo Reward', amount: 0.0005, date: new Date().toLocaleString(), name: 'YTTPO Code' }, ...history]);
      setRewardInput("");
      alert("0.0005 TON Claimed!");
    } else {
      alert("Incorrect Code!");
    }
  };

  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'Arial, sans-serif', paddingBottom: '90px' },
    balanceCard: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '30px 15px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    balanceText: { fontSize: '40px', fontWeight: '900', color: '#eab308', margin: '10px 0' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '14px', padding: '4px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '11px', border: 'none', backgroundColor: active ? '#eab308' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }),
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155' },
    taskItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #334155' },
    btnJoin: { backgroundColor: '#38bdf8', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', fontWeight: 'bold' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b', justifyContent: 'space-around' },
    memoBox: { backgroundColor: '#0f172a', padding: '15px', borderRadius: '14px', border: '1px solid #eab308', marginTop: '15px' }
  };

  return (
    <div style={styles.container}>
      {/* Total Balance (image_1 style) */}
      <div style={styles.balanceCard}>
        <div style={{ fontWeight: '900', color: '#94a3b8', fontSize: '13px' }}>TOTAL BALANCE</div>
        <div style={styles.balanceText}>{balance.toFixed(4)} TON</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            {['Start Bot', 'Social', 'Reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowPayForm(false);}} style={styles.tabBtn(activeTab === t.toLowerCase())}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && !showPayForm && (
              <>
                <button onClick={() => setShowPayForm(true)} style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', marginBottom: '20px', fontSize: '16px' }}>+ Add Your Task</button>
                {socialChannels.filter(task => !completedTasks.includes(task.id)).map(task => (
                  <div key={task.id} style={styles.taskItem}>
                    <span style={{ fontWeight: '900' }}>{task.name}</span>
                    <button onClick={() => { window.open(task.link, '_blank'); handleCompleteTask(task); }} style={styles.btnJoin}>Join</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'start bot' && (
              <>
                <h3 style={{ textAlign: 'center', color: '#eab308', fontWeight: '900' }}>Bot Missions</h3>
                {botMissions.filter(task => !completedTasks.includes(task.id)).map(task => (
                  <div key={task.id} style={styles.taskItem}>
                    <span style={{ fontWeight: '900' }}>{task.name}</span>
                    <button onClick={() => { window.open(task.link, '_blank'); handleCompleteTask(task); }} style={styles.btnJoin}>Start</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: '900', marginBottom: '20px' }}>Redeem Reward Code</h3>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="ENTER CODE (YTTPO)" 
                  value={rewardInput}
                  onChange={(e) => setRewardInput(e.target.value)}
                />
                <button onClick={handleClaimReward} style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000' }}>Claim Now</button>
              </div>
            )}

            {showPayForm && (
              <div>
                <h3 style={{ textAlign: 'center', color: '#eab308', fontWeight: '900' }}>Order Placement</h3>
                <input style={styles.input} placeholder="Channel Name (@username)" />
                <input style={styles.input} placeholder="Task Link" />
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {[{m:100, p:0.2}, {m:200, p:0.4}, {m:300, p:0.5}].map(plan => (
                    <div key={plan.m} onClick={() => setSelectedPlan(plan.m)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: selectedPlan === plan.m ? '2px solid #eab308' : '1px solid #334155', textAlign: 'center', cursor: 'pointer', backgroundColor: selectedPlan === plan.m ? 'rgba(234,179,8,0.1)' : 'transparent' }}>
                      <div style={{ fontWeight: '900' }}>{plan.m}</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{plan.p} TON</div>
                    </div>
                  ))}
                </div>

                <div style={styles.memoBox}>
                  <small style={{ color: '#94a3b8', fontWeight: 'bold' }}>ADMIN WALLET:</small>
                  <p style={{ fontSize: '11px', wordBreak: 'break-all', margin: '5px 0', fontWeight: 'bold' }}>{adminWallet}</p>
                  <div style={{ borderTop: '1px solid #334155', margin: '10px 0' }} />
                  <div style={{ color: '#eab308', fontWeight: '900', fontSize: '18px' }}>MEMO: {userUID}</div>
                </div>

                <button onClick={() => alert("Sent to Admin for review!")} style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', marginTop: '20px' }}>Confirm Payment</button>
                <button onClick={() => setShowPayForm(false)} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', marginTop: '10px', fontWeight: 'bold' }}>Back</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'history' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#eab308' }}>Transaction History</h3>
          {history.length === 0 ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>No history found.</p> : 
            history.map((h, i) => (
              <div key={i} style={styles.taskItem}>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '14px' }}>{h.name}</div>
                  <small style={{ color: '#94a3b8' }}>{h.date}</small>
                </div>
                <div style={{ color: '#eab308', fontWeight: '900' }}>+{h.amount}</div>
              </div>
            ))
          }
        </div>
      )}

      {/* Footer Navigation (image_13 style) */}
      <div style={styles.footer}>
        <div onClick={() => setActiveNav('earn')} style={{ textAlign: 'center', color: activeNav === 'earn' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>💰</div><div style={{ fontSize: '10px', fontWeight: '900' }}>EARN</div>
        </div>
        <div onClick={() => setActiveNav('invite')} style={{ textAlign: 'center', color: activeNav === 'invite' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>👥</div><div style={{ fontSize: '10px', fontWeight: '900' }}>INVITE</div>
        </div>
        <div onClick={() => setActiveNav('history')} style={{ textAlign: 'center', color: activeNav === 'history' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>📜</div><div style={{ fontSize: '10px', fontWeight: '900' }}>HISTORY</div>
        </div>
        <div onClick={() => setActiveNav('profile')} style={{ textAlign: 'center', color: activeNav === 'profile' ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
          <div style={{ fontSize: '20px' }}>👤</div><div style={{ fontSize: '10px', fontWeight: '900' }}>PROFILE</div>
        </div>
      </div>
    </div>
  );
}

export default App;
