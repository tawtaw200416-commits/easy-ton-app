import React, { useState, useEffect } from 'react';

function App() {
  // Persistence Data: LocalStorage မှ ပြန်ယူခြင်း
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('invite_history')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  const [showPayForm, setShowPayForm] = useState(false);
  const [rewardInput, setRewardInput] = useState("");

  const userUID = "1793453606";
  const inviteLink = `https://t.me/EasyTONFree_Bot?start=${userUID}`;

  // Data ပြောင်းတိုင်း LocalStorage တွင် သိမ်းခြင်း
  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('invite_history', JSON.stringify(inviteHistory));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
  }, [balance, completedTasks, inviteHistory, withdrawHistory]);

  const socialTasks = [
    { id: "s1", name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: "s2", name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: "s3", name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: "s4", name: "@M9460", link: "https://t.me/M9460" }
  ];

  // Task လုပ်ဆောင်သည့် Function
  const handleVerifyTask = (id) => {
    if (!completedTasks.includes(id)) {
      setCompletedTasks([...completedTasks, id]);
      setBalance(prev => prev + 0.0005);
      alert("Verification Success! 0.0005 TON added.");
    } else {
      alert("Already Completed!");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const styles = {
    container: { backgroundColor: '#0b1120', color: 'white', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', borderRadius: '24px', padding: '20px', border: '1px solid #334155', marginBottom: '15px' },
    balanceCard: { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderRadius: '25px', padding: '25px', textAlign: 'center', marginBottom: '20px', color: '#000' },
    input: { width: '100%', padding: '15px', borderRadius: '12px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', marginBottom: '12px', fontWeight: '900', outline: 'none', boxSizing: 'border-box' },
    btn: () => ({ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '15px' }),
    historyBox: { backgroundColor: '#0f172a', borderRadius: '12px', padding: '15px', border: '1px solid #334155', marginTop: '10px' },
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '15px', backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }
  };

  return (
    <div style={styles.container}>
      {/* Header Balance */}
      <div style={styles.balanceCard}>
        <p style={{ fontSize: '12px', fontWeight: '900', margin: 0 }}>AVAILABLE BALANCE</p>
        <h1 style={{ fontSize: '40px', margin: '5px 0', fontWeight: '900' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
           <h3 style={{textAlign: 'center', color: '#fbbf24', fontWeight: '900'}}>Social Tasks</h3>
           {socialTasks.filter(t => !completedTasks.includes(t.id)).map(task => (
             <div key={task.id} style={{marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px'}}>
               <p style={{fontWeight: '900', marginBottom: '10px'}}>{task.name}</p>
               <div style={{display: 'flex', gap: '10px'}}>
                 <button style={{...styles.btn(), backgroundColor: '#38bdf8', color: '#fff', flex: 1}} onClick={() => window.open(task.link, '_blank')}>1. Join Link</button>
                 <button style={{...styles.btn(), flex: 1}} onClick={() => handleVerifyTask(task.id)}>2. Check Join</button>
               </div>
             </div>
           ))}
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>Invite Friends</h3>
          <p style={{textAlign: 'center', fontSize: '13px', color: '#fbbf24', fontWeight: 'bold'}}>Get 0.0005 TON per invite!</p>
          <input style={styles.input} value={inviteLink} readOnly />
          <button style={{...styles.btn(), width: '100%'}} onClick={() => copyToClipboard(inviteLink)}>Copy Link</button>
          
          <h4 style={{marginTop: '25px', fontWeight: '900'}}>Invite History</h4>
          <div style={styles.historyBox}>
            <div style={{display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '5px', fontSize: '12px', fontWeight: '900'}}><span>User ID</span><span>Status</span></div>
            {inviteHistory.length === 0 ? (
                <div style={{textAlign: 'center', color: '#64748b', padding: '5px', fontSize: '12px'}}>No invites yet.</div>
            ) : (
                inviteHistory.map((inv, index) => (
                    <div key={index} style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '5px 0'}}>
                        <span>{inv.uid}</span><span style={{color: '#10b981'}}>Success</span>
                    </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{fontWeight: '900'}}>Withdraw TON</h3>
          <input style={styles.input} placeholder="Amount (Min 0.1)" type="number" />
          <input style={styles.input} placeholder="TON Wallet Address" />
          <div style={{backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #fbbf24'}}>
             <small style={{color: '#fbbf24', fontWeight: '900'}}>MEMO: {userUID}</small>
          </div>
          <button style={{...styles.btn(), width: '100%'}}>Withdraw Now</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h3 style={{textAlign: 'center', fontWeight: '900'}}>My Profile</h3>
          <div style={{backgroundColor: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid #334155'}}>
            <p style={{fontWeight: '900', margin: '8px 0'}}>UID: <span style={{color: '#fbbf24'}}>{userUID}</span></p>
            <p style={{fontWeight: '900', margin: '8px 0'}}>Status: <span style={{color: '#10b981'}}>Active</span></p>
          </div>
          <div style={{marginTop: '20px', border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '15px'}}>
            <h4 style={{color: '#ef4444', marginTop: 0, fontWeight: '900'}}>⚠️ Policy</h4>
            <p style={{fontSize: '12px', color: '#fca5a5', lineHeight: '1.5', fontWeight: '900'}}>Fake accounts and scripts are strictly prohibited. Permanent ban for fraud.</p>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'earn' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('earn')}>💰<br/>Earn</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'invite' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('invite')}>👥<br/>Invite</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'withdraw' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('withdraw')}>💸<br/>Withdraw</div>
        <div style={{textAlign: 'center', flex: 1, fontSize: '11px', color: activeNav === 'profile' ? '#fbbf24' : '#94a3b8', fontWeight: '900', cursor: 'pointer'}} onClick={() => setActiveNav('profile')}>👤<br/>Profile</div>
      </div>
    </div>
  );
}

export default App;
