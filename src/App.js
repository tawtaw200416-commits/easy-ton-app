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
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // New: Data Lock
  
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
    if (!isDataLoaded) return; // Load မပြီးခင် database ထဲ ပြန်မရေးအောင် တားထားခြင်း
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  // --- Admin Save Task ---
  const handleAdminAddTask = () => {
    if (!newTask.name || !newTask.link) return alert("အချက်အလက်ဖြည့်ပါ");
    const taskId = 'task_' + Date.now();
    
    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ ...newTask, id: taskId })
    }).then((res) => {
      if(res.ok) {
        alert("Task အသစ်ထည့်ပြီးပါပြီ!");
        setNewTask({ name: '', link: '', type: 'bot' });
        // Local state update to avoid reload
        setCustomTasks(prev => [...prev, { ...newTask, id: taskId }]);
      }
    });
  };

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

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
        
        setIsDataLoaded(true); // Data load ပြီးကြောင်း သတ်မှတ်
        setLoading(false);
      } catch (error) {
        console.error("Data Sync Error", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = (text, label) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert(`${label} Copied!`);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const newHistory = [{ id: Date.now(), amount, status: 'Pending' }, ...withdrawHistory];
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, withdrawHistory: newHistory });
      alert("Withdraw success! Pending for approval.");
      setWithdrawAmount('');
    } else { alert("Insufficient Balance (Min 0.1)"); }
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
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' },
    planBtn: (active) => ({ flex: 1, padding: '10px', border: '2px solid #000', borderRadius: '10px', backgroundColor: active ? '#000' : '#fff', color: active ? '#fff' : '#000', fontSize: '10px', fontWeight: 'bold' }),
    warning: { background: '#fff1f2', color: '#e11d48', padding: '15px', borderRadius: '15px', border: '1px solid #f43f5e', fontSize: '11px', marginTop: '10px' },
    badge: { background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }
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
            ].concat(customTasks.filter(t => t.type === 'bot')).map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                {completed.includes(t.id) ? 
                  <span style={styles.badge}>DONE</span> : 
                  <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button>
                }
              </div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
                ].concat(customTasks.filter(t => t.type === 'social')).map(t => (
                  <div key={t.id} style={styles.row}>
                    <b>{t.name}</b>
                    {completed.includes(t.id) ? 
                      <span style={styles.badge}>JOINED</span> : 
                      <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button>
                    }
                  </div>
                ))}
              </>
            )}

            {showAddTask && (
              <div>
                <h3 style={{marginTop:0}}>Promote Ad (Views)</h3>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Channel Link" />
                <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                  {['100','200','300'].map(v => (
                    <button key={v} onClick={() => setSelectedPlan(v)} style={styles.planBtn(selectedPlan === v)}>{v} Views<br/>{v==='100'?'0.2':v==='200'?'0.4':'0.5'} TON</button>
                  ))}
                </div>
                <div style={styles.copyBox}>
                  <small>ADMIN WALLET:</small>
                  <p style={{fontSize:10, fontWeight:'bold', wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</p>
                  <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET, "Wallet")} style={{fontSize:10}}>COPY</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{marginTop:0}}>ADMIN: ADD NEW TASK</h3>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.yellowBtn} onClick={handleAdminAddTask}>SAVE TO DATABASE</button>
              </div>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.yellowBtn} onClick={() => { 
                  if(rewardInput==='EASY1'){ 
                    const newBal = Number((balance + 0.005).toFixed(5)); 
                    setBalance(newBal); 
                    syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {balance: newBal}); 
                    alert("Reward Claimed!"); setRewardInput(''); 
                  } else { alert("Invalid Code!"); } 
                }}>CLAIM</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>INVITE & EARN</h2>
          <div style={styles.copyBox}>
            <small>REFERRAL LINK:</small>
            <p style={{fontSize:12, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:20}}><span>Total Invites:</span><strong>{referralCount} Users</strong></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3 style={{marginTop:0}}>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <h4 style={{marginTop:20}}>HISTORY</h4>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0, marginBottom:20}}>USER PROFILE</h2>
          <div style={styles.row}><span>UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Status:</span><span style={{color:'#10b981'}}>VERIFIED</span></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
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
