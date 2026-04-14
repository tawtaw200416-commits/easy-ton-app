import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  ADMIN_UID: "7406691453", 
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  ADSGRAM_BLOCK_ID: "27633", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com" 
};

// Bro ပေးထားတဲ့ Bot & Social Lists
const STATIC_BOTS = [
  { id: 'b1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
  { id: 'b2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  { id: 'b3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
  { id: 'b4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
  { id: 'b5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
  { id: 'b6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" }
];

const STATIC_SOCIALS = [
  { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
  { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
  { id: 's3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
  { id: 's4', name: "@M9460", link: "https://t.me/M9460" },
  { id: 's5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
  { id: 's6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
  { id: 's7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
  { id: 's8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
  { id: 's9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
  { id: 's10', name: "@easytonfree", link: "https://t.me/easytonfree" },
  { id: 's11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
  { id: 's12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
  { id: 's13', name: "@zrbtua", link: "https://t.me/zrbtua" },
  { id: 's14', name: "@perviu1million", link: "https://t.me/perviu1million" }
];

function App() {
  const [balance, setBalance] = useState(0.0000);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  
  // Add Task State
  const [taskForm, setTaskForm] = useState({ name: '', link: '', package: '0.2' });

  const updateFirebase = (newData) => {
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify(newData)
    });
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBalance(data.balance || 0);
          setCompleted(data.completed || []);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const handleTaskAction = (id, link) => {
    window.open(link, '_blank');
    setTimeout(() => {
      if (!completed.includes(id)) {
        const newBalance = Number((balance + 0.0005).toFixed(5));
        const newComp = [...completed, id];
        setBalance(newBalance);
        setCompleted(newComp);
        updateFirebase({ balance: newBalance, completed: newComp });
        alert("Reward: +0.0005 TON Received!");
      }
    }, 5000);
  };

  const handlePaymentSubmit = () => {
    if(!taskForm.name || !taskForm.link) return alert("အချက်အလက်ပြည့်စုံစွာဖြည့်ပါ");
    // Admin ဆီသို့ Firebase သို့မဟုတ် Telegram ကတစ်ဆင့် အကြောင်းကြားစာပို့သည့် Logic
    const paymentData = {
      ...taskForm,
      user: APP_CONFIG.MY_UID,
      status: 'Pending Verification',
      timestamp: Date.now()
    };
    fetch(`${APP_CONFIG.FIREBASE_URL}/ad_requests.json`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    }).then(() => {
      alert("Admin ဆီသို့ ပေးချေမှုသတင်းပို့ပြီးပါပြီ။ စစ်ဆေးပြီးပါက Task ပေါ်လာပါမည်။");
      setTaskForm({ name: '', link: '', package: '0.2' });
    });
  };

  const styles = {
    main: { backgroundColor: '#facc15', color: '#000', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000' },
    header: { textAlign: 'center', background: '#000', color: '#fff', padding: '20px', borderRadius: '25px', marginBottom: '15px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontWeight: 'bold', fontSize: '12px' })
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#facc15'}}><b>LOADING...</b></div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small>BALANCE</small>
        <h1 style={{margin:0}}>{balance.toFixed(5)} TON</h1>
      </div>

      <div style={{display:'flex', gap: '5px', marginBottom: '15px'}}>
        {['bot', 'social', 'add task'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{...styles.btn, flex: 1, backgroundColor: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', border: '2px solid #000'}}>{t.toUpperCase()}</button>
        ))}
      </div>

      <div style={styles.card}>
        {activeTab === 'bot' && STATIC_BOTS.filter(b => !completed.includes(b.id)).map(b => (
          <div key={b.id} style={styles.row}><span>{b.name}</span><button onClick={() => handleTaskAction(b.id, b.link)} style={{...styles.btn, width: '80px'}}>START</button></div>
        ))}

        {activeTab === 'social' && STATIC_SOCIALS.filter(s => !completed.includes(s.id)).map(s => (
          <div key={s.id} style={styles.row}><span>{s.name}</span><button onClick={() => handleTaskAction(s.id, s.link)} style={{...styles.btn, width: '80px'}}>JOIN</button></div>
        ))}

        {activeTab === 'add task' && (
          <div>
            <h3 style={{marginTop:0}}>Promote Your Project</h3>
            <input style={styles.input} placeholder="Task Name" value={taskForm.name} onChange={e => setTaskForm({...taskForm, name: e.target.value})} />
            <input style={styles.input} placeholder="Link (https://...)" value={taskForm.link} onChange={e => setTaskForm({...taskForm, link: e.target.value})} />
            <select style={styles.input} value={taskForm.package} onChange={e => setTaskForm({...taskForm, package: e.target.value})}>
              <option value="0.2">100 Clicks - 0.2 TON</option>
              <option value="0.4">200 Clicks - 0.4 TON</option>
              <option value="0.5">300 Clicks - 0.5 TON</option>
            </select>
            
            <div style={{background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px dashed #000', marginBottom: '10px', fontSize: '13px'}}>
              <p style={{margin: '5px 0'}}><b>TON Address:</b> <br/><small style={{wordBreak:'break-all'}}>{APP_CONFIG.ADMIN_WALLET}</small></p>
              <p style={{margin: '5px 0', color: 'red'}}><b>Required MEMO:</b> {APP_CONFIG.MY_UID}</p>
              <small>*Memo မပါလျှင် Task တက်လာမည်မဟုတ်ပါ။</small>
            </div>
            
            <button style={styles.btn} onClick={handlePaymentSubmit}>I HAVE PAID ({taskForm.package} TON)</button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
