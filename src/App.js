import React, { useState } from 'react';

function App() {
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [balance, setBalance] = useState(0.0000);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  // Task States to hide completed ones
  const [completedTasks, setCompletedTasks] = useState([]);

  const paymentPlans = [
    { members: 100, price: 0.2 },
    { members: 200, price: 0.4 },
    { members: 300, price: 0.5 }
  ];

  const botTasks = [
    { name: "GrowTea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { name: "GoldenMiner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { name: "WorkersOnTon Bot", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { name: "EasyBonusCode Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { name: "TonDragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
  ];

  const socialTasks = [
    "@GrowTeaNews", "@GoldenMinerNews", "@cryptogold_online_official", "@M9460",
    "@USDTcloudminer_channel", "@ADS_TON1", "@goblincrypto", "@WORLDBESTCRYTO",
    "@kombo_crypta", "@easytonfree", "@WORLDBESTCRYTO1", "@MONEYHUB9_69",
    "@zrbtua", "@perviu1million"
  ];

  const handleTaskComplete = (taskName, link) => {
    window.open(link, '_blank');
    if (!completedTasks.includes(taskName)) {
      setCompletedTasks([...completedTasks, taskName]);
      setBalance(prev => prev + 0.0005);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155', marginBottom: '15px' },
    balanceCard: { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderRadius: '25px', padding: '25px', textAlign: 'center', marginBottom: '20px', color: '#000' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '900', cursor: 'pointer' }),
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#020617', color: 'white', border: '1px solid #334155', marginBottom: '12px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' },
    btn: (bg = '#fbbf24', color = '#000') => ({ backgroundColor: bg, color: color, border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', width: '100%' }),
    taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance */}
      <div style={styles.balanceCard}>
        <p style={{ fontSize: '12px', fontWeight: '900', margin: 0 }}>TOTAL BALANCE</p>
        <h1 style={{ fontSize: '38px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '15px', border: '1px solid #334155' }}>
            <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => {setActiveTab('bot'); setShowPayForm(false)}}>Start Bot</button>
            <button style={styles.tabBtn(activeTab === 'social')} onClick={() => {setActiveTab('social'); setShowPayForm(false)}}>Social</button>
            <button style={styles.tabBtn(activeTab === 'reward')} onClick={() => {setActiveTab('reward'); setShowPayForm(false)}}>Reward</button>
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.name)).map((task, i) => (
              <div key={i} style={styles.taskRow}>
                <span style={{ fontWeight: '900', fontSize: '13px' }}>{task.name}</span>
                <button style={{ ...styles.btn('#fbbf24', '#000'), width: 'auto', padding: '8px 20px' }} onClick={() => handleTaskComplete(task.name, task.link)}>Start</button>
              </div>
            ))}

            {activeTab === 'social' && !showPayForm && (
              <>
                <button style={{ ...styles.btn('#fbbf24', '#000'), marginBottom: '20px', border: '2px dashed #000' }} onClick={() => setShowPayForm(true)}>+ ADD YOUR TASK</button>
                {socialTasks.filter(t => !completedTasks.includes(t)).map((task, i) => (
                  <div key={i} style={styles.taskRow}>
                    <span style={{ fontWeight: '900', fontSize: '13px' }}>{task}</span>
                    <button style={{ ...styles.btn('#38bdf8', '#fff'), width: 'auto', padding: '8px 20px' }} onClick={() => handleTaskComplete(task, `https://t.me/${task.replace('@', '')}`)}>Join</button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: '900', color: '#fbbf24' }}>Redeem Code</h3>
                <input style={{ ...styles.input, textAlign: 'center' }} placeholder="ENTER SECRET CODE" />
                <button style={styles.btn()}>Claim Reward</button>
              </div>
            )}

            {showPayForm && (
              <div>
                <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#fbbf24', marginBottom: '20px' }}>Add Your Task</h3>
                <input style={styles.input} placeholder="Channel or Bot Name" />
                <input style={styles.input} placeholder="Link (https://t.me/...)" />
                
                <p style={{ fontWeight: '900', fontSize: '13px', marginBottom: '10px' }}>Select Members Plan:</p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {paymentPlans.map((plan, i) => (
                    <div key={i} onClick={() => setSelectedPlan(i)} style={{ flex: 1, padding: '10px', borderRadius: '12px', textAlign: 'center', backgroundColor: selectedPlan === i ? '#fbbf24' : '#020617', color: selectedPlan === i ? '#000' : '#fff', border: '1px solid #fbbf24', cursor: 'pointer' }}>
                      <div style={{ fontWeight: '900', fontSize: '12px' }}>{plan.members}</div>
                      <div style={{ fontSize: '10px' }}>{plan.price} TON</div>
                    </div>
                  ))}
                </div>

                {selectedPlan !== null && (
                  <div style={{ backgroundColor: '#020617', padding: '15px', borderRadius: '15px', border: '1px solid #fbbf24', marginBottom: '15px' }}>
                    <small style={{ color: '#94a3b8', fontWeight: '900' }}>SEND TON TO ADDRESS:</small>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                      <code style={{ fontSize: '10px', wordBreak: 'break-all', color: '#fff' }}>{adminWallet}</code>
                      <button onClick={() => copyToClipboard(adminWallet)} style={{ background: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '10px' }}>COPY</button>
                    </div>
                    <div style={{ height: '1px', background: '#334155', margin: '10px 0' }} />
                    <small style={{ color: '#94a3b8', fontWeight: '900' }}>REQUIRED MEMO (UID):</small>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                      <b style={{ color: '#fbbf24', fontSize: '16px' }}>{userUID}</b>
                      <button onClick={() => copyToClipboard(userUID)} style={{ background: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: '900', fontSize: '10px' }}>COPY</button>
                    </div>
                  </div>
                )}

                <button style={{ ...styles.btn(), marginBottom: '10px' }} onClick={() => alert("Payment info sent to Admin. Your task will be active after verification.")}>I Have Paid</button>
                <button style={styles.btn('#334155', '#fff')} onClick={() => setShowPayForm(false)}>Back</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Other sections (Invite, Withdraw, Profile) placeholders based on your previous design */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ fontWeight: '900', textAlign: 'center', color: '#fbbf24' }}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Address" />
          <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '15px', borderRadius: '15px', border: '1px solid #fbbf24', textAlign: 'center', marginBottom: '15px' }}>
            <span style={{ fontWeight: '900', color: '#fbbf24' }}>MEMO: {userUID}</span>
          </div>
          <button style={styles.btn()}>Withdraw Now</button>
        </div>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        {['earn', 'invite', 'withdraw', 'profile'].map((nav) => (
          <div key={nav} onClick={() => setActiveNav(nav)} style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }}>
            <span style={{ fontSize: '20px', display: 'block' }}>{nav === 'earn' ? '💰' : nav === 'invite' ? '👥' : nav === 'withdraw' ? '💸' : '👤'}</span>
            <small style={{ color: activeNav === nav ? '#fbbf24' : '#94a3b8', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}>{nav}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
