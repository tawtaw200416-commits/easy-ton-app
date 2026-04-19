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
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: '', link: '' });
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [adminTask, setAdminTask] = useState({ name: '', link: '', type: 'bot' });

  // LocalStorage Sync (Data မပျောက်စေရန်)
  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  // Firebase Data Fetching
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
        
        // Referral History ကို Object ကနေ Array ပြောင်းပြီး မှန်ကန်စွာ ပြသခြင်း
        if (userData.referrals) {
          const refList = typeof userData.referrals === 'object' && !Array.isArray(userData.referrals)
            ? Object.keys(userData.referrals).map(key => ({ id: key, ...userData.referrals[key] }))
            : userData.referrals;
          setReferrals(refList);
        }
      }

      if (tasksData) {
        // Global Task များကို Array Format ပြောင်းလဲခြင်း
        const loadedTasks = Object.keys(tasksData).map(key => ({
          ...tasksData[key],
          id: key
        }));
        setCustomTasks(loadedTasks);
      }
    } catch (e) { 
      console.error("Sync Error:", e); 
    } finally {
      setLoading(false);
    }
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

  // Task လုပ်ပြီး Rewards ရယူခြင်း
  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    runWithNavAd(async () => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      
      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, completed: newComp })
      });

      if (link) window.open(link, '_blank');
      alert(`Claimed! +${reward} TON`);
    });
  };

  // Admin မှ Task အသစ်ထည့်ခြင်း (UI တွင် ချက်ချင်းပေါ်စေရန် ပြင်ဆင်ထားသည်)
  const handleAddAdminTask = async () => {
    if (!adminTask.name || !adminTask.link) return alert("အချက်အလက် အကုန်ဖြည့်ပါ။");
    const taskId = 'task_' + Date.now();
    const newTaskObj = { ...adminTask, id: taskId };
    
    try {
      await fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks/${taskId}.json`, {
        method: 'PUT',
        body: JSON.stringify(newTaskObj)
      });
      
      // UI တွင် ချက်ချင်း Update ဖြစ်စေရန်
      setCustomTasks(prev => [...prev, newTaskObj]);
      setAdminTask({ name: '', link: '', type: 'bot' });
      alert("Task အသစ်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။");
    } catch (e) { 
      alert("Error: Server သို့ မပို့နိုင်ပါ။"); 
    }
  };

  const handleWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (amt < APP_CONFIG.MIN_WITHDRAW) return alert(`Minimum Withdraw is ${APP_CONFIG.MIN_WITHDRAW} TON`);
    if (amt > balance) return alert("Insufficient Balance!");
    if (!withdrawAddress) return alert("Enter Wallet Address!");

    runWithNavAd(async () => {
      const newBal = Number((balance - amt).toFixed(5));
      const newHistory = [{
        amount: amt,
        address: withdrawAddress,
        status: 'Pending',
        date: new Date().toLocaleString()
      }, ...withdrawHistory];

      setBalance(newBal);
      setWithdrawHistory(newHistory);
      setWithdrawAmount('');

      await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBal, withdrawHistory: newHistory })
      });
      alert("Withdraw Request Sent!");
    });
  };

  // Default Tasks
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

  if (loading) return <div style={{textAlign:'center', marginTop:'50px', fontWeight:'bold'}}>SYNCING DATA...</div>;

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
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>START</button></div>
            ))}
            
            {activeTab === 'social' && allSocialTasks.filter(t => !completed.includes(t.id)).map(t => (
              <div key={t.id} style={styles.row}><b>{t.name}</b><button onClick={() => handleTaskReward(t.id, 0.001, t.link)} style={{...styles.btn, width: '80px', padding: '8px'}}>JOIN</button></div>
            ))}

            {activeTab === 'admin' && APP_CONFIG.MY_UID === "1793453606" && (
              <div>
                <h3 style={{marginTop:0}}>ADD GLOBAL TASK</h3>
                <input style={styles.input} placeholder="Task Name" value={adminTask.name} onChange={e => setAdminTask({...adminTask, name: e.target.value})} />
                <input style={styles.input} placeholder="Task Link" value={adminTask.link} onChange={e => setAdminTask({...adminTask, link: e.target.value})} />
                <select style={{...styles.input, appearance:'auto'}} value={adminTask.type} onChange={e => setAdminTask({...adminTask, type: e.target.value})}>
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
          <h3>INVITE FRIENDS</h3>
          <p style={{fontSize:'14px', color:'#666'}}>Get <b>0.001 TON</b> for each friend!</p>
          <div style={{background:'#eee', padding:'15px', borderRadius:'10px', wordBreak:'break-all', marginBottom:'10px', border:'1px dashed #000', fontSize: '13px'}}>
            https://t.me/EasyTONFree_Bot?start={APP_CONFIG.MY_UID}
          </div>
          <button style={{...styles.btn, marginBottom: '20px'}} onClick={() => {navigator.clipboard.writeText(`https://t.me/EasyTONFree_Bot?start=${APP_CONFIG.MY_UID}`); alert('Copied!');}}>COPY LINK</button>
          
          <h4>INVITE HISTORY ({referrals.length})</h4>
          {referrals.length > 0 ? (
            referrals.map((ref, idx) => (
              <div key={idx} style={styles.row}>
                <div style={{fontSize:'13px'}}>
                  <b>ID: {ref.uid || ref.id}</b>
                  <br/><small style={{color:'#666'}}>{ref.date || "Just now"}</small>
                </div>
                <div style={{color:'#10b981', fontWeight:'bold', fontSize:'12px'}}>● COMPLETE</div>
              </div>
            ))
          ) : (
            <p style={{textAlign:'center', fontSize:'12px', color:'#999'}}>No referrals yet.</p>
          )}
        </div>
      )}

      <div style={styles.nav}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => runWithNavAd(() => setActiveNav(n))} style={styles.navItem(activeNav === n)}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
