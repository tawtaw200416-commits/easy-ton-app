import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  // အရေးကြီး - ဒီအောက်က URL ကို Bro ရဲ့ Firebase Realtime Database URL အမှန်နဲ့ အစားထိုးပါ
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Tasks Management
  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // --- Firebase Sync ---
  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  // --- Admin Save Task Logic ---
  const handleAdminSave = async () => {
    if (!newTask.name || !newTask.link) return alert("Please fill all fields!");
    
    const taskId = 'task_' + Date.now();
    try {
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ ...newTask, id: taskId })
      });
      if(res.ok) {
        alert("Task Saved Successfully!");
        setNewTask({ name: '', link: '', type: 'bot' });
        window.location.reload(); // Data အသစ်ပေါ်လာအောင် Refresh လုပ်ခြင်း
      } else {
        alert("Save Failed! Check Firebase URL/Rules.");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Load User Data and Global Tasks
    const fetchData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        }
        if (tasksData) {
          setCustomTasks(Object.values(tasksData));
        }
      } catch (e) {
        console.log("Loading error", e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert("Reward Added!");
      }
    };
    setTimeout(completeTask, 5000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    planBtn: (active) => ({ flex: 1, padding: '10px', border: '2px solid #000', borderRadius: '10px', backgroundColor: active ? '#000' : '#fff', color: active ? '#fff' : '#000', fontSize: '10px', fontWeight: 'bold' })
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>CONNECTING TO FIREBASE...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['bot', 'social', 'reward', 'admin'].map(t => (
          (t !== 'admin' || APP_CONFIG.MY_UID === "1793453606") && (
            <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t.toUpperCase()}</button>
          )
        ))}
      </div>

      <div style={styles.card}>
        {activeTab === 'bot' && [
          { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
          { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
          { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
          { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID }
        ].concat(customTasks.filter(t => t.type === 'bot'))
         .filter(t => !completed.includes(t.id)).map(t => (
          <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
        ))}

        {activeTab === 'social' && (
          <>
            {[
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
              { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" }
            ].concat(customTasks.filter(t => t.type === 'social'))
             .filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button></div>
            ))}
          </>
        )}

        {activeTab === 'admin' && (
          <div>
            <h3>ADD NEW TASK</h3>
            <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
            <input style={styles.input} placeholder="Link (https://...)" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
            <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
              <option value="bot">BOT TASK</option>
              <option value="social">SOCIAL TASK</option>
            </select>
            <button style={styles.yellowBtn} onClick={handleAdminSave}>SAVE TO DATABASE</button>
          </div>
        )}

        {activeTab === 'reward' && (<div><input style={styles.input} placeholder="Enter Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} /><button style={styles.yellowBtn} onClick={() => { if(rewardInput==='EASY1'){ alert("Reward Claimed!"); } else { alert("Invalid Code!"); } }}>CLAIM</button></div>)}
      </div>

      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
