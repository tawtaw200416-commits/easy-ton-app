import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", // သင့် UID
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY3",
  REWARD_AMT: 0.001,
  VIDEO_REWARD: 0.0005,
  MIN_WITHDRAW: 0.1
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: '', link: '' });
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // Firebase မှ Global Tasks နှင့် User Data များကို Sync လုပ်ခြင်း
  const fetchData = useCallback(async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
        fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
      ]);
      
      const userData = await userRes.json();
      const tasksData = await tasksRes.json();
      
      if (userData) {
        setBalance(Number(userData.balance || 0));
        setCompleted(userData.completed || []);
        setWithdrawHistory(userData.withdrawHistory || []);
        setReferrals(userData.referrals || []);
      }
      
      // Admin ထည့်ထားသော Task များကို Array အဖြစ်ပြောင်းလဲခြင်း
      if (tasksData) {
        const tasksArray = Object.keys(tasksData).map(key => ({
          ...tasksData[key],
          dbKey: key // Delete လုပ်ချင်ရင် သုံးဖို့ ID သိမ်းထားခြင်း
        }));
        setCustomTasks(tasksArray);
      }
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  // Admin မှ Task အသစ်တိုးခြင်း (Firebase သို့ တိုက်ရိုက်သိမ်းသည်)
  const handleAddAdminTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("အချက်အလက် အကုန်ဖြည့်ပါ။");
    
    const taskId = 'task_' + Date.now();
    const newTaskObj = { 
        id: taskId, 
        name: adminTask.name, 
        link: adminTask.link, 
        type: adminTask.type,
        reward: 0.001 // ပုံမှန် Reward သတ်မှတ်ချက်
    };

    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskObj)
      });
      
      // Update UI
      setCustomTasks(prev => [...prev, newTaskObj]);
      setAdminTask({ name: '', link: '', type: 'bot' });
      alert("Task အသစ်ကို အောင်မြင်စွာ တိုးလိုက်ပါပြီ။ User အားလုံးဆီမှာ ပေါ်နေပါပြီ။");
    } catch (e) { 
      alert("Error: Server သို့ မပို့နိုင်ပါ။"); 
    }
  };

  // Task များကို ဖျက်လိုပါက (Admin Only)
  const handleDeleteTask = async (dbKey) => {
    if(!window.confirm("ဒီ Task ကို ဖျက်မှာ သေချာလား?")) return;
    try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${dbKey}.json`, { method: 'DELETE' });
        setCustomTasks(customTasks.filter(t => t.dbKey !== dbKey));
    } catch (e) { alert("Delete Error"); }
  };

  // --- အခြားသော Function များ (Ads, Withdraw, Rewards) ---
  // (ယခင် Code အတိုင်း မပြောင်းလဲဘဲ ထားရှိပါသည်)
  const runWithRewardAd = () => { /* ...ယခင်အတိုင်း... */ };
  const runWithNavAd = (cb) => { if(window.Adsgram) { window.Adsgram.init({blockId:APP_CONFIG.ADSGRAM_BLOCK_ID}).show().then(cb).catch(cb); } else { cb(); } };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    runWithNavAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      if (link) window.open(link, '_blank');
      alert(`Claimed! +${reward} TON`);
    });
  };

  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_gm', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
  ];

  const allBotTasks = [...defaultBots, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [
    { id: 's_ch1', name: "@easytonfree", link: "https://t.me/easytonfree" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>CURRENT BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● ACTIVE STATUS</div>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && allBotTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px'}}>START</button></div>
            ))}
            
            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{marginTop:0}}>ADD NEW TASK (FOR ALL USERS)</h3>
                <input style={styles.input} placeholder="Task Name (e.g. My Channel)" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link (https://...)" value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={{...styles.input, appearance:'auto'}} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, backgroundColor:'#10b981'}} onClick={handleAddAdminTask}>ADD TASK NOW</button>
                
                <hr/>
                <h4>MANAGE CUSTOM TASKS</h4>
                {customTasks.map(t => (
                    <div key={t.id} style={styles.row}>
                        <span>{t.name} ({t.type})</span>
                        <button onClick={() => handleDeleteTask(t.dbKey)} style={{background:'red', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px'}}>DEL</button>
                    </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Other Nav Sections (Invite, Withdraw, Profile) */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontWeight:'bold'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
