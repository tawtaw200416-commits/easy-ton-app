import React, { useState, useEffect } from 'react';

function App() {
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  // 1. Start Bot Links (အတိအကျထည့်ထားသည်)
  const botTasks = [
    { id: 'b1', name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b2', name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  // 2. Social Tasks (အတိအကျထည့်ထားသည်)
  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ].map((name, i) => ({ id: `s${i}`, name, link: `https://t.me/${name.replace('@','')}` }));

  const handleTask = (task) => {
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
    balanceCard: { background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', padding: '25px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '12px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' },
    warning: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px', border: '1px solid #ef4444', marginTop: '20px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.balanceCard}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '38px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} style={styles.tabBtn(activeTab === t)} onClick={() => {setActiveTab(t); setShowPayForm(false)}}>{t.toUpperCase()}</button>
            ))}
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.card} onClick={() => handleTask(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <b>{task.name}</b>
                    <span style={{ color: '#fbbf24' }}>+0.0005 TON</span>
                  </div>
                </div>
              ))}

              {activeTab === 'social' && (
                <>
                  <button style={{ width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', marginBottom: '15px' }} onClick={() => setShowPayForm(true)}>+ ADD TASK</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                    <div key={task.id} style={styles.card} onClick={() => handleTask(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <b>{task.name}</b>
                        <span style={{ color: '#38bdf8' }}>JOIN</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h4 style={{ textAlign: 'center', color: '#fbbf24' }}>ORDER PAYMENT</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Send TON to this Address:</p>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', wordBreak: 'break-all', fontSize: '11px', color: '#fbbf24' }} onClick={() => copyToClipboard("UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9")}>UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9</div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '15px' }}>Your UID / MEMO (Must Include):</p>
              <div style={{ background: '#0f172a', padding: '10px', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }} onClick={() => copyToClipboard(userUID)}>{userUID}</div>
              <button style={{ width: '100%', padding: '15px', background: '#334155', border: 'none', borderRadius: '10px', color: '#fff', marginTop: '15px' }} onClick={() => setShowPayForm(false)}>Back</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center' }}>Invite Friends</h3>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#fbbf24' }}>Get 10% bonus from each task your friends join!</p>
          <div style={{ background: '#0f172a', padding: '15px', borderRadius: '12px', textAlign: 'center', marginTop: '15px' }} onClick={() => copyToClipboard(`https://t.me/EasyTON_Bot?start=${userUID}`)}>
            https://t.me/EasyTON_Bot?start={userUID}
          </div>
          
          <h4 style={{ marginTop: '25px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>History</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 0' }}>
            <span>No Invite Data Found</span>
            <span style={{ color: '#fbbf24' }}>0.0000 TON</span>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw History</h3>
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No completed transactions.</div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center' }}>Profile Settings</h3>
          <p><b>User ID:</b> {userUID}</p>
          <p><b>Account Status:</b> <span style={{ color: '#10b981' }}>Verified</span></p>
          
          <div style={styles.warning}>
            <h4 style={{ color: '#ef4444', margin: '0 0 5px 0' }}>Warning Policy!</h4>
            <p style={{ fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
              If you leave the channel or bot after joining, your account will be permanently banned and all balances will be lost. We check status every 24 hours.
            </p>
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
