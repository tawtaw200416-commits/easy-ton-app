import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  ADMIN_UID: "7406691453", // Bro ရဲ့ UID ကို ဒီမှာ ထည့်ပေးပါ (ဥပမာ ပြထားတာပါ)
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Tasks state
  const [customTasks, setCustomTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const updateFirebase = (newData) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(newData)
    });
  };

  // --- Admin: Add New Task ---
  const handleAddTask = () => {
    if (!newTask.name || !newTask.link) return alert("Fill all fields");
    const taskId = 'custom_' + Date.now();
    const taskData = { ...newTask, id: taskId };

    fetch(`${APP_CONFIG.FIREBASE_URL}/tasks/${taskId}.json`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    }).then(() => {
      setCustomTasks([...customTasks, taskData]);
      setNewTask({ name: '', link: '', type: 'bot' });
      alert("Task Added Successfully!");
    });
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Load User Data & Global Tasks
    Promise.all([
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`).then(res => res.json()),
      fetch(`${APP_CONFIG.FIREBASE_URL}/tasks.json`).then(res => res.json())
    ]).then(([userData, tasksData]) => {
      // Handle User Data
      if (userData) {
        setBalance(userData.balance || 0);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferralCount(userData.referralCount || 0);
      }
      // Handle Global Tasks
      if (tasksData) {
        setCustomTasks(Object.values(tasksData));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        updateFirebase({ balance: newBalance, completed: newCompleted });
        alert("Reward Received! +0.0005 TON");
      }
    };
    if (window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show().then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else {
      setTimeout(completeTask, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['bot', 'social', 'reward', 'admin'].map(t => (
              (t !== 'admin' || APP_CONFIG.MY_UID === APP_CONFIG.ADMIN_UID) && (
                <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t.toUpperCase()}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {/* Display Tasks based on Type */}
            {customTasks.filter(t => t.type === activeTab && !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.yellowBtn} onClick={() => { if(rewardInput==='EASY1'){ const newBalance = Number((balance + 0.0005).toFixed(5)); setBalance(newBalance); updateFirebase({ balance: newBalance }); alert("Reward Claimed!"); setRewardInput(''); } else { alert("Invalid Code!"); } }}>CLAIM</button>
              </div>
            )}

            {/* Admin Add Task Panel */}
            {activeTab === 'admin' && APP_CONFIG.MY_UID === APP_CONFIG.ADMIN_UID && (
              <div>
                <h4 style={{marginTop:0}}>ADD NEW TASK</h4>
                <input style={styles.input} placeholder="Task Name (e.g. Join Channel)" value={newTask.name} onChange={(e) => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://...)" value={newTask.link} onChange={(e) => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={(e) => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.yellowBtn} onClick={handleAddTask}>SAVE TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Other Navigation Tabs (Invite, Withdraw, Profile) stay exactly the same as your previous code */}
      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <div style={{background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px'}}>
            <small>REFERRAL LINK:</small>
            <p style={{fontSize:12, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => { navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert("Copied!"); }} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:20}}><span>Total Invites:</span><strong>{referralCount} Users</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={() => {
            const amount = parseFloat(withdrawAmount);
            if (amount >= 0.1 && amount <= balance) {
              const newBalance = Number((balance - amount).toFixed(5));
              const newHistory = [{ id: Date.now(), amount, status: 'Pending' }, ...withdrawHistory];
              setBalance(newBalance); setWithdrawHistory(newHistory);
              updateFirebase({ balance: newBalance, withdrawHistory: newHistory });
              alert("Withdraw success!"); setWithdrawAmount('');
            } else { alert("Insufficient Balance"); }
          }}>WITHDRAW NOW</button>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:20}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <div style={{...styles.row, marginTop: 15, borderTop: '1px solid #eee', paddingTop: 15}}>
            <span>Active Referrals:</span><strong>{referralCount} Users</strong>
          </div>
        </div>
      )}

      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
