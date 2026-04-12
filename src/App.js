import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardInput, setRewardInput] = useState("");

  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

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

  const handleTaskAction = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', padding: '30px 20px', borderRadius: '30px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px', gap: '5px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '12px' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', boxSizing: 'border-box' },
    btnFull: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer' },
    copyBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px', cursor: 'pointer' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance */}
      <div style={styles.balanceCard}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '40px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false);}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false);}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false);}}>Reward</button>
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.card} onClick={() => handleTaskAction(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{task.name}</span>
                    <span style={{ color: '#fbbf24', fontSize: '12px' }}>+0.0005 TON</span>
                  </div>
                </div>
              ))}

              {activeTab === 'social' && (
                <>
                  <button style={{ ...styles.btnFull, marginBottom: '20px' }} onClick={() => setShowPayForm(true)}>+ Add Your Task</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                    <div key={task.id} style={styles.card} onClick={() => handleTaskAction(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>{task.name}</span>
                        <span style={{ color: '#38bdf8', fontSize: '12px' }}>Join</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'reward' && (
                <div style={{ textAlign: 'center' }}>
                  <input style={styles.input} placeholder="ENTER CODE" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                  <button style={styles.btnFull} onClick={() => alert("Checking Code...")}>Claim Now</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h4 style={{ textAlign: 'center', color: '#fbbf24' }}>ORDER PLACEMENT</h4>
              <input style={styles.input} placeholder="Task Name" />
              <input style={styles.input} placeholder="Link" />
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0f172a', borderRadius: '10px', border: '1px solid #fbbf24', fontSize: '11px' }}>100/0.2T</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0f172a', borderRadius: '10px', border: '1px solid #fbbf24', fontSize: '11px' }}>200/0.4T</div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#0f172a', borderRadius: '10px', border: '1px solid #fbbf24', fontSize: '11px' }}>300/0.5T</div>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress)}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>TON ADDRESS (Tap to Copy)</div>
                <div style={{ fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all' }}>{adminAddress}</div>
              </div>
              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID)}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>MEMO / UID (Tap to Copy)</div>
                <div style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 'bold' }}>{userUID}</div>
              </div>
              <button style={{ ...styles.btnFull, marginTop: '10px' }} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold' }}>Invite Friends</h3>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>0.0005 TON per referral</p>
          <div style={styles.copyBox} onClick={() => copyToClipboard(`https://t.me/EasyTON_Bot?start=${userUID}`)}>
            https://t.me/EasyTON_Bot?start={userUID}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ fontWeight: 'bold' }}>History</h3>
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No Transactions Yet</div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center' }}>Profile</h3>
          <p>UID: {userUID}</p>
          <p>Status: <span style={{ color: '#10b981' }}>Active</span></p>
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
