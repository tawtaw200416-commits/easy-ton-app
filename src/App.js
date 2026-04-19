import React, { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

const APP_CONFIG = {
  ADMIN_WALLET: "UQDasFrJo7PrMaJcRFivcBVVnhWNQxYG-y32EN0ZeQPRSOp9",
  MY_UID: tg?.initDataUnsafe?.user?.id?.toString() || "Guest_ID",
  // Block IDs နှစ်ခုကို Array ထဲထည့်ထားပါတယ်
  ADS_BLOCKS: ["27611", "27633"], 
  TASK_REWARD: 0.001,
  VIDEO_REWARD: 0.0005,
  REFER_REWARD: 0.001,
  REWARD_CODE: "EASY3",
  SUPPORT_BOT: "https://t.me/EasyTonHelp_Bot"
};

function App() {
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('ton_bal')) || 0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('comp_tasks')) || []);
  const [withdrawHistory, setWithdrawHistory] = useState(() => JSON.parse(localStorage.getItem('wd_hist')) || []);
  
  const [activeNav, setActiveNav] = useState('earn');
  const [activeTab, setActiveTab] = useState('social');
  
  // Admin Task States
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('admin_tasks')) || [
    { id: 's1', name: "@GrowTeaNews", link: "https://t.me/GrowTeaNews" },
    { id: 's2', name: "@GoldenMinerNews", link: "https://t.me/GoldenMinerNews" }
  ]);
  const [adminChannelName, setAdminChannelName] = useState('');
  const [adminChannelLink, setAdminChannelLink] = useState('');

  const [rewardInput, setRewardInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => { if (tg) { tg.ready(); tg.expand(); } }, []);

  useEffect(() => {
    localStorage.setItem('ton_bal', balance.toString());
    localStorage.setItem('comp_tasks', JSON.stringify(completed));
    localStorage.setItem('wd_hist', JSON.stringify(withdrawHistory));
    localStorage.setItem('admin_tasks', JSON.stringify(tasks));
  }, [balance, completed, withdrawHistory, tasks]);

  // --- Ads Logic (Randomly use Block ID 27611 or 27633) ---
  const handleActionWithAds = (reward, taskId = null, link = null) => {
    if (isAdLoading) return;
    
    // Block ID တစ်ခုကို ကျပန်းရွေးပါတယ်
    const randomBlockId = APP_CONFIG.ADS_BLOCKS[Math.floor(Math.random() * APP_CONFIG.ADS_BLOCKS.length)];

    if (window.Adsgram) {
      setIsAdLoading(true);
      const AdController = window.Adsgram.init({ blockId: randomBlockId });
      
      AdController.show()
        .then(() => {
          setIsAdLoading(false);
          setBalance(prev => Number((prev + reward).toFixed(5)));
          if (taskId) setCompleted(prev => [...prev, taskId]);
          if (link) window.open(link, '_blank');
        })
        .catch(() => {
          setIsAdLoading(false);
          alert("Ads not finished. No reward.");
        });
    } else { alert("Ads plugin error."); }
  };

  // --- Admin Task Add Function ---
  const addNewTask = () => {
    if (adminChannelName && adminChannelLink) {
      const newTask = {
        id: 'custom_' + Date.now(),
        name: adminChannelName,
        link: adminChannelLink.startsWith('http') ? adminChannelLink : `https://${adminChannelLink}`
      };
      setTasks(prev => [newTask, ...prev]);
      setAdminChannelName('');
      setAdminChannelLink('');
      alert("New Task Added Successfully!");
    } else {
      alert("Please fill both Name and Link.");
    }
  };

  const styles = {
    main: { backgroundColor: '#facc15', minHeight: '100vh', padding: '15px', paddingBottom: '100px' },
    balanceCard: { background: 'linear-gradient(to bottom, #000, #222)', padding: '30px', borderRadius: '25px', textAlign: 'center', marginBottom: '20px', color: '#fff' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', marginBottom: '10px', border: '3px solid #000' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #000', marginBottom: '10px', boxSizing: 'border-box' },
    blackBtn: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', borderRadius: '10px', fontWeight: 'bold', border: 'none' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }
  };

  return (
    <div style={styles.main}>
      <div style={styles.balanceCard}>
        <small style={{ color: '#facc15' }}>TOTAL BALANCE</small>
        <h1 style={{ fontSize: '40px' }}>{balance.toFixed(5)} <span style={{fontSize:'15px'}}>TON</span></h1>
      </div>

      {activeNav === 'earn' && (
        <>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            {['bot', 'social', 'admin'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: '10px', background: activeTab === t ? '#000' : '#fff', color: activeTab === t ? '#fff' : '#000', borderRadius: '10px', border: '2px solid #000', fontWeight: 'bold' }}>{t.toUpperCase()}</button>
            ))}
          </div>

          <div style={styles.card}>
            {activeTab === 'admin' ? (
              <div>
                <h4 style={{marginTop: 0}}>+ ADMIN: ADD NEW TASK</h4>
                <input style={styles.input} placeholder="Channel Name (e.g. @MyChannel)" value={adminChannelName} onChange={(e) => setAdminChannelName(e.target.value)} />
                <input style={styles.input} placeholder="Channel Link" value={adminChannelLink} onChange={(e) => setAdminChannelLink(e.target.value)} />
                <button style={{...styles.blackBtn, background: '#22c55e'}} onClick={addNewTask}>SAVE NEW TASK</button>
              </div>
            ) : (
              <>
                {activeTab === 'social' && tasks.filter(t => !completed.includes(t.id)).map(t => (
                  <div key={t.id} style={styles.row}>
                    <b>{t.name}</b>
                    <button onClick={() => handleActionWithAds(APP_CONFIG.TASK_REWARD, t.id, t.link)} style={{...styles.blackBtn, width: '80px'}}>JOIN</button>
                  </div>
                ))}
                
                {activeTab === 'bot' && (
                  <div style={{textAlign:'center'}}>
                    <p>Bot tasks list loading...</p>
                    <button onClick={() => handleActionWithAds(APP_CONFIG.VIDEO_REWARD)} style={styles.blackBtn}>📺 WATCH VIDEO FOR REWARD</button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#000', display: 'flex', justifyContent: 'space-around', padding: '15px 0' }}>
        {['earn', 'invite', 'withdraw', 'profile'].map(n => (
          <div key={n} onClick={() => setActiveNav(n)} style={{ color: activeNav === n ? '#facc15' : '#fff', fontSize: '12px', fontWeight: 'bold' }}>{n.toUpperCase()}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
