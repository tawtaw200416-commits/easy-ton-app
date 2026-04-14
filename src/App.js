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
  const [referralList, setReferralList] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const initApp = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
          setReferralList(userData.referralList || []);

          // --- Automatic Referral Reward Logic ---
          // URL ကနေ referral link နဲ့ ဝင်လာတာကို စစ်ဆေးတာ (Telegram Start Param)
          const urlParams = new URLSearchParams(window.location.search);
          const referrerId = urlParams.get('tgWebAppStartParam');
          
          if (referrerId && !userData.hasBeenReferred) {
            handleNewReferral(referrerId);
          }
        }
        
        if (tasksData) {
          setCustomTasks(Object.values(tasksData));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleNewReferral = async (refId) => {
    try {
      // ၁။ Referrer (ဖိတ်ခေါ်သူ) ရဲ့ data ကို ယူမယ်
      const res = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${refId}.json`);
      const refData = await res.json();

      if (refData) {
        const newRefBalance = Number((refData.balance + 0.0005).toFixed(5));
        const newRefList = [...(refData.referralList || []), { uid: APP_CONFIG.MY_UID, date: Date.now() }];
        const newRefCount = (refData.referralCount || 0) + 1;

        // Referrer ရဲ့ balance နဲ့ list ကို update လုပ်မယ်
        await syncToFirebase(`users/${refId}`, {
          balance: newRefBalance,
          referralList: newRefList,
          referralCount: newRefCount
        });

        // ကိုယ့်ကိုယ်ကို reward ရပြီးသားလို့ မှတ်သားမယ်
        await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { hasBeenReferred: true });
      }
    } catch (e) { console.error("Referral Error:", e); }
  };

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
        alert("Reward Received! +0.0005 TON");
      }
    };
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show().then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    headerCard: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    yellowBtn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    navBar: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 1000 },
    navBtn: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: '900' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    copyBox: { background: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', marginBottom: '10px', position: 'relative' },
    copyBtn: { position: 'absolute', right: '10px', top: '10px', padding: '5px 10px', fontSize: '10px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '5px' },
    badge: { background: '#10b981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.headerCard}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:'18px', color: '#facc15'}}>TON</span></h1>
        <div style={{display:'flex', justifyContent:'center'}}><span style={styles.badge}>● ACCOUNT ACTIVE</span></div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['BOTS', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddTask(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: '900', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && [
              { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
              { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
              { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
              { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
              { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
            ].concat(customTasks.filter(t => t.type === 'bot')).filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>START</button></div>
            ))}

            {activeTab === 'social' && !showAddTask && (
              <>
                <button onClick={() => setShowAddTask(true)} style={{...styles.yellowBtn, backgroundColor: '#facc15', color: '#000', marginBottom: '20px', border: '2px solid #000'}}>+ ADD TASK (PROMOTE)</button>
                {[
                  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
                  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
                  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
                  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
                ].concat(customTasks.filter(t => t.type === 'social')).filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.yellowBtn, width: '90px', padding: '10px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {/* Admin Add Task Section */}
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{marginTop:0, textAlign: 'center'}}>ADD NEW TASK</h3>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://...)" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={{...styles.input, appearance: 'none', background: '#fff'}} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.yellowBtn} onClick={() => {
                    if (!newTask.name || !newTask.link) return alert("Fill all fields");
                    const id = 'task_' + Date.now();
                    fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${id}.json`, { 
                      method: 'PUT', 
                      body: JSON.stringify({...newTask, id}) 
                    }).then(() => { 
                      alert("Saved!"); 
                      setNewTask({ name: '', link: '', type: 'bot' });
                      window.location.reload(); 
                    });
                }}>SAVE TO DATABASE</button>
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
            <p style={{fontSize:11, fontWeight:'bold'}}>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`, "Link")} style={styles.yellowBtn}>COPY LINK</button>
          </div>
          <div style={{marginTop:20}}>
            <h4>Invited History ({referralCount})</h4>
            {referralList.length > 0 ? [...referralList].reverse().map((ref, i) => (
              <div key={i} style={styles.row}>
                <span>User ID: {ref.uid}</span>
                <span style={{color:'#10b981', fontWeight:'bold'}}>+0.0005 TON</span>
              </div>
            )) : <small style={{color:'#666'}}>Share your link to grow your history!</small>}
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
