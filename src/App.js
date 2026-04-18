import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27611",
  DEFAULT_REWARD: 0.001, // 0.001 TON ပြောင်းထားသည်
  REWARD_CODE: "EASY3",
  CODE_REWARD_AMOUNT: 0.001
};

function App() {
  // --- States ---
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [invites, setInvites] = useState(() => JSON.parse(localStorage.getItem('invites')) || []);
  const [withdrawals, setWithdrawals] = useState(() => JSON.parse(localStorage.getItem('withdraws')) || []);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('admin_tasks')) || [
    { id: 't1', name: "Watch Ad & Join Channel", link: "https://t.me/easytonfree" },
    { id: 't2', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" }
  ]);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '' });

  // --- Effects ---
  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('invites', JSON.stringify(invites));
    localStorage.setItem('withdraws', JSON.stringify(withdrawals));
    localStorage.setItem('admin_tasks', JSON.stringify(tasks));
  }, [balance, completed, invites, withdrawals, tasks]);

  // --- Handlers ---
  const handleAdsAction = (taskId, link) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(() => {
        setIsAdLoading(false);
        setBalance(prev => Number((prev + APP_CONFIG.DEFAULT_REWARD).toFixed(5)));
        setCompleted(prev => [...prev, taskId]);
        window.open(link, '_blank');
        alert(`Reward Received! +${APP_CONFIG.DEFAULT_REWARD} TON`);
      }).catch(() => {
        setIsAdLoading(false);
        alert("Ad failed. Check VPN.");
      });
    } else {
      alert("Adsgram not loaded. Check index.html");
    }
  };

  const handleRedeemCode = () => {
    if (inputCode === APP_CONFIG.REWARD_CODE) {
      if (completed.includes('code_redeem')) return alert("Already redeemed!");
      setBalance(prev => prev + APP_CONFIG.CODE_REWARD_AMOUNT);
      setCompleted(prev => [...prev, 'code_redeem']);
      alert(`Success! +${APP_CONFIG.CODE_REWARD_AMOUNT} TON added.`);
    } else {
      alert("Invalid Code!");
    }
  };

  const handleWithdraw = () => {
    if (balance < 0.1) return alert("Minimum withdrawal is 0.1 TON");
    const newWd = { date: new Date().toLocaleDateString(), amount: balance, status: 'Pending' };
    setWithdrawals(prev => [newWd, ...prev]);
    setBalance(0);
    alert("Withdrawal request sent!");
  };

  const adminAddTask = () => {
    if (!newTask.name || !newTask.link) return;
    const taskObj = { id: 't' + Date.now(), ...newTask };
    setTasks([...tasks, taskObj]);
    setNewTask({ name: '', link: '' });
  };

  // --- Styles ---
  const styles = {
    header: { textAlign: 'center', background: '#000', color: '#fff', padding: '25px', borderRadius: '0 0 25px 25px' },
    card: { background: '#fff', margin: '12px', padding: '15px', borderRadius: '15px', border: '2px solid #000' },
    btn: { padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
    input: { padding: '10px', width: '70%', borderRadius: '8px', border: '1px solid #ccc', marginRight: '5px' },
    nav: { position: 'fixed', bottom: 0, width: '100%', display: 'flex', background: '#000', padding: '12px 0' },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' })
  };

  return (
    <div style={{ paddingBottom: '80px', backgroundColor: '#facc15', minHeight: '100vh' }}>
      <div style={styles.header}>
        <small>CURRENT BALANCE</small>
        <h1 style={{ fontSize: '35px', margin: '5px 0' }}>{balance.toFixed(5)} TON</h1>
      </div>

      {/* Navigation Content */}
      {activeNav === 'earn' && (
        <div style={styles.card}>
          <h3>Daily Tasks</h3>
          {tasks.filter(t => !completed.includes(t.id)).map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>{task.name}</span>
              <button onClick={() => handleAdsAction(task.id, task.link)} style={styles.btn}>
                {isAdLoading ? '...' : '0.001 TON'}
              </button>
            </div>
          ))}
          <hr/>
          <h4>Redeem Code</h4>
          <input style={styles.input} placeholder="Enter Code (EASY3)" onChange={e => setInputCode(e.target.value)} />
          <button onClick={handleRedeemCode} style={styles.btn}>REDEEM</button>
        </div>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>Invite Friends</h3>
          <p>Your UID: {APP_CONFIG.MY_UID}</p>
          <button style={styles.btn} onClick={() => window.open(`https://t.me/share/url?url=https://t.me/YourBotName?start=${APP_CONFIG.MY_UID}`)}>SHARE LINK</button>
          <h4>Invite History</h4>
          {invites.length === 0 ? <p>No invites yet.</p> : invites.map((inv, i) => <div key={i}>User ID: {inv}</div>)}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>Withdraw</h3>
          <p>Min: 0.1 TON</p>
          <button style={{...styles.btn, width: '100%'}} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4>History</h4>
          {withdrawals.map((w, i) => <div key={i}>{w.date} - {w.amount} TON ({w.status})</div>)}
        </div>
      )}

      {activeNav === 'admin' && (
        <div style={styles.card}>
          <h3>Admin Panel</h3>
          <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
          <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
          <button onClick={adminAddTask} style={{...styles.btn, marginTop: '10px'}}>ADD TASK</button>
        </div>
      )}

      {/* Nav Bar */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'admin'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
