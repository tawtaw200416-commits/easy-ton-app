import React, { useState, useEffect } from 'react';

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
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Safety Guard

  const [customTasks, setCustomTasks] = useState([]); 
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');

  // --- Secure Sync Function ---
  const syncToFirebase = (path, data) => {
    // Data load လုပ်မပြီးသေးရင် Database ထဲကို လုံးဝ (လုံးဝ) ပြန်မရေးဖို့ တားထားတာပါ
    if (!isDataLoaded) return; 
    fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }

    const initData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (userData) {
          // Firebase မှာရှိတဲ့ Data အဟောင်းကို အရင်ယူမယ်
          setBalance(userData.balance || 0);
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferralCount(userData.referralCount || 0);
        }

        if (tasksData) setCustomTasks(Object.values(tasksData));
        
        // Data ဆွဲလို့ပြီးမှသာ Safety Guard ကို ဖွင့်ပေးမယ်
        setIsDataLoaded(true);
        setLoading(false);
      } catch (e) {
        console.error("Sync Error:", e);
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleTaskAction = (id, link) => {
    if (!isDataLoaded || completed.includes(id)) return;
    window.open(link, '_blank');

    const claimReward = () => {
      const newBalance = Number((balance + 0.0005).toFixed(5));
      const newCompleted = [...completed, id];
      
      setBalance(newBalance);
      setCompleted(newCompleted);
      
      // ဒီမှာမှ Database ကို Update လုပ်မယ်
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBalance, completed: newCompleted });
      alert("Reward Added! +0.0005 TON");
    };

    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(claimReward).catch(() => setTimeout(claimReward, 3000));
    } else {
      setTimeout(claimReward, 5000);
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '25px', marginBottom: '12px', border: '3px solid #000', boxShadow: '5px 5px 0px #000' },
    header: { textAlign: 'center', background: '#000', color: '#fff', padding: '30px', borderRadius: '30px', marginBottom: '20px', border: '4px solid #fff' },
    btn: { backgroundColor: '#000', color: '#fff', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: '900', width: '100%' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0', borderTop: '4px solid #fff' }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>PLEASE WAIT...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{color:'#facc15', letterSpacing:'1px'}}>TOTAL BALANCE</small>
        <h1 style={{fontSize:'45px', margin:'10px 0'}}>{balance.toFixed(5)} <span style={{fontSize:'15px'}}>TON</span></h1>
      </div>

      <div style={styles.card}>
        <div style={{display:'flex', gap:'8px', marginBottom:'20px'}}>
          {['bot', 'social'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{flex:1, padding:'12px', borderRadius:'15px', border:'2px solid #000', background: activeTab===t?'#000':'#fff', color: activeTab===t?'#fff':'#000', fontWeight:'bold'}}>{t.toUpperCase()}</button>
          ))}
        </div>

        {(activeTab === 'bot' ? [
          { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot" },
          { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot" },
          { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot" },
          { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot" }
        ].concat(customTasks.filter(t => t.type === 'bot')) : [
          { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
          { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" }
        ].concat(customTasks.filter(t => t.type === 'social'))).map(t => (
          <div key={t.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #eee'}}>
            <b style={{fontSize:'14px'}}>{t.name}</b>
            <button onClick={() => handleTaskAction(t.id, t.link)} disabled={completed.includes(t.id)} style={{...styles.btn, width:'80px', fontSize:'12px', background: completed.includes(t.id)?'#ccc':'#000'}}>
              {completed.includes(t.id) ? 'DONE' : 'START'}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav===n?'#facc15':'#fff', fontWeight:'bold', fontSize:'11px'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
