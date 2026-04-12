import React, { useState, useEffect } from 'react';

function App() {
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(0);

  const userUID = "1793453606";
  const adminWallet = "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9";

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
  }, [balance, completedTasks]);

  const socialTasks = [
    { id: "s1", name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: "s2", name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: "s3", name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: "s4", name: "@M9460", link: "https://t.me/M9460" }
  ];

  const handleVerify = (id) => {
    if (!completedTasks.includes(id)) {
      setCompletedTasks([...completedTasks, id]);
      setBalance(prev => prev + 0.0005);
    }
  };

  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'Inter, sans-serif', paddingBottom: '90px' },
    balanceCard: { background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', borderRadius: '28px', padding: '30px 20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(234, 179, 8, 0.3)' },
    tabBar: { display: 'flex', backgroundColor: '#1e293b', borderRadius: '16px', padding: '6px', marginBottom: '20px' },
    tabBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#eab308' : 'transparent', color: active ? '#000' : '#94a3b8', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: '0.3s' }),
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155' },
    input: { width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', fontSize: '15px', outline: 'none' },
    planBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #eab308', backgroundColor: active ? '#eab308' : 'transparent', color: active ? '#000' : '#fff', textAlign: 'center', cursor: 'pointer' }),
    adminBox: { border: '2px solid #eab308', borderRadius: '18px', padding: '15px', margin: '15px 0', backgroundColor: 'rgba(234, 179, 8, 0.05)' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }
  };

  return (
    <div style={styles.container}>
      {/* Balance Section */}
      <div style={styles.balanceCard}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(0,0,0,0.6)', marginBottom: '5px' }}>AVAILABLE BALANCE</div>
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#000' }}>{balance.toFixed(4)} TON</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.tabBar}>
            {['Start Bot', 'Social', 'Reward'].map(tab => (
              <button key={tab} style={styles.tabBtn(activeTab === tab.toLowerCase())} onClick={() => {setActiveTab(tab.toLowerCase()); setShowPayForm(false)}}>
                {tab}
              </button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'social' && !showPayForm && (
              <>
                <button style={{ width: '100%', padding: '16px', borderRadius: '14px', backgroundColor: '#eab308', border: 'none', fontWeight: '900', color: '#000', marginBottom: '25px', fontSize: '16px' }} onClick={() => setShowPayForm(true)}>
                  + Add Your Task
                </button>
                <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#eab308', textAlign: 'center' }}>Social Tasks</h3>
                {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
                  <div key={task.id} style={{ marginBottom: '25px' }}>
                    <div style={{ fontWeight: '800', marginBottom: '10px', fontSize: '15px' }}>{task.name}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => window.open(task.link, '_blank')} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#38bdf8', border: 'none', color: '#fff', fontWeight: '800' }}>1. Join Link</button>
                      <button onClick={() => handleVerify(task.id)} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#eab308', border: 'none', color: '#000', fontWeight: '800' }}>2. Check Join</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {showPayForm && (
              <div>
                <h3 style={{ textAlign: 'center', color: '#eab308', marginBottom: '20px' }}>Add Your Task</h3>
                <input style={styles.input} placeholder="Channel Username" />
                <input style={styles.input} placeholder="Link" />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {[{m:100, p:0.2}, {m:200, p:0.4}, {m:300, p:0.5}].map((plan, i) => (
                    <div key={i} onClick={() => setSelectedPlan(i)} style={styles.planBtn(selectedPlan === i)}>
                      <div style={{ fontWeight: '900' }}>{plan.m}</div>
                      <div style={{ fontSize: '10px' }}>{plan.p} TON</div>
                    </div>
                  ))}
                </div>
                <div style={styles.adminBox}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>ADMIN ADDRESS & MEMO (UID):</div>
                  <div style={{ fontSize: '10px', wordBreak: 'break-all', color: '#fff', lineHeight: '1.5' }}>{adminWallet}</div>
                  <div style={{ marginTop: '10px', color: '#eab308', fontWeight: '900', fontSize: '16px' }}>MEMO: {userUID}</div>
                </div>
                <button style={{ ...styles.tabBtn(true), width: '100%', marginTop: '10px' }}>Confirm Payment</button>
                <button style={{ width: '100%', background: 'transparent', color: '#94a3b8', border: 'none', marginTop: '15px', fontWeight: 'bold' }} onClick={() => setShowPayForm(false)}>Back</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Nav */}
      <div style={styles.footer}>
        {['Earn', 'Invite', 'Withdraw', 'Profile'].map(nav => (
          <div key={nav} onClick={() => setActiveNav(nav.toLowerCase())} style={{ textAlign: 'center', cursor: 'pointer', opacity: activeNav === nav.toLowerCase() ? 1 : 0.5 }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{nav === 'Earn' ? '💰' : nav === 'Invite' ? '👥' : nav === 'Withdraw' ? '💸' : '👤'}</div>
            <div style={{ fontSize: '10px', fontWeight: '900', color: activeNav === nav.toLowerCase() ? '#eab308' : '#94a3b8' }}>{nav.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
