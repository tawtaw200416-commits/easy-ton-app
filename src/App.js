import React, { useState, useEffect, useCallback } from 'react';

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
  const [loading, setLoading] = useState(true); // Loading Lock
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // Data သိမ်းတဲ့ function (PATCH သုံးထားလို့ ရှိပြီးသား data ကို မဖျက်ပါဘူး)
  const syncToFirebase = useCallback(async (path, data) => {
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (e) { console.error("Sync Error:", e); }
  }, []);

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

        if (userData) {
          // Firebase မှာရှိတဲ့ data အဟောင်းတွေကို အကုန်ပြန်ဆွဲထုတ်မယ်
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        } else {
          // User အသစ်ဆိုရင်မှ data အသစ်တည်ဆောက်မယ်
          await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, {
            balance: 0, completed: [], withdrawHistory: [], referralCount: 0, uid: APP_CONFIG.MY_UID
          });
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error("Initialization Error:", e); }
      
      // Data အကုန် ရောက်ပြီဆိုမှ App ကို Load လုပ်မယ်
      setLoading(false);
    };

    initApp();
  }, [syncToFirebase]);

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    window.open(link, '_blank');
    
    const completeTask = () => {
      // Prev state ကို သုံးပြီး update လုပ်တာကြောင့် data မပျောက်ပါဘူး
      setBalance(prevBal => {
        const newBal = Number((prevBal + 0.0005).toFixed(5));
        setCompleted(prevComp => {
          const newComp = [...prevComp, id];
          syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
          return newComp;
        });
        return newBal;
      });
      alert("Reward Added!");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(completeTask).catch(() => setTimeout(completeTask, 5000));
    } else { setTimeout(completeTask, 5000); }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && balance >= amount) {
      const newBal = Number((balance - amount).toFixed(5));
      const newHistory = [{ id: Date.now(), amount, status: 'Pending', date: new Date().toLocaleDateString() }, ...withdrawHistory];
      
      setBalance(newBal);
      setWithdrawHistory(newHistory);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHistory });
      setWithdrawAmount('');
      alert("Withdrawal Pending!");
    } else {
      alert("Insufficient balance or min 0.1 TON!");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', fontWeight:'bold'}}>LOADING SECURE DATA...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#eee', color: activeTab === t.toLowerCase() ? '#fff' : '#000' }}>{t}</button>
              )
            ))}
          </div>
          {/* Task List Rendering... */}
          {[...customTasks].map(t => (
            <div key={t.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', alignItems:'center'}}>
              <span>{t.name}</span>
              <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{padding:'5px 15px', borderRadius:'10px', backgroundColor:'#000', color:'#fff'}}>{completed.includes(t.id) ? 'DONE' : 'START'}</button>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW</h3>
          <input style={styles.input} type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.1" />
          <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <div style={{marginTop:'20px'}}>
            <h4>HISTORY</h4>
            {withdrawHistory.map(h => (
              <div key={h.id} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'10px 0'}}>
                <span>{h.amount} TON</span>
                <span style={{color:'orange'}}>{h.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>USER PROFILE</h2>
          <p><b>UID:</b> {APP_CONFIG.MY_UID}</p>
          <p><b>Balance:</b> {balance.toFixed(5)} TON</p>
          <p><b>Tasks Completed:</b> {completed.length}</p>
          <p><b>Referrals:</b> {referralCount}</p>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
