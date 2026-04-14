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
  const [loading, setLoading] = useState(true);
  
  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });

  // Data သိမ်းတဲ့ function ကို ပိုစိတ်ချရအောင် PATCH သုံးထားတယ် (ရှိပြီးသားကို မဖျက်ဘူး)
  const syncToFirebase = useCallback(async (path, data) => {
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (e) { console.error("Firebase Sync Error:", e); }
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const initApp = async () => {
      setLoading(true); // Data မရမချင်း App ကို loading ပြထားမယ်
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);

        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          // Firebase မှာ အဟောင်းရှိရင် အဟောင်းအတိုင်း အတိအကျ ပြန်ယူမယ်
          setBalance(Number(userData.balance) || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        } else {
          // လုံးဝမရှိသေးတဲ့ User အသစ်မှသာ Initial data တည်ဆောက်မယ်
          const initialData = { balance: 0, completed: [], withdrawHistory: [], referralCount: 0, uid: APP_CONFIG.MY_UID };
          await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, initialData);
        }

        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { 
        console.error("Init Error:", e);
        alert("Network Error! Please restart the app.");
      } finally {
        setLoading(false); // Data အကုန်ရပြီဆိုမှ ပေးပွင့်မယ်
      }
    };

    initApp();
  }, [syncToFirebase]);

  const handleTaskAction = (id, link) => {
    if (completed.includes(id)) return alert("Already done!");
    window.open(link, '_blank');
    
    const finalizeTask = () => {
      setBalance(prev => {
        const newBal = Number((prev + 0.0005).toFixed(5));
        setCompleted(prevComp => {
          const newComp = [...prevComp, id];
          // Firebase ကို အမြန်သိမ်းမယ်
          syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
          return newComp;
        });
        return newBal;
      });
      alert("Reward +0.0005 TON Success!");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(finalizeTask).catch(() => setTimeout(finalizeTask, 5000));
    } else { setTimeout(finalizeTask, 5000); }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount >= 0.1 && balance >= amount) {
      const newBal = Number((balance - amount).toFixed(5));
      const newHist = [{ id: Date.now(), amount, status: 'Pending', date: new Date().toLocaleString() }, ...withdrawHistory];
      
      setBalance(newBal);
      setWithdrawHistory(newHist);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, withdrawHistory: newHist });
      setWithdrawAmount('');
      alert("Withdrawal Request Submitted!");
    } else { alert("Min 0.1 TON or Insufficient Balance!"); }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0', zIndex: 100 },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '11px', fontWeight: 'bold' }),
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' }
  };

  const staticBotTasks = [
    { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_" + APP_CONFIG.MY_UID },
    { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=" + APP_CONFIG.MY_UID },
    { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=" + APP_CONFIG.MY_UID },
    { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=" + APP_CONFIG.MY_UID }
  ];

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15', fontSize:'18px', fontWeight:'bold'}}>SYNCING DATA...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● VERIFIED ACCOUNT</div>
      </div>

      {activeNav === 'earn' && (
        <div style={styles.card}>
          <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
            {['BOT', 'SOCIAL', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{flex:1, padding:'10px', borderRadius:'10px', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#eee', color: activeTab === t.toLowerCase() ? '#fff' : '#000', border:'none', fontWeight:'bold'}}>{t}</button>
               )
            ))}
          </div>
          {activeTab === 'bot' && staticBotTasks.map(t => (
            <div key={t.id} style={styles.row}>
              <b>{t.name}</b>
              <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px', border:'none', opacity: completed.includes(t.id) ? 0.4 : 1}}>
                {completed.includes(t.id) ? 'DONE' : 'START'}
              </button>
            </div>
          ))}
          {/* Custom tasks as well */}
          {activeTab === 'social' && customTasks.filter(ct => ct.type === 'social').map(t => (
            <div key={t.id} style={styles.row}>
              <b>{t.name}</b>
              <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{backgroundColor:'#000', color:'#fff', padding:'8px 15px', borderRadius:'10px', border:'none'}}>{completed.includes(t.id) ? 'DONE' : 'JOIN'}</button>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW FUNDS</h3>
          <input style={styles.input} type="number" placeholder="Min 0.1 TON" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button style={styles.btn} onClick={handleWithdraw}>WITHDRAW NOW</button>
          <div style={{marginTop:20}}>
            <h4>HISTORY</h4>
            {withdrawHistory.map(h => (
              <div key={h.id} style={styles.row}><span>{h.amount} TON</span><span style={{color:'orange'}}>{h.status}</span></div>
            ))}
          </div>
        </div>
      )}

      {activeNav === 'profile' && (
        <div style={styles.card}>
          <h2 style={{textAlign:'center'}}>USER PROFILE</h2>
          <div style={styles.row}><span>UID:</span><b>{APP_CONFIG.MY_UID}</b></div>
          <div style={styles.row}><span>Account:</span><b style={{color:'#10b981'}}>PREMIUM</b></div>
          <div style={styles.row}><span>Balance:</span><b>{balance.toFixed(5)} TON</b></div>
          <div style={styles.row}><span>Referrals:</span><b>{referralCount}</b></div>
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
