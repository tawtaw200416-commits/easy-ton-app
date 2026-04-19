import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
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
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  const [referrals, setReferrals] = useState(() => JSON.parse(localStorage.getItem('refs')) || []);
  const [customTasks, setCustomTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('bot');
  const [rewardCode, setRewardCode] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });

  // LocalStorage Sync
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // Firebase မှ Data ဖတ်ယူခြင်း (Referral History ပါအောင် ပြင်ထားသည်)
  const fetchUserData = useCallback(async () => {
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
        
        // Referral Data ကို Array format ပြောင်းခြင်း
        if (userData.referrals) {
          const refArray = Object.keys(userData.referrals).map(key => ({
            id: key,
            ...userData.referrals[key]
          }));
          setReferrals(refArray);
        }
      }
      if (tasksData) setCustomTasks(Object.values(tasksData));
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchUserData();
  }, [fetchUserData]);

  const runWithNavAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch(() => onSuccess());
    } else { onSuccess(); }
  };

  // Task လုပ်ပြီးရင် Balance နဲ့ Task စာရင်း Firebase မှာ Update လုပ်ခြင်း
  const handleTaskReward = async (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    
    runWithNavAd(async () => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      
      try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
          method: 'PATCH',
          body: JSON.stringify({ balance: newBal, completed: newComp })
        });
        setBalance(newBal);
        setCompleted(newComp);
        if (link) window.open(link, '_blank');
        alert(`Claimed! +${reward} TON`);
      } catch (e) { alert("Error updating reward."); }
    });
  };

  // Admin ကိုယ်တိုင် Global Task အသစ်တိုးခြင်း
  const handleAddAdminTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("အချက်အလက် အကုန်ဖြည့်ပါ။");
    const taskId = 'task_' + Date.now();
    const newTaskObj = { ...adminTask, id: taskId };
    
    try {
      const response = await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
        method: 'PUT',
        body: JSON.stringify(newTaskObj)
      });
      
      if(response.ok) {
        setCustomTasks(prev => [...prev, newTaskObj]); // UI မှာ ချက်ချင်းတိုးအောင်လုပ်
        setAdminTask({ name: '', link: '', type: 'bot' });
        alert("Global Task အသစ် ထည့်ပြီးပါပြီ။");
      }
    } catch (e) { alert("Server Error!"); }
  };

  const defaultBots = [
    { id: 'b_gt', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'b_wt', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" }
  ];

  const allBotTasks = [...defaultBots, ...customTasks.filter(t => t.type === 'bot')];
  const allSocialTasks = [...customTasks.filter(t => t.type === 'social')];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    navItem: (active) => ({ flex: 1, textAlign: 'center', color: active ? '#facc15' : '#fff', fontSize: '12px', fontWeight: 'bold' }),
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>SYNCING...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15' }}>MY BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981'}}>● SERVER CONNECTED</div>
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
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && allSocialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
            ))}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <input style={styles.input} placeholder="Task Name" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Task Link" value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={styles.input} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, backgroundColor:'#10b981'}} onClick={handleAddAdminTask}>ADD TASK NOW</button>
              </div>
            )}
          </div>
        </>
      )}

      {activeNav === 'invite' && (
        <div style={styles.card}>
          <h3>INVITE HISTORY</h3>
          <p style={{fontSize:12, marginBottom:15}}>Referral Link: <br/>https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}</p>
          <button style={{...styles.btn, marginBottom:20}} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert('Link Copied!');}}>COPY LINK</button>
          
          {referrals.length > 0 ? referrals.map((ref, idx) => (
            <div key={idx} style={styles.row}>
              <span>ID: <b>{ref.id}</b></span>
              <span style={{color:'#10b981', fontWeight:'bold'}}>● COMPLETED</span>
            </div>
          )) : <p style={{textAlign:'center', fontSize:12, color:'#999'}}>No referrals yet.</p>}
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
