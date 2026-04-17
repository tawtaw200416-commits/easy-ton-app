import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  // 1793453606 နဲ့ 5020977059 နှစ်ယောက်လုံးကို Admin ပေးထားပါတယ်
  ADMINS: ["1793453606", "5020977059"],
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "1793453606", 
  ADSGRAM_BLOCK_ID: "27611", 
  FIREBASE_URL: "https://easytonfree-default-rtdb.firebaseio.com",
  ADMIN_BOT_TOKEN: "8732500858:AAFenYSvS3hZ9gB2o0lYYv9fv85KCNWguzk",
  ADMIN_CHAT_ID: "5020977059",
  HELP_BOT: "https://t.me/EasyTonHelp_Bot",
  REWARD_CODE: "EASY2",
  REWARD_AMT: 0.001
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
  const [promoForm, setPromoForm] = useState({ name: '', link: '', package: '100 Views - 0.2 TON' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [newTask, setNewTask] = useState({ name: '', link: '', type: 'bot' });
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('refs', JSON.stringify(referrals));
  }, [balance, completed, withdrawHistory, referrals]);

  const syncToFirebase = (path, data) => {
    return fetch(`${APP_CONFIG.FIREBASE_URL}/${path}.json`, {
      method: 'PATCH', // ရှိပြီးသား data ကို မဖျက်ဘဲ update လုပ်ရန်
      body: JSON.stringify(data)
    });
  };

  const sendAdminNotify = (msg) => {
    fetch(`https://api.telegram.org/bot${APP_CONFIG.ADMIN_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: APP_CONFIG.ADMIN_CHAT_ID, text: msg })
    });
  };

  // ကြော်ငြာကြည့်ပြီးမှ TON ပေါင်းမည့် Logic
  const runTaskWithAd = (callback) => {
    if (isAdLoading) return;
    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: APP_CONFIG.ADSGRAM_BLOCK_ID });
      AdController.show()
        .then((result) => { 
          setIsAdLoading(false); 
          if (callback) callback(); // ကြော်ငြာအောင်မြင်မှ TON ပေါင်းမည်
        })
        .catch((error) => { 
          setIsAdLoading(false); 
          alert("Ad failed to load. Please try again later.");
        });
    } else {
      alert("Adsgram not loaded. Please check your connection.");
    }
  };

  const handleNavChange = (newNav) => {
    if (newNav === activeNav) return;
    setActiveNav(newNav); // Nav change ရင် ကြော်ငြာမထည့်ဘဲ တန်းပြောင်းရန်
  };

  useEffect(() => {
    if (tg) { tg.ready(); tg.expand(); }
    const initApp = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refId = urlParams.get('tgWebAppStartParam');

        const [userRes, tasksRes] = await Promise.all([
          fetch(`${APP_CONFIG.FIREBASE_URL}/users/${APP_CONFIG.MY_UID}.json`),
          fetch(`${APP_CONFIG.FIREBASE_URL}/global_tasks.json`)
        ]);
        
        let userData = await userRes.json();
        const tasksData = await tasksRes.json();

        if (!userData && refId && refId !== APP_CONFIG.MY_UID) {
            const inviterRes = await fetch(`${APP_CONFIG.FIREBASE_URL}/users/${refId}.json`);
            const inviterData = await inviterRes.json();
            
            if (inviterData) {
                const newInvBal = Number((inviterData.balance + 0.001).toFixed(5));
                const newInvRefs = [...(inviterData.referrals || []), { id: APP_CONFIG.MY_UID, date: Date.now() }];
                await syncToFirebase(`users/${refId}`, { balance: newInvBal, referrals: newInvRefs });
            }
            
            userData = { balance: 0.0000, completed: [], withdrawHistory: [], referrals: [], invitedBy: refId };
            await syncToFirebase(`users/${APP_CONFIG.MY_UID}`, userData);
        }

        if (userData) {
          setBalance(Number(userData.balance || 0));
          setCompleted(userData.completed || []);
          setWithdrawHistory(userData.withdrawHistory || []);
          setReferrals(userData.referrals || []);
        }
        if (tasksData) setCustomTasks(Object.values(tasksData));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleTaskReward = (id, reward, link) => {
    if (completed.includes(id)) return alert("Already completed!");
    runTaskWithAd(() => {
      const newBal = Number((balance + reward).toFixed(5));
      const newComp = [...completed, id];
      setBalance(newBal);
      setCompleted(newComp);
      syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal, completed: newComp });
      if (link) window.open(link, '_blank');
      alert(`Claimed! +${reward} TON`);
    });
  };

  // ... (Styles မူလအတိုင်းထားပါ)

  return (
    <div style={styles.main}>
      {/* ... Header အပိုင်း ... */}

      {activeNav === 'earn' && (
        <>
          <div style={styles.card}>
            <button onClick={() => runTaskWithAd(() => {
               const newBal = Number((balance + 0.0002).toFixed(5));
               setBalance(newBal);
               syncToFirebase(`users/${APP_CONFIG.MY_UID}`, { balance: newBal });
               alert("Watched! +0.0002 TON");
            })} style={{...styles.btn, backgroundColor:'#ef4444'}}>📺 WATCH VIDEO (+0.0002 TON)</button>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
            {['BOT', 'SOCIAL', 'REWARD', 'ADMIN'].map(t => (
              (t !== 'ADMIN' || APP_CONFIG.ADMINS.includes(APP_CONFIG.MY_UID)) && (
                <button key={t} onClick={() => setActiveTab(t.toLowerCase())} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #000', backgroundColor: activeTab === t.toLowerCase() ? '#000' : '#fff', color: activeTab === t.toLowerCase() ? '#fff' : '#000', fontWeight: 'bold', fontSize: '10px' }}>{t}</button>
              )
            ))}
          </div>

          <div style={styles.card}>
            {/* ... BOT & SOCIAL Tasks ... */}

            {activeTab === 'admin' && APP_CONFIG.ADMINS.includes(APP_CONFIG.MY_UID) && (
                <div>
                    <h4 style={{marginTop:0}}>ADD SYSTEM TASK</h4>
                    <input style={styles.input} placeholder="Task Name" value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} />
                    <input style={styles.input} placeholder="Telegram Link" value={newTask.link} onChange={e => setNewTask({...newTask, link: e.target.value})} />
                    <select style={styles.input} value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                        <option value="bot">BOT TASK</option>
                        <option value="social">SOCIAL TASK</option>
                    </select>
                    <button style={styles.btn} onClick={() => {
                        if (!newTask.name || !newTask.link) return alert("Fill all fields!");
                        const id = "task_" + Date.now();
                        syncToFirebase(`global_tasks/${id}`, {...newTask, id}).then(() => {
                          alert("New Task Added!");
                          setNewTask({ name: '', link: '', type: 'bot' });
                        });
                    }}>PUBLISH TASK</button>
                </div>
            )}
          </div>
        </>
      )}
      
      {/* ... (Invite, Withdraw, Profile စသော ကျန် UI အပိုင်းများ) */}
    </div>
  );
}
