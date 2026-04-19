import React, { useState, useEffect, useCallback } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606",
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY3",
  MIN_WITHDRAW: 0.1,
  REF_REWARD: 0.001,
  TASK_REWARD: 0.001,
  WATCH_REWARD: 0.0005 
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
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  
  // --- Admin & User Submit States ---
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });
  const [userSubmit, setUserSubmit] = useState({ name: '', link: '' });

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
        setCustomTasks(Object.keys(tasksData).map(key => ({ ...tasksData[key], fbKey: key })));
      }
    } catch (e) { console.error("Sync Error:", e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    fetchData();
  }, [fetchData]);

  const runWithAd = (onSuccess) => {
    if (window.Adsgram) {
      window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID }).show()
        .then(() => onSuccess())
        .catch(() => alert("Watch the full ad to proceed!"));
    } else { onSuccess(); }
  };

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return;
    runWithAd(() => {
      if (tg && link.includes('t.me/')) { tg.openTelegramLink(link); } else { window.open(link, '_blank'); }
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });
      alert(`Complete! +${reward} TON`);
    });
  };

  // --- Admin Task Add Logic ---
  const adminAddTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("Please fill all Admin fields");
    runWithAd(async () => {
      try {
        await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`, {
          method: 'POST',
          body: JSON.stringify({ ...adminTask, id: 'custom_' + Date.now() })
        });
        alert("Task added successfully to Global List!");
        setAdminTask({ name: '', link: '', type: 'bot' });
        fetchData();
      } catch (e) { alert("Error adding task"); }
    });
  };

  // --- User Channel Submit Logic ---
  const userSubmitChannel = () => {
    if (!userSubmit.name || !userSubmit.link) return alert("Please fill Name and Link");
    runWithAd(() => {
      const logData = btoa(unescape(encodeURIComponent(`New Channel Submit: Name: ${userSubmit.name}, Link: ${userSubmit.link}`)));
      if (tg) tg.openTelegramLink(`${APP_CONFIG.HELP_BOT}?start=submit_${logData}`);
      alert("Submission sent to Support/Admin!");
      setUserSubmit({ name: '', link: '' });
    });
  };

  const botTasks = [
    { id: 'bot_new_1', name: "Grow Tea Bot", link: "https://t.me/GrowTeaBot/app?startapp=1793453606" },
    { id: 'bot_new_2', name: "Golden Miner Bot", link: "https://t.me/GoldenMinerBot/app?startapp=ref_3A790DBD" },
    { id: 'bot_new_3', name: "Workers On TON", link: "https://t.me/WorkersOnTonBot/app?startapp=r_1793453606" },
    { id: 'bot_new_4', name: "Easy Bonus Bot", link: "https://t.me/easybonuscode_bot?start=1793453606" },
    { id: 'bot_new_5', name: "Ton Dragon Bot", link: "https://t.me/TonDragonBot/myapp?startapp=1793453606" },
    { id: 'bot_new_6', name: "Pobuzz Bot", link: "https://t.me/Pobuzzbot/app?startapp=1793453606" },
    ...customTasks.filter(t => t.type === 'bot')
  ];

  const socialTasks = [
    { id: 's_1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's_2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" },
    { id: 's_3', name: "@cryptogold_online_official", link: "https://t.me/cryptogold_online_official" },
    { id: 's_4', name: "@M9460", link: "https://t.me/M9460" },
    ...customTasks.filter(t => t.type === 'social')
  ];

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '120px', fontFamily: 'sans-serif' },
    header: { textAlign: 'center', background: 'linear-gradient(135deg, #000, #1e293b)', padding: '25px', borderRadius: '25px', marginBottom: '20px', border: '4px solid #fff' },
    card: { backgroundColor: '#fff', padding: '18px', borderRadius: '20px', marginBottom: '12px', border: '2px solid #000', boxShadow: '4px 4px 0px #000' },
    btn: { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' },
    nav: { position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', backgroundColor: '#000', borderTop: '4px solid #fff', padding: '15px 0' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box', fontSize: '14px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <small style={{ color: '#facc15', letterSpacing: '1px' }}>YOUR BALANCE</small>
        <h1 style={{ color: '#fff', fontSize: '42px', margin: '5px 0' }}>{balance.toFixed(5)} <span style={{fontSize:16, color:'#facc15'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
               (t !== 'ADMIN' || APP_CONFIG.MY_UID === "1793453606") && (
                <button key={t} onClick={() => runWithAd(() => setActiveTab(t.toLowerCase()))} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight:'bold', border:'2px solid #000'}}>{t}</button>
               )
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'bot' && botTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && (
              <>
                <div style={{paddingBottom: 15, borderBottom: '2px solid #000', marginBottom: 15}}>
                  <h4 style={{margin: '0 0 10px 0'}}>+ Add Your Channel</h4>
                  <input style={styles.input} placeholder="Channel Name" value={userSubmit.name} onChange={e => setUserSubmit({...userSubmit, name: e.target.value})} />
                  <input style={styles.input} placeholder="Link (https://t.me/...)" value={userSubmit.link} onChange={e => setUserSubmit({...userSubmit, link: e.target.value})} />
                  <button style={{...styles.btn, background: '#10b981'}} onClick={userSubmitChannel}>SUBMIT TO ADMIN</button>
                </div>
                {socialTasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, APP_CONFIG.TASK_REWARD, t.link)} style={{...styles.btn, width: '90px', padding: '8px'}}>JOIN</button></div>
                ))}
              </>
            )}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{margin: '0 0 15px 0', textAlign: 'center'}}>ADMIN PANEL</h3>
                <input style={styles.input} placeholder="Task Name" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Link" value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={styles.input} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
                   <option value="bot">BOT TASK</option>
                   <option value="social">SOCIAL TASK</option>
                </select>
                <button style={{...styles.btn, background: '#3b82f6'}} onClick={adminAddTask}>CONFIRM ADD TASK</button>
              </div>
            )}

            {activeTab === 'reward' && (
              <div><input style={styles.input} placeholder="Enter Code" value={rewardCode} onChange={e => setRewardCode(e.target.value)} />
              <button style={styles.btn} onClick={() => runWithAd(() => { rewardCode.toUpperCase() === APP_CONFIG.REWARD_CODE ? handleTaskReward('code_'+APP_CONFIG.REWARD_CODE, 0.001) : alert('Invalid Code!'); })}>CLAIM</button></div>
            )}
          </div>
        </>
      )}

      {/* Footer Navigation */}
      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithAd(() => setActiveNav(n))} style={{flex:1, textAlign:'center', color: activeNav === n ? '#facc15' : '#fff', fontSize:'12px', fontWeight:'bold', cursor:'pointer'}}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
