import React, { useState, useEffect } from 'react';

function App() {
  // --- 1. States & Storage ---
  const [userUID] = useState("1793453606");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const adminAddress = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
  }, [balance, completedTasks, withdrawHistory]);

  // --- 2. Fixed Data Lists ---
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
  ].map((name, i) => ({ id: `s${i}`, name, link: `https://t.me/${name.replace('@','')}` }));

  // --- 3. Actions ---
  const handleTaskAction = (task) => {
    window.open(task.link, '_blank');
    if (!completedTasks.includes(task.id)) {
      setBalance(prev => prev + 0.0005);
      setCompletedTasks(prev => [...prev, task.id]);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} Copied!`);
  };

  const submitWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const addr = e.target.address.value;
    if (amount >= 0.1 && balance >= amount) {
      const newTx = { id: Date.now(), amount, addr, status: "Success", date: new Date().toLocaleDateString() };
      setWithdrawHistory([newTx, ...withdrawHistory]);
      setBalance(prev => prev - amount);
      alert("Withdrawal Successful!");
      e.target.reset();
    } else {
      alert("Insufficient balance or Min 0.1 TON required.");
    }
  };

  // --- 4. Styling ---
  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    balanceCard: { background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', padding: '25px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', border: '1px solid #334155' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px', gap: '5px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#fbbf24' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold' }),
    card: { backgroundColor: '#1e293b', padding: '18px', borderRadius: '20px', border: '1px solid #334155', marginBottom: '12px' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', marginBottom: '12px', boxSizing: 'border-box' },
    btnFull: { width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#fbbf24', border: 'none', fontWeight: '900', cursor: 'pointer' },
    copyBox: { backgroundColor: '#0f172a', padding: '12px', borderRadius: '12px', border: '1px dashed #fbbf24', marginBottom: '10px', cursor: 'pointer' },
    planBox: (active) => ({ flex: 1, textAlign: 'center', padding: '10px', background: active ? '#fbbf24' : '#0f172a', color: active ? '#000' : '#fff', borderRadius: '10px', border: '1px solid #fbbf24', fontSize: '11px', cursor: 'pointer' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px 0', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.balanceCard}>
        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>AVAILABLE BALANCE</p>
        <h1 style={{ color: '#fbbf24', fontSize: '40px', margin: '8px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            {['bot', 'social', 'reward'].map(t => (
              <button key={t} style={styles.tabBtn(activeTab === t)} onClick={() => {setActiveTab(t); setShowPayForm(false)}}>{t.toUpperCase()}</button>
            ))}
          </div>

          {!showPayForm ? (
            <div>
              {activeTab === 'bot' && botTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                <div key={task.id} style={styles.card} onClick={() => handleTaskAction(task)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>{task.name}</span>
                    <span style={{ color: '#fbbf24' }}>+0.0005 TON</span>
                  </div>
                </div>
              ))}

              {activeTab === 'social' && (
                <>
                  <button style={{ ...styles.btnFull, marginBottom: '15px' }} onClick={() => setShowPayForm(true)}>+ ADD YOUR TASK</button>
                  {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                    <div key={task.id} style={styles.card} onClick={() => handleTaskAction(task)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold' }}>{task.name}</span>
                        <span style={{ color: '#38bdf8' }}>JOIN</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div style={styles.card}>
              <h3 style={{ textAlign: 'center', color: '#fbbf24', margin: '0 0 20px 0' }}>CREATE TASK</h3>
              <input style={styles.input} placeholder="Task Name (e.g. My Channel)" />
              <input style={styles.input} placeholder="Telegram Link" />
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={styles.planBox(selectedPlan === 1)} onClick={() => setSelectedPlan(1)}>100 Users<br/>0.2 TON</div>
                <div style={styles.planBox(selectedPlan === 2)} onClick={() => setSelectedPlan(2)}>200 Users<br/>0.4 TON</div>
                <div style={styles.planBox(selectedPlan === 3)} onClick={() => setSelectedPlan(3)}>300 Users<br/>0.5 TON</div>
              </div>

              <div style={styles.copyBox} onClick={() => copyToClipboard(adminAddress, "Admin Address")}>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>SEND TON TO (TAP TO COPY):</p>
                <div style={{ fontSize: '11px', color: '#fbbf24', wordBreak: 'break-all', marginTop: '5px' }}>{adminAddress}</div>
              </div>

              <div style={styles.copyBox} onClick={() => copyToClipboard(userUID, "Memo")}>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>REQUIRED MEMO (TAP TO COPY):</p>
                <div style={{ fontSize: '18px', color: '#fbbf24', fontWeight: 'bold', marginTop: '5px' }}>{userUID}</div>
              </div>

              <button style={styles.btnFull} onClick={() => {alert("Order details sent to admin!"); setShowPayForm(false)}}>CONFIRM PAYMENT</button>
            </div>
          )}
        </>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 20px 0' }}>Withdraw TON</h3>
          <form onSubmit={submitWithdraw}>
            <input name="amount" type="number" step="0.01" style={styles.input} placeholder="Amount (Min 0.1)" required />
            <input name="address" style={styles.input} placeholder="TON Wallet Address" required />
            <button type="submit" style={styles.btnFull}>WITHDRAW NOW</button>
          </form>

          <h4 style={{ marginTop: '30px', borderTop: '1px solid #334155', paddingTop: '15px' }}>Withdrawal History</h4>
          {withdrawHistory.map(tx => (
            <div key={tx.id} style={{ ...styles.copyBox, borderStyle: 'solid', borderColor: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{tx.amount} TON</span>
                <span style={{ color: '#10b981' }}>{tx.status}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '5px' }}>{tx.addr}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{tx.date}</div>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center' }}>Referral Program</h3>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#fbbf24' }}>Earn 10% bonus from friends!</p>
          <div style={styles.copyBox} onClick={() => copyToClipboard(`https://t.me/EasyTON_Bot?start=${userUID}`, "Link")}>
            Tap to copy invite link
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
