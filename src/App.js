import React, { useState, useEffect } from 'react';

function App() {
  // Persistence Data
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [rewardClaimed, setRewardClaimed] = useState(() => JSON.parse(localStorage.getItem('reward_claimed')) || false);
  
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
  }, [balance, completedTasks, rewardClaimed]);

  const socialTasks = [
    { id: "s1", name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: "s2", name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: "s3", name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: "s4", name: "@M9460", link: "https://t.me/M9460" }
  ];

  // Task Verification Logic
  const handleVerify = (id) => {
    if (!completedTasks.includes(id)) {
      setCompletedTasks([...completedTasks, id]);
      setBalance(prev => prev + 0.0005);
      alert("0.0005 TON Claimed Success!");
    }
  };

  // Reward Code Logic
  const handleClaimReward = () => {
    if (rewardClaimed) return alert("You already claimed this reward!");
    if (rewardInput.toUpperCase() === "YTTPO") {
      setBalance(prev => prev + 0.0005);
      setRewardClaimed(true);
      setRewardInput("");
      alert("Reward Claimed!");
    } else {
      alert("Wrong Code!");
    }
  };

  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    balanceCard: { background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', borderRadius: '24px', padding: '25px', textAlign: 'center', marginBottom: '20px', color: '#000' },
    tabContainer: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '15px', padding: '5px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#eab308' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }),
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' },
    planBtn: (active) => ({ flex: 1, padding: '10px', borderRadius: '10px', border: active ? '2px solid #eab308' : '1px solid #334155', backgroundColor: active ? 'rgba(234,179,8,0.1)' : 'transparent', textAlign: 'center', cursor: 'pointer' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }
  };

  return (
    <div style={styles.container}>
      {/* Total Balance */}
      <div style={styles.balanceCard}>
        <small style={{ fontWeight: 'bold', opacity: 0.8 }}>AVAILABLE BALANCE</small>
        <h1 style={{ fontSize: '38px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabContainer}>
            {['Start Bot', 'Social', 'Reward'].map(t => (
              <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowPayForm(false);}} style={styles.tabBtn(activeTab === t.toLowerCase())}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && !showPayForm && (
              <>
                <button onClick={() => setShowPayForm(true)} style={{ width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: 'bold', marginBottom: '20px' }}>+ Add Your Task</button>
                <h4 style={{ textAlign: 'center', color: '#eab308' }}>Social Tasks</h4>
                {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                  <div key={task.id} style={{ marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{task.name}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => window.open(task.link, '_blank')} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#38bdf8', border: 'none', color: '#fff', fontWeight: 'bold' }}>1. Join Link</button>
                      <button onClick={() => handleVerify(task.id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#eab308', border: 'none', fontWeight: 'bold' }}>2. Check Join</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'reward' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: '20px' }}>Redeem Reward Code</h3>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="ENTER CODE (YTTPO)" 
                  value={rewardInput}
                  onChange={(e) => setRewardInput(e.target.value)}
                />
                <button onClick={handleClaimReward} style={{ width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: 'bold' }}>Claim Now</button>
              </div>
            )}

            {showPayForm && (
              <div>
                <h3 style={{ textAlign: 'center', color: '#eab308' }}>Add Your Task</h3>
                <input style={styles.input} placeholder="Channel Username" />
                <input style={styles.input} placeholder="Link" />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <div onClick={() => setSelectedPlan(100)} style={styles.planBtn(selectedPlan === 100)}><b>100</b><br/><small>0.2 TON</small></div>
                  <div onClick={() => setSelectedPlan(200)} style={styles.planBtn(selectedPlan === 200)}><b>200</b><br/><small>0.4 TON</small></div>
                  <div onClick={() => setSelectedPlan(300)} style={styles.planBtn(selectedPlan === 300)}><b>300</b><br/><small>0.5 TON</small></div>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #eab308', marginBottom: '15px' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 5px 0' }}>ADMIN ADDRESS & MEMO (UID):</p>
                  <p style={{ fontSize: '11px', wordBreak: 'break-all', margin: 0 }}>{adminWallet}</p>
                  <p style={{ fontSize: '16px', color: '#eab308', fontWeight: 'bold', margin: '10px 0 0 0' }}>MEMO: {userUID}</p>
                </div>
                <button style={{ width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#eab308', border: 'none', fontWeight: 'bold' }}>Confirm Payment</button>
                <button onClick={() => setShowPayForm(false)} style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: '#94a3b8', marginTop: '10px' }}>Back</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        {['Earn', 'Invite', 'Withdraw', 'Profile'].map(nav => (
          <div key={nav} onClick={() => setActiveNav(nav.toLowerCase())} style={{ flex: 1, textAlign: 'center', color: activeNav === nav.toLowerCase() ? '#eab308' : '#94a3b8', cursor: 'pointer' }}>
            <div style={{ fontSize: '20px' }}>{nav === 'Earn' ? '💰' : nav === 'Invite' ? '👥' : nav === 'Withdraw' ? '💸' : '👤'}</div>
            <small style={{ fontWeight: 'bold', fontSize: '10px' }}>{nav.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
