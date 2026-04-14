import React, { useState, useEffect, useRef } from 'react';

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
  
  // 🛡️ Safety Lock: Firebase က data တွေ ရောက်လာမှ true ဖြစ်မယ်
  const isDataLoaded = useRef(false);

  const [customTasks, setCustomTasks] = useState([]); 
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // --- Database Sync (Lock ပါဝင်သည်) ---
  const syncToFirebase = (path, data) => {
    // Data load မပြီးသေးရင် database ထဲကို ဘာမှ အစားမထိုးဖို့ တားထားခြင်း
    if (!isDataLoaded.current) return; 
    
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    
    const initApp = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        // 📥 ID ရှိပြီးသား လူဆိုရင် data ဟောင်းတွေ ပြန်ယူမယ်
        if (userData) {
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        } else {
          // ID အသစ်ဆိုရင် အသစ်တစ်ခု ဆောက်ပေးမယ်
          await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
            method: 'PUT',
            body: JSON.stringify({ balance: 0, completed: [], referralCount: 0 })
          });
        }
        
        if (tasksData) {
          setCustomTasks(Object.values(tasksData));
        }

        // ✅ အချက်အလက် အကုန်ရပြီဆိုမှ Lock ဖွင့်ပြီး Loading ပိတ်မယ်
        isDataLoaded.current = true;
        setLoading(false);
      } catch (e) { 
        console.error(e);
        setLoading(false); 
      }
    };
    initApp();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    const completeTask = () => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newCompleted = [...completed, id];
        setBalance(newBalance);
        setCompleted(newCompleted);
        
        // Lock ပွင့်နေမှသာ database ကို update လုပ်မယ်
        syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { 
          balance: newBalance, 
          completed: newCompleted 
        });
        alert("Reward Received! +0.0005 TON");
      }
    };
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show().then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    promoBox: { backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px', border: '1px dashed #000', margin: '10px 0' },
    copyBtnSmall: { backgroundColor: '#facc15', border: '1px solid #000', borderRadius: '5px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', marginLeft: '5px' }
  };

  const allBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const allSocialTasks = [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>SYNCING DATA...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED ACCOUNT</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => {setActiveTab(t.toLowerCase()); setShowAddPromo(false);}} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                {completed.includes(t.id) ? <span style={{color:'green', fontWeight:'900'}}>DONE</span> : <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button>}
              </div>
            ))}

            {activeTab === 'social' && allSocialTasks.map(t => (
              <div key={t.id} style={styles.row}>
                <b>{t.name}</b>
                {completed.includes(t.id) ? <span style={{color:'green', fontWeight:'900'}}>JOINED</span> : <button onClick={() => handleTaskAction(t.id, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button>}
              </div>
            ))}
            
            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Promo Code" value={rewardInput} onChange={(e) => setRewardInput(e.target.value)} />
                <button style={styles.btn} onClick={() => {
                  if(rewardInput === 'EASY2') {
                     const newBal = Number((balance + 0.001).toFixed(5));
                     setBalance(newBal);
                     syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: [...completed, 'CODE_EASY2'] });
                     alert("Success! +0.001 TON Added!"); setRewardInput('');
                  } else { alert("Invalid Code!"); }
                }}>CLAIM CODE</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={styles.btn} onClick={() => {
                  const taskId = 'task_' + Date.now();
                  syncToFirebase(`global_tasks/${taskId}`, {...newTask, id: taskId}).then(() => {
                    alert("Task Added!");
                    window.location.reload();
                  });
                }}>PUBLISH TASK</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>REFERRAL</h2>
          <div style={styles.promoBox}>
            <small>YOUR LINK:</small>
            <p style={{fontSize:11, fontWeight:'bold', wordBreak:'break-all'}}>{`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`}</p>
            <button onClick={() => handleCopy(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`)} style={styles.btn}>COPY LINK</button>
          </div>
          <div style={{textAlign:'center', marginTop:10}}>Total Referrals: <b>{referralCount}</b></div>
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={() => {
            const amt = parseFloat(withdrawAmount);
            if(amt >= 0.1 && balance >= amt) {
              const nb = Number((balance - amt).toFixed(5));
              const nh = [{id: Date.now(), amount: amt, status: 'Pending'}, ...withdrawHistory];
              setBalance(nb); setWithdrawHistory(nh);
              syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {balance: nb, withdrawHistory: nh});
              alert("Withdrawal submitted!"); setWithdrawAmount('');
            } else { alert("Insufficient balance or Min 0.1 TON!"); }
          }}>WITHDRAW NOW</button>
          <div style={{marginTop: 20}}>
            <h4>HISTORY</h4>
            {withdrawHistory.map((h, i) => (
              <div key={i} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center', marginTop:0}}>PROFILE</h2>
          <div style={styles.row}><span>User UID:</span><strong>{APP_CONFIG.MY_UID}</strong></div>
          <div style={styles.row}><span>Balance:</span><strong>{balance.toFixed(5)} TON</strong></div>
          <button style={{...styles.yellowBtn, marginTop: '20px', padding: '10px', width:'100%'}} onClick={() => window.location.reload()}>REFRESH DATA</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
