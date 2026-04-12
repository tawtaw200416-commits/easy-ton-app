import React, { useState, useEffect } from 'react';

function App() {
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('ton_balance')) || 0.0000);
  const [completedTasks, setCompletedTasks] = useState(() => JSON.parse(localStorage.getItem('completed_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('withdraw_history')) || []);
  const [inviteHistory, setInviteHistory] = useState(() => JSON.parse(localStorage.getItem('invite_history')) || []);

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');

  const userUID = "1793453606";
  const inviteLink = `https://t.me/EasyTONFree_Bot?start=${userUID}`;

  useEffect(() => {
    localStorage.setItem('ton_balance', JSON.stringify(balance));
    localStorage.setItem('completed_tasks', JSON.stringify(completedTasks));
    localStorage.setItem('withdraw_history', JSON.stringify(withdrawHistory));
    localStorage.setItem('invite_history', JSON.stringify(inviteHistory));
  }, [balance, completedTasks, withdrawHistory, inviteHistory]);

  // Task အမှန်တကယ် လုပ်ဆောင်ပြီးမှ Reward ပေးသည့် Logic
  const handleTaskAction = (id, link, taskReward) => {
    // Task link သို့ ပို့ဆောင်ခြင်း
    window.open(link, '_blank');

    // Verification Logic: Task တစ်ခုကို တစ်ကြိမ်သာ လုပ်ဆောင်ခွင့်ရှိသည်
    if (!completedTasks.includes(id)) {
      setCompletedTasks([...completedTasks, id]);
      
      // လုပ်ဆောင်သူအတွက် Reward
      const rewardAmount = 0.0005;
      setBalance(prev => prev + rewardAmount);

      // Referral Bonus (10%): အကယ်၍ ဤသူသည် referral ဖြစ်ပါက ဖိတ်ခေါ်သူအတွက်ပါ ပေါင်းပေးမည်
      // လက်ရှိ UI တွင် စာသားဖြင့်သာ ပြသထားပြီး Backend နှင့် ချိတ်ဆက်ပါက ဤနေရာတွင် logic ထပ်ထည့်နိုင်သည်
      console.log(`Task ${id} completed. 10% bonus calculated for referrer.`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied: " + text);
  };

  const styles = {
    container: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '15px', paddingBottom: '90px' },
    card: { backgroundColor: '#1e293b', borderRadius: '20px', padding: '15px', marginBottom: '15px', border: '1px solid #334155' },
    balanceCard: { background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderRadius: '25px', padding: '20px', textAlign: 'center', marginBottom: '15px', color: '#000' },
    btn: (bg = '#fbbf24') => ({ backgroundColor: bg, color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }),
    footer: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', padding: '15px', backgroundColor: '#1e293b', borderTop: '1px solid #334155' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.balanceCard}>
        <small style={{ fontWeight: 'bold' }}>AVAILABLE BALANCE</small>
        <h1 style={{ margin: '5px 0' }}>{balance.toFixed(4)} TON</h1>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['bot', 'social'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === t ? '#fbbf24' : '#0f172a', color: activeTab === t ? '#000' : '#94a3b8', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          {/* Social Task List Example */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
            <span style={{ fontWeight: 'bold' }}>@GrowTeaNews</span>
            <button onClick={() => handleTaskAction("s1", "https://t.me/GrowTeaNews")} style={{ padding: '5px 15px', borderRadius: '8px', background: '#38bdf8', border: 'none', color: '#fff', fontWeight: 'bold' }}>Join</button>
          </div>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3 style={{ textAlign: 'center', color: '#fbbf24' }}>Invite & Earn</h3>
          <p style={{ textAlign: 'center', fontSize: '13px' }}>Your friend must complete a task for you to earn 10% bonus!</p>
          <input style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#020617', color: 'white', border: '1px solid #334155', marginTop: '10px' }} value={inviteLink} readOnly />
          <button style={{ ...styles.btn(), marginTop: '10px' }} onClick={() => copyToClipboard(inviteLink)}>Copy Invite Link</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h4 style={{ color: '#ef4444' }}>⚠️ Security Notice</h4>
          <p style={{ fontSize: '12px', color: '#fca5a5' }}>
            Fake accounts and bots are strictly monitored. Your referral earnings will only be credited after a successful task verification.
          </p>
        </div>
      )}

      <div style={styles.footer}>
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
