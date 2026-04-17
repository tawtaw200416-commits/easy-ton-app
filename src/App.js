import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [customTasks, setCustomTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot', reward: 0.001 });

  // Fetch Custom Tasks from Firebase
  useEffect(() => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      .then(res => res.json())
      .then(data => {
        if (data) setCustomTasks(Object.values(data));
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
  }, [balance, completed]);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  // --- အဆင့်မြှင့်ထားသော Ads Logic ---
  const showAdAndClaim = (reward, taskId, link = null) => {
    if (isAdLoading) return;

    if (!window.Adsgram) {
      alert("Ads SDK Loading... Please wait a second.");
      return;
    }

    setIsAdLoading(true);
    const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });

    AdController.show()
      .then(() => {
        setIsAdLoading(false);
        const newBal = Number((balance + reward).toFixed(5));
        const newComp = [...completed, taskId];
        setBalance(newBal);
        setCompleted(newComp);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
        
        if (link) window.open(link, '_blank');
        alert(`✅ Reward Claimed: +${reward} TON`);
      })
      .catch((err) => {
        setIsAdLoading(false);
        alert("Ad not finished or Error. No reward added.");
        console.error(err);
      });
  };

  // --- Admin: Task အသစ် ထည့်သွင်းရန် Function ---
  const handleCreateTask = () => {
    if (!newTask.name || !newTask.link) return alert("Fill all fields!");
    const id = "task_" + Date.now();
    const taskData = { ...newTask, id };
    
    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    }).then(() => {
      alert("Task Added Successfully!");
      setCustomTasks([...customTasks, taskData]);
      setNewTask({ name: '', link: '', type: 'bot', reward: 0.001 });
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '11px' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' },
    select: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '38px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
        <div style={{fontSize:10, color: isAdLoading ? '#fbbf24' : '#10b981'}}>● {isAdLoading ? "SHOWING AD..." : "ACTIVE STATUS"}</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => showAdAndClaim(0.0002, 'video_ad_' + Date.now())} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+0.0002 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && customTasks.filter(t => t.type === 'bot' && !completed.includes(t.id)).map(t => (
              <div key={t.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <b>{t.name}</b>
                <button onClick={() => showAdAndClaim(t.reward, t.id, t.link)} style={{...styles.btn, width:'80px', padding:'8px'}}>START</button>
              </div>
            ))}

            {activeTab === 'social' && customTasks.filter(t => t.type === 'social' && !completed.includes(t.id)).map(t => (
              <div key={t.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                <b>{t.name}</b>
                <button onClick={() => showAdAndClaim(t.reward, t.id, t.link)} style={{...styles.btn, width:'80px', padding:'8px'}}>JOIN</button>
              </div>
            ))}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4 style={{marginTop:0}}>ADD NEW TASK</h4>
                <input style={styles.input} placeholder="Task Name (e.g. Join News)" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://t.me/...)" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.select} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">Bot Task</option>
                  <option value="social">Social Task</option>
                </select>
                <input style={styles.input} type="number" placeholder="Reward (e.g. 0.001)" value={newTask.reward} onChange={e => setNewTask({...newTask, reward: Number(e.target.value)})} />
                <button style={{...styles.btn, backgroundColor:'#22c55e'}} onClick={handleCreateTask}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
