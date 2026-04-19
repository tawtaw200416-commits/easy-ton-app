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
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0.0000);
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
      if (tasksData) {
        const tList = Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key }));
        setCustomTasks(tList);
      }
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  // Admin Actions
  const handleAddAdminTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("Task အချက်အလက်ဖြည့်ပါ။");
    const taskId = 'task_' + Date.now();
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
        method: 'PUT',
        body: JSON.stringify({ ...adminTask, id: taskId })
      });
      alert("Task အသစ်ထည့်ပြီးပါပြီ။");
      setAdminTask({ name: '', link: '', type: 'bot' });
      fetchData();
    } catch (e) { alert("Error!"); }
  };

  const handleDeleteTask = async (fbKey) => {
    if(!window.confirm("ဖျက်မှာ သေချာလား?")) return;
    await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${fbKey}.json`, { method: 'DELETE' });
    fetchData();
  };

  // Reward Logic
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;
    
    // UI Update (နှိပ်လိုက်တာနဲ့ ပေါင်းပေးမယ်)
    const newBal = Number((balance + reward).toFixed(5));
    const newComp = [...completed, id];
    setBalance(newBal);
    setCompleted(newComp);

    // Firebase Update
    fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
      method: 'PATCH',
      body: JSON.stringify({ balance: newBal, completed: newComp })
    });

    if (link) window.open(link, '_blank');
    alert(`Success! +${reward} TON`);
  };

  // Task Lists
  const botTasks = [
    { id: 'bot_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 'soc_1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 'soc_2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 'soc_3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 'soc_4', name: "@M9460", link: "https://t.me/M9460" },
    { id: 'soc_5', name: "@USDTcloudminer_channel", link: "https://t.me/USDTcloudminer_channel" },
    { id: 'soc_6', name: "@ADS_TON1", link: "https://t.me/ADS_TON1" },
    { id: 'soc_7', name: "@goblincrypto", link: "https://t.me/goblincrypto" },
    { id: 'soc_8', name: "@WORLDBESTCRYTO", link: "https://t.me/WORLDBESTCRYTO" },
    { id: 'soc_9', name: "@kombo_crypta", link: "https://t.me/kombo_crypta" },
    { id: 'soc_10', name: "@easytonfree", link: "https://t.me/easytonfree" },
    { id: 'soc_11', name: "@WORLDBESTCRYTO1", link: "https://t.me/WORLDBESTCRYTO1" },
    { id: 'soc_12', name: "@MONEYHUB9_69", link: "https://t.me/MONEYHUB9_69" },
    { id: 'soc_13', name: "@zrbtua", link: "https://t.me/zrbtua" },
    { id: 'soc_14', name: "@perviu1million", link: "https://t.me/perviu1million" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px', fontWeight:'bold'}}>Loading Tasks...</div>;

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
        <div style={{fontSize:10, color:'#10b981', fontWeight:'bold'}}>● SYSTEM ACTIVE</div>
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
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b style={{fontSize: '14px'}}>{t.name}</b>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button>
              </div>
            ))}
            
            {activeTab === 'social' && socialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}>
                <b style={{fontSize: '14px'}}>{t.name}</b>
                <button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '90px', padding: '8px', background:'#24A1DE'}}>JOIN</button>
              </div>
            ))}

            {activeTab === 'reward' && (
              <div>
                <input style={styles.input} placeholder="Enter Promo Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
                <button style={styles.btn} onClick={() => rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE ? handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, 0.001) : alert('Invalid Code!')}>CLAIM REWARD</button>
              </div>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h4 style={{marginTop:0}}>ADD GLOBAL TASK</h4>
                <input style={styles.input} placeholder="Task Name" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Task Link" value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={{...styles.input, appearance:'auto'}} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                  <option value="bot">BOT TASK</option>
                  <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, backgroundColor:'#10b981', marginBottom:'15px'}} onClick={handleAddAdminTask}>ADD TASK NOW</button>
                
                <h4 style={{borderTop:'1px solid #ddd', paddingTop:'10px'}}>MANAGE TASKS</h4>
                {customTasks.map(t => (
                  <div key={t.fbKey} style={styles.row}>
                    <small>{t.name}</small>
                    <button onClick={() => handleDeleteTask(t.fbKey)} style={{background:'red', color:'#fff', border:'none', padding:'4px 10px', borderRadius:'5px'}}>DEL</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* အခြား Page များ (Invite, Withdraw, Profile) ကို နဂိုအတိုင်းထားရှိပါသည် */}
      {activeNav === 'withdraw' && (
        <div style={styles.card}>
          <h3>WITHDRAW TON</h3>
          <input style={styles.input} type="number" placeholder="Amount (Min 0.1)" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <input style={styles.input} placeholder="TON Wallet Address" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} />
          <button style={{...styles.btn, background:'#3b82f6'}} onClick={() => alert("Withdraw logic processing...")}>WITHDRAW</button>
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold'}}>
            {n.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
