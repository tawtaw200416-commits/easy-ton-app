import React, { useState, useEffect } from 'react';

function App() {
  // LocalStorage မှ Data များ ပြန်ခေါ်ခြင်း
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');

  const userUID = "1793453606";

  // Data ပြောင်းလဲတိုင်း သိမ်းဆည်းခြင်း
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

  // Join နှိပ်ချိန်တွင် Link သို့ ပို့ပေးခြင်း
  const handleJoinLink = (link) => {
    window.open(link, '_blank');
  };

  // တကယ် Join ပြီးမှ TON ပေါင်းပေးမည့် Function
  const handleVerify = (id) => {
    // ဤနေရာတွင် နောင်တွင် Backend API နှင့် ချိတ်ဆက်၍ တကယ် Join မ Join စစ်ဆေးနိုင်သည်
    if (!completedTasks.includes(id)) {
      setCompletedTasks([...completedTasks, id]);
      setBalance(prev => prev + 0.0005);
      alert("Verification Success! 0.0005 TON added.");
    }
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', borderRadius: '20px', padding: '15px', marginBottom: '15px', border: '1px solid #334155' },
    balanceCard: { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderRadius: '25px', padding: '20px', textAlign: 'center', marginBottom: '15px', color: '#000' },
    taskRow: { display: 'flex', flexDirection: 'column', padding: '15px 0', borderBottom: '1px solid #334155' },
    btnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
    joinBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#38bdf8', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
    verifyBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#fbbf24', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.balanceCard}>
        <small style={{ fontWeight: 'bold' }}>AVAILABLE BALANCE</small>
        <h1 style={{ margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <h3 style={{ color: '#fbbf24', textAlign: 'center' }}>Social Tasks</h3>
          {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
            <div key={task.id} style={styles.taskRow}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{task.name}</span>
              <div style={styles.btnGroup}>
                <button onClick={() => handleJoinLink(task.link)} style={styles.joinBtn}>1. Join Link</button>
                <button onClick={() => handleVerify(task.id)} style={styles.verifyBtn}>2. Check Join</button>
              </div>
            </div>
          ))}
          {socialTasks.filter(t => !completedTasks.includes(t.id)).length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>All tasks completed!</p>
          )}
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', padding: '15px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', color: activeNav === n ? '#fbbf24' : '#94a3b8' }}>
            <div style={{ fontSize: '20px' }}>{n === 'earn' ? '💰' : n === 'invite' ? '👥' : n === 'withdraw' ? '💸' : '👤'}</div>
            <small style={{ fontWeight: 'bold', fontSize: '10px' }}>{n.toUpperCase()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
