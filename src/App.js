import React, { useState } from 'react';

function App() {
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [balance, setBalance] = useState(0.0000);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";
  const inviteLink = `https://t.me/EasyTONFree_Bot?start=${userUID}`;

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
    historyBox: { backgroundColor: '#020617', borderRadius: '15px', padding: '15px', marginTop: '10px', border: '1px solid #334155' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#1e293b', borderTop: '2px solid #334155' }
  };

  return (
    <div style={styles.container}>
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
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontWeight: '900', fontSize: '13px' }}>{task.name}</span>
                <button style={{ ...styles.btn('#fbbf24', '#000'), width: 'auto', padding: '8px 20px' }} onClick={() => handleTaskComplete(task.name, task.link)}>Start</button>
              </div>
            ))}

            {activeTab === 'social' && !showPayForm && (
              <>
                <button style={{ ...styles.btn('#fbbf24', '#000'), marginBottom: '20px', border: '2px dashed #000' }} onClick={() => setShowPayForm(true)}>+ ADD YOUR TASK</button>
                {socialTasks.filter(t => !completedTasks.includes(t)).map((task, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontWeight: '900', fontSize: '13px' }}>{task}</span>
                    <button style={{ ...styles.btn('#38bdf8', '#fff'), width: 'auto', padding: '8px 20px' }} onClick={() => handleTaskComplete(task, `https://t.me/${task.replace('@', '')}`)}>Join</button>
                  </div>
                ))}
              </>
            )}

            {showPayForm && (
              <div>
                <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#fbbf24' }}>Add Your Task</h3>
                <input style={styles.input} placeholder="Task Name" />
                <input style={styles.input} placeholder="Task Link" />
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
                    <small style={{ color: '#94a3b8', fontWeight: '900' }}>ADMIN ADDRESS & MEMO (UID):</small>
                    <div style={{ fontSize: '10px', wordBreak: 'break-all', marginTop: '5px' }}>{adminWallet}</div>
                    <div style={{ color: '#fbbf24', fontWeight: '900', marginTop: '5px' }}>MEMO: {userUID}</div>
                  </div>
                )}
                <button style={styles.btn()} onClick={() => setShowPayForm(false)}>Confirm Payment</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#fbbf24' }}>Invite & Earn</h3>
          <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '900', color: '#fff' }}>Earn 0.0005 TON for each friend!</p>
          <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: '900', color: '#fbbf24' }}>+ Get 10% from your friends' task earnings!</p>
          
          <input style={{...styles.input, marginTop: '15px'}} value={inviteLink} readOnly />
          <button style={styles.btn()} onClick={() => copyToClipboard(inviteLink)}>Copy Link</button>

          <h4 style={{ marginTop: '25px', fontWeight: '900' }}>Invite History (0)</h4>
          <div style={styles.historyBox}>
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: '900' }}>No friends invited yet.</div>
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <>
          <div style={styles.card}>
            <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#fbbf24' }}>Withdraw TON</h3>
            <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
            <input style={styles.input} placeholder="TON Wallet Address" />
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px', border: '1px solid #fbbf24', textAlign: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: '900', color: '#fbbf24' }}>MEMO: {userUID}</span>
            </div>
            <button style={styles.btn()}>Withdraw Now</button>
          </div>
          <div style={styles.card}>
            <h4 style={{ fontWeight: '900', color: '#fbbf24', marginTop: 0 }}>Withdrawal History</h4>
            <div style={styles.historyBox}>
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: '900' }}>No withdrawal history yet.</div>
            </div>
          </div>
        </>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', fontWeight: '900', color: '#fbbf24' }}>My Profile</h3>
          <div style={{ backgroundColor: '#020617', padding: '15px', borderRadius: '15px', border: '1px solid #334155', marginBottom: '20px' }}>
            <p style={{ fontWeight: '900', margin: '10px 0' }}>User ID: <span style={{ color: '#fbbf24' }}>{userUID}</span></p>
            <p style={{ fontWeight: '900', margin: '10px 0' }}>Status: <span style={{ color: '#10b981' }}>Active Account</span></p>
          </div>
          <div style={{ border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '18px' }}>
            <h4 style={{ color: '#ef4444', marginTop: 0, fontWeight: '900' }}>⚠️ WARNING / POLICY</h4>
            <p style={{ fontSize: '12px', color: '#fca5a5', lineHeight: '1.6', fontWeight: '900' }}>
              The use of fake accounts, bots, or scripts is strictly prohibited. Our system monitors account activity 24/7. 
              Any fraud detected will result in a permanent ban and forfeiture of all accumulated balance.
            </p>
          </div>
        </div>
      )}

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
