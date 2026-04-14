import React, { useState, useEffect, useRef } from 'react';

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
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Safety Lock
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddTask, setShowAddTask] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // --- Firebase Sync with Lock ---
  const syncToFirebase = (path, data) => {
    if (!isDataLoaded) return; // Load မပြီးခင် Database ထဲ ဘာမှမရေးအောင် တားထားခြင်း
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
    }).then(() => {
      alert("Task Added!");
      setNewTask({ name: '', link: '', type: 'bot' });
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    Promise.all([
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`).then(res => res.json()),
      fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`).then(res => res.json())
    ]).then(([userData, tasksData]) => {
      if (userData) {
        setBalance(userData.balance || 0);
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferralCount(userData.referralCount || 0);
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));
      
      setIsDataLoaded(true); // ဒေတာတွေအကုန် load ပြီးမှ lock ဖွင့်မည်
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCopy = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("Copied!");
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && amount <= balance) {
      const newBalance = Number((balance - amount).toFixed(5));
      const newHistory = [{ id: Date.now(), amount, status: 'Pending', uid: APP_CONFIG.MY_UID }, ...withdrawHistory];
      setBalance(newBalance);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, withdrawHistory: newHistory });
      alert("Withdraw Requested!");
      setWithdrawAmount('');
    } else { alert("Insufficient Balance (Min 0.1)"); }
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    setTimeout(() => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
        alert("Reward Received! +0.0005 TON");
      }
    }, 5000);
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SECURITY SYNCING...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
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
            ].concat(customTasks.filter(t => t.type === 'bot')).filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px'}}>START</button></div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's3', name: "@cryptogold_online", link: "https://t.me/cryptogold_online_official" },
                  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
                  { id: 's5', name: "@USDTcloudminer", link: "https://t.me/USDTcloudminer_channel" },
                  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
                  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
                  { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
                  { id: 's11', name: "Sponsor 1", link: "https://t.me/easytonfree" },
                  { id: 's12', name: "Sponsor 2", link: "https://t.me/easytonfree" },
                  { id: 's13', name: "Sponsor 3", link: "https://t.me/easytonfree" },
                  { id: 's14', name: "Sponsor 4", link: "https://t.me/easytonfree" }
                ].concat(customTasks.filter(t => t.type === 'social')).filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {showAddTask && (
              <div>
                <h3>Promote Channel</h3>
                <input style={styles.input} placeholder="Channel Name" />
                <input style={styles.input} placeholder="Link" />
                <div style={styles.copyBox}>
                   <small>ADMIN WALLET:</small><br/>
                   <b>{APP_CONFIG.ADMIN_WALLET}</b>
                   <button onClick={() => handleCopy(APP_CONFIG.ADMIN_WALLET)}>COPY</button>
                </div>
                <button style={styles.yellowBtn} onClick={() => window.open("https://t.me/GrowTeaNews")}>SEND PROOF</button>
              </div>
            )}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Reward Code" value={rewardInput} onChange={e => setRewardInput(e.target.value)} />
                <button style={styles.yellowBtn} onClick={() => {
                  if(rewardInput === 'FREE500') {
                    const nb = balance + 0.005; setBalance(nb);
                    syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: nb });
                    alert("Reward Claimed!"); setRewardInput('');
                  } else { alert("Wrong Code!"); }
                }}>CLAIM</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                   <option value="bot">BOT</option>
                   <option value="social">SOCIAL</option>
                </select>
                <button style={styles.yellowBtn} onClick={handleAdminAddTask}>ADD TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>INVITE</h2>
          <div style={styles.copyBox}>
            <p>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button style={styles.yellowBtn} onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)}>COPY LINK</button>
          </div>
          <p>Invites: {referralCount}</p>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.yellowBtn} onClick={handleWithdraw}>WITHDRAW</button>
          {withdrawHistory.map((h, i) => (
            <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
          ))}
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>PROFILE</h2>
          <div style={styles.row}><span>UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Balance:</span><b>{balance.toFixed(5)}</b></div>
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
