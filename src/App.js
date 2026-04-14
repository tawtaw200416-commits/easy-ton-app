import React, { useState, useEffect } from 'react';

// Telegram WebApp Object
const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

function App() {
  const [balance, setBalance] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // Data lock mechanism

  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // --- Secure Firebase Sync ---
  const syncToFirebase = (path, data) => {
    // Data Loading မပြီးမချင်း Database ထဲကို overwrite မလုပ်အောင် တားထားခြင်း
    if (loading) return; 
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    // Data ဆွဲတဲ့အပိုင်းကို ပိုမိုခိုင်မာအောင် လုပ်ဆောင်ခြင်း
    const fetchInitialData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          // Firebase မှာရှိတဲ့ Data အစစ်ကိုပဲယူမယ် (0 မဖြစ်စေရ)
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        }
        
        if (tasksData) {
          setCustomTasks(Object.values(tasksData));
        }
        
        // Data အကုန်ရမှ Loading ကို ပိတ်မယ်
        setLoading(false);
      } catch (error) {
        console.error("Firebase fetch error:", error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => alert(`${label} Copied!`));
  };

  const handleTaskAction = (id, link) => {
    if (loading || completed.includes(id)) return;
    window.open(link, '_blank');

    const claimReward = () => {
      const newBalance = Number((balance + 0.0005).toFixed(5));
      const newCompleted = [...completed, id];
      
      setBalance(newBalance);
      setCompleted(newCompleted);
      
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { 
        balance: newBalance, 
        completed: newCompleted 
      });
      alert("Reward Received! +0.0005 TON");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(claimReward).catch(() => setTimeout(claimReward, 5000));
    } else {
      setTimeout(claimReward, 5000);
    }
  };

  const handleAdminAddTask = () => {
    if (!newTask.name || !newTask.link) return alert("အချက်အလက်ဖြည့်ပါ");
    const taskId = 'task_' + Date.now();
    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ ...newTask, id: taskId })
    }).then(res => res.ok && window.location.reload());
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px' }
  };

  // --- Loading Screen ---
  if (loading) return (
    <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', flexDirection:'column'}}>
      <div style={{border: '4px solid #000', borderTop: '4px solid #fff', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite'}}></div>
      <b style={{marginTop: '10px'}}>SYNCING WITH DATABASE...</b>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

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
              (t !== 'admin' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t.toUpperCase()}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot" },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot" },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot" }
            ].concat(customTasks.filter(t => t.type === 'bot'))
             .map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                {completed.includes(t.id) ? 
                  <span style={{color:'green', fontWeight:'900'}}>DONE</span> : 
                  <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '10px'}}>START</button>
                }
              </div>
            ))}

            {activeTab === 'social' && [
              { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
              { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
            ].concat(customTasks.filter(t => t.type === 'social'))
             .map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                {completed.includes(t.id) ? 
                  <span style={{color:'green', fontWeight:'900'}}>JOINED</span> : 
                  <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '80px', padding: '10px'}}>JOIN</button>
                }
              </div>
            ))}
            
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <button style={styles.yellowBtn} onClick={handleAdminAddTask}>SAVE TASK</button>
              </div>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Code" value={rewardInput} onChange={e => setRewardInput(e.target.value)} />
                <button style={styles.yellowBtn} onClick={() => { if(rewardInput==='EASY1'){ const newB = balance+0.0005; setBalance(newB); syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {balance:newB}); alert("Success!"); } else { alert("Invalid!"); } }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Navigation */}
      <div style={styles.navBar}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navBtn(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
